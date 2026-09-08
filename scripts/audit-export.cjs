/* eslint-disable @typescript-eslint/no-require-imports -- Standalone CommonJS audit tooling; exporter uses a synchronous TypeScript require hook. */
// Read-only export of the actual route registry and bilingual content modules.
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = process.argv[3] ? path.resolve(process.argv[3]) : path.resolve(__dirname, '..');
const resolve = Module._resolveFilename;
Module._resolveFilename = function(request, ...args) {
  return resolve.call(this, request.startsWith('@/') ? path.join(root, 'src', request.slice(2)) : request, ...args);
};
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText, filename);
const modules = {
  routes: 'src/config/routes.ts', features: 'src/config/features.ts',
  treatments: 'src/features/aesthetics/data/treatments.ts', concerns: 'src/features/concerns/data.ts',
  technologies: 'src/features/technologies/data.ts', doctors: 'src/features/doctors/data.ts',
  medical: 'src/features/medical-services/data.ts', products: 'src/features/products/data.ts',
  home: 'src/features/home/copy.ts', dictionary: 'src/i18n/dictionaries/en.ts',
};
const data = Object.fromEntries(Object.entries(modules).map(([k, file]) => [k, require(path.join(root, file))]));
const out = process.argv[2];
if (!out) throw new Error('Output path required');
fs.writeFileSync(out, JSON.stringify(data, null, 2));
console.log(`Exported ${data.routes.routes.length} registered route definitions.`);
