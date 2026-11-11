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
  assert.ok(migration.includes('(select auth.uid()) = user_id'));
  assert.ok(migration.includes('jsonb_typeof(projects) = \'array\''));
  const dbTests = fs.readFileSync(path.join(root, 'supabase', 'tests', 'user_backups.test.sql'), 'utf8');
  assert.ok(dbTests.includes('row-level security is enabled'));
  assert.ok(dbTests.includes('anonymous role cannot read backups'));
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

test('local server serves the app, PWA assets, and public Supabase config', async t => {
  const { spawn } = require('node:child_process');
  const net = require('node:net');
  const probe = net.createServer();
  await new Promise(resolve => probe.listen(0, '127.0.0.1', resolve));
  const port = probe.address().port;
  await new Promise(resolve => probe.close(resolve));
  const child = spawn(process.execPath, ['server.js'], {
    cwd: root,
    env: { ...process.env, PORT: String(port), SUPABASE_URL: 'https://example.supabase.co', SUPABASE_ANON_KEY: 'public-test-key' },
    stdio: 'ignore'
  });
  t.after(() => child.kill());
  let response;
  for (let attempt = 0; attempt < 30; attempt++) {
    try {
      response = await fetch('http://127.0.0.1:' + port + '/');
      break;
    } catch {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  assert.ok(response, 'server did not start');
  assert.equal(response.status, 200);
  assert.match(await response.text(), /Asystent Budowania/);
  const config = await fetch('http://127.0.0.1:' + port + '/api/config.js');
  assert.equal(config.status, 200);
  const configText = await config.text();
  assert.ok(configText.includes('https://example.supabase.co'));
  assert.ok(configText.includes('public-test-key'));
  assert.ok(!configText.includes('service_role'));
  const manifest = await fetch('http://127.0.0.1:' + port + '/manifest.webmanifest');
  assert.equal(manifest.status, 200);
  assert.match(manifest.headers.get('content-type'), /manifest\+json/);
  const denied = await fetch('http://127.0.0.1:' + port + '/', { method: 'POST' });
  assert.equal(denied.status, 405);
  const privateFile = await fetch('http://127.0.0.1:' + port + '/package.json');
  assert.equal(privateFile.status, 404);
  const traversal = await fetch('http://127.0.0.1:' + port + '/%2e%2e/package.json');
  assert.equal(traversal.status, 404);
});
