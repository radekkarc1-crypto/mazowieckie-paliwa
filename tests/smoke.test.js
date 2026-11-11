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
  assert.ok(fs.existsSync(path.join(root, 'public', 'sw.js')));
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
  assert.equal(pkg.scripts.start, 'node server.js');
  assert.ok(server.includes("'X-Content-Type-Options': 'nosniff'"));
  assert.ok(server.includes("path.resolve(publicDir, relative)"));
  assert.ok(server.includes("req.method !== 'GET' && req.method !== 'HEAD'"));
});
