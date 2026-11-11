const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

test('application shell contains the core project workflow', () => {
  for (const marker of ['id="home"', 'id="import"', 'id="reader"', 'id="done"', 'id="backup"', 'id="restoreBackup"']) assert.ok(html.includes(marker), 'missing ' + marker);
});

test('instruction example follows version 1 contract', () => {
  const example = JSON.parse(fs.readFileSync(path.join(root, 'public', 'przykladowa-instrukcja.json'), 'utf8'));
  assert.equal(example.version, 1);
  assert.equal(typeof example.title, 'string');
  assert.ok(Array.isArray(example.steps) && example.steps.length > 0);
  for (const step of example.steps) {
    assert.equal(typeof step.title, 'string');
    assert.equal(typeof step.description, 'string');
  }
});

test('PWA manifest and offline worker are present', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'public', 'manifest.webmanifest'), 'utf8'));
  assert.equal(manifest.name, 'Asystent Budowania');
  assert.equal(manifest.display, 'standalone');
  const sw = fs.readFileSync(path.join(root, 'public', 'sw.js'), 'utf8');
  assert.ok(fs.existsSync(path.join(root, 'public', 'sw.js')));
  assert.doesNotThrow(() => new (require('node:vm').Script)(sw));
  assert.ok(sw.includes('request.mode==="navigate"'));
  assert.ok(sw.includes('url.pathname.startsWith("/api/")'));
  assert.ok(fs.existsSync(path.join(root, 'public', 'icon.svg')));
  assert.ok(html.includes('navigator.serviceWorker.register'));
});

test('the app does not include AI provider SDKs or API endpoints', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const deps = Object.keys(pkg.dependencies || {});
  assert.deepEqual(deps, []);
  assert.ok(!/api\.(openai|anthropic)\.com|generativelanguage\.googleapis\.com/i.test(html));
});

test('local development server is valid and serves public assets safely', () => {
  const vm = require('node:vm');
  const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  assert.doesNotThrow(() => new vm.Script(server));
  assert.equal(pkg.scripts.start, 'node --env-file-if-exists=.env server.js');
  assert.ok(server.includes("'X-Content-Type-Options': 'nosniff'"));
  assert.ok(server.includes("path.resolve(publicDir, relative)"));
  assert.ok(server.includes("req.method !== 'GET' && req.method !== 'HEAD'"));
});

test('application scripts compile and cloud configuration never exposes a service key', () => {
  const vm = require('node:vm');
  const start = html.indexOf('<script>') + 8;
  const end = html.indexOf('</script>', start);
  assert.ok(start >= 8 && end > start, 'missing application script');
  assert.doesNotThrow(() => new vm.Script(html.slice(start, end)));
  assert.ok(html.includes('window.supabase.createClient') || html.includes('window.supabase?.createClient'));
  const config = fs.readFileSync(path.join(root, 'api', 'config.js'), 'utf8');
  assert.ok(config.includes('SUPABASE_ANON_KEY'));
  assert.ok(!config.includes('SUPABASE_SERVICE_ROLE'));
});

test('Supabase backup migration enables row-level security and user ownership', () => {
  const migration = fs.readFileSync(path.join(root, 'supabase', 'migrations', '20261111000000_user_backups.sql'), 'utf8');
  assert.ok(migration.includes('enable row level security'));
  assert.ok(migration.includes('auth.uid() = user_id'));
  assert.ok(migration.includes('jsonb_typeof(projects) = \'array\''));
});

test('instruction import requires a preview confirmation before adding a project', () => {
  assert.ok(html.includes('id="importPreview"'));
  assert.ok(html.includes('id="confirmImport"'));
  assert.ok(html.includes('id="cancelImport"'));
  assert.ok(html.includes('pendingProject=validate'));
});

test('instruction schema matches the supported version and part formats', () => {
  const schema = JSON.parse(fs.readFileSync(path.join(root, 'public', 'instruction.schema.json'), 'utf8'));
  assert.equal(schema.properties.version.const, 1);
  assert.ok(schema.properties.steps.items.anyOf.length >= 2);
  assert.ok(schema.properties.steps.items.properties.parts.items.oneOf.length >= 2);
});

test('instruction validator accepts the sample and rejects unsafe or malformed packs', () => {
  const start = html.indexOf('function validate(');
  const end = html.indexOf('\nasync function importFile', start);
  assert.ok(start >= 0 && end > start, 'missing instruction validator');
  const source = html.slice(start, end);
  const { validate, normalizeSavedProject } = new Function(source + '; return { validate, normalizeSavedProject };')();
  const sample = JSON.parse(fs.readFileSync(path.join(root, 'public', 'przykladowa-instrukcja.json'), 'utf8'));
  assert.doesNotThrow(() => validate(sample));
  const restored = normalizeSavedProject({ title: 'Old local project', steps: [{ title: 'Step', description: 'Text' }], done: [0, 0, 9], current: 8 });
  assert.equal(restored.version, 1);
  assert.deepEqual(restored.done, [0]);
  assert.equal(restored.current, 0);
  assert.throws(() => validate({ version: 2, title: 'Bad', steps: [{ title: 'Step', description: 'Text' }] }));
  assert.throws(() => validate({ version: 1, title: 'Bad image', steps: [{ title: 'Step', description: 'Text', image: 'javascript:alert(1)' }] }));
});
