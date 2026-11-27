const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const worker = fs.readFileSync(path.join(root, 'public', 'sw.js'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'public', 'manifest.webmanifest'), 'utf8'));

function appScript() {
  const start = html.indexOf('<script>') + '<script>'.length;
  const end = html.indexOf('</script>', start);
  assert.ok(start >= '<script>'.length && end > start, 'brak głównego skryptu aplikacji');
  return html.slice(start, end);
}

test('Asystent Nauki ma wszystkie główne widoki i działającą nawigację', () => {
  for (const page of ['home', 'subjects', 'calendar', 'plan', 'tests', 'print', 'settings']) {
    assert.ok(html.includes('id="page-' + page + '"'), 'brak widoku: ' + page);
    assert.ok(html.includes('data-page="' + page + '"'), 'brak nawigacji: ' + page);
  }
  assert.doesNotThrow(() => new vm.Script(appScript()));
});

test('manifest PWA opisuje Asystenta Nauki, a service worker ma poprawną składnię', () => {
  assert.equal(manifest.name, 'Asystent Nauki');
  assert.equal(manifest.display, 'standalone');
  assert.ok(manifest.icons.some(icon => icon.src === '/icon.svg'));
  assert.doesNotThrow(() => new vm.Script(worker));
  assert.ok(worker.includes('request.mode==="navigate"'));
  assert.ok(worker.includes('self.clients.claim()'));
});

test('parser testów rozpoznaje pytania, odpowiedzi i wyjaśnienia', () => {
  const start = appScript().indexOf('function parseQuiz(');
  const end = appScript().indexOf('\nlet activeQuiz', start);
  assert.ok(start >= 0 && end > start, 'brak parsera testów');
  const parserSource = appScript().slice(start, end);
  const parseQuiz = new Function(parserSource + '; return parseQuiz;')();
  const questions = parseQuiz([
    'Pytanie: Stolica Polski?',
    'A) Kraków',
    'B) Warszawa',
    'C) Gdańsk',
    'Poprawna: B',
    'Wyjaśnienie: Warszawa jest stolicą Polski.',
    '2. Ile to 2+2?',
    'A) 3',
    'B) 4',
    'C) 5',
    'Odpowiedź: B'
  ].join('\n'));
  assert.equal(questions.length, 2);
  assert.equal(questions[0].answer, 'B');
  assert.match(questions[0].explanation, /stolicą Polski/);
  assert.equal(questions[1].question, 'Ile to 2+2?');
  assert.equal(questions[1].answer, 'B');
  assert.equal(parseQuiz('To nie jest test').length, 0);
});

test('aplikacja zawiera kalendarz, adaptacyjny plan, drukowanie i kopie JSON', () => {
  for (const marker of [
    'function renderCalendar()', 'function generatePlan(ev)', 'function moveOverdue()',
    'function printContent()', 'asystent-nauki-kopia.json',
    'function notifyDue()', 'Notification.requestPermission()',
    'function renderTestHistory()', 'id="testArea"', 'id="monthGrid"'
  ]) assert.ok(html.includes(marker), 'brak funkcji: ' + marker);
  assert.ok(html.includes("localStorage.setItem(KEY"));
  assert.ok(html.includes("localStorage.getItem(KEY"));
});

test('build kopiuje aplikację i zasoby publiczne do katalogu dist', () => {
  const build = fs.readFileSync(path.join(root, 'build.js'), 'utf8');
  assert.ok(build.startsWith('import { cpSync, mkdirSync, rmSync }'));
  assert.ok(build.includes('cpSync("index.html", "dist/index.html")'));
  assert.ok(build.includes('cpSync("public", "dist"'));
  const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
  assert.equal(config.outputDirectory, 'dist');
});

test('aplikacja nie wymaga zewnętrznego API AI ani zależności SDK', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  assert.deepEqual(Object.keys(pkg.dependencies || {}), []);
  assert.ok(!/api\.(openai|anthropic)\.com|generativelanguage\.googleapis\.com/i.test(html));
});
