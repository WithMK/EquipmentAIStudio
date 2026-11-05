import { readdirSync, readFileSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
const root = resolve('src');
const errors = [];
function visit(dir) {
 for (const entry of readdirSync(dir, {withFileTypes:true})) {
  const file = resolve(dir, entry.name);
  if (entry.isDirectory()) { visit(file); continue; }
  if (!/\.tsx?$/.test(file)) continue;
  const source = relative(root,file).replaceAll('\\','/');
  const text = readFileSync(file,'utf8');
  for (const match of text.matchAll(/(?:from\s*|import\s*\()\s*['"]([^'"]+)['"]/g)) {
   if (!match[1].startsWith('.')) continue;
   const target = relative(root,resolve(dirname(file),match[1])).replaceAll('\\','/');
   if (source.startsWith('shared/') && /^(app|features|adapters)\//.test(target)) errors.push(`${source} -> ${target}`);
   if (source.startsWith('features/') && (/^(app|adapters)\//.test(target) || (target.startsWith('features/') && source.split('/')[1]!==target.split('/')[1]))) errors.push(`${source} -> ${target}`);
   if (source.startsWith('adapters/') && /^(app|features)\//.test(target)) errors.push(`${source} -> ${target}`);
   if (source==='app/Shell.tsx' && /^(features|adapters)\//.test(target)) errors.push(`${source} -> ${target}`);
  }
 }
}
visit(root);
if(errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('PASS module boundaries: features use contracts; Shell has no feature imports');
