/* eslint-disable @typescript-eslint/no-require-imports -- Standalone CommonJS audit tooling; exporter uses a synchronous TypeScript require hook. */
// Apply individually reviewed, exact prose strings. Never substitutes words globally.
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const document = JSON.parse(fs.readFileSync(path.join(root, 'content/english-audit/replacements.json'), 'utf8'));
const byText = new Map(document.operations.map(op => [op.from, op]));
const ledger = [];
function walk(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, item.name);
    if (item.isDirectory()) { walk(file); continue; }
    if (!/\.tsx?$/.test(file) || file.endsWith('/dictionaries/ar.ts')) continue;
    const source = fs.readFileSync(file, 'utf8');
    const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    const edits = [];
    function visit(node) {
      if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
        const op = byText.get(node.text);
        if (op) {
          const start = node.getStart(ast);
          edits.push({ start, end: node.end, replacement: JSON.stringify(op.to) });
          ledger.push({ operationId: op.id, file: path.relative(root, file), line: ast.getLineAndCharacterOfPosition(start).line + 1, from: op.from, to: op.to, category: op.category, reason: op.reason });
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(ast);
    if (edits.length) {
      let result = source;
      for (const e of edits.sort((a,b) => b.start-a.start)) result = result.slice(0,e.start)+e.replacement+result.slice(e.end);
      fs.writeFileSync(file, result);
    }
  }
}
walk(path.join(root, 'src'));
const output = process.argv[2];
if (output) fs.writeFileSync(output, JSON.stringify(ledger, null, 2));
console.log(JSON.stringify({ replacements: ledger.length, files: new Set(ledger.map(x=>x.file)).size, unmatched: document.operations.filter(op => !ledger.some(x => x.operationId===op.id)).map(x=>({id:x.id,from:x.from})) }, null, 2));
