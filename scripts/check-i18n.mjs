/**
 * Ensures every data-i18n / data-i18n-alt key used in HTML exists in i18n/pt.ts.
 * Run after editing copy: npm run check:i18n
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ptSource = readFileSync(join(root, 'i18n/pt.ts'), 'utf8');

const defined = new Set(
  [...ptSource.matchAll(/^\s{2}([a-z0-9_]+):/gm)].map((m) => m[1]),
);

const htmlFiles = readdirSync(root).filter((f) => f.endsWith('.html'));
const used = new Set();
const attrRe = /data-i18n(?:-alt)?=["']([a-z0-9_]+)["']/g;

for (const file of htmlFiles) {
  const html = readFileSync(join(root, file), 'utf8');
  for (const m of html.matchAll(attrRe)) used.add(m[1]);
}

const missing = [...used].filter((k) => !defined.has(k)).sort();
const unused = [...defined].filter((k) => !used.has(k)).sort();

if (missing.length) {
  console.error('❌ HTML uses i18n keys missing from i18n/pt.ts:');
  for (const k of missing) console.error('  -', k);
  process.exit(1);
}

console.log(`✓ ${used.size} i18n keys used in HTML — all defined in pt.ts`);
if (unused.length) {
  console.log(`ℹ ${unused.length} keys defined but not used in HTML yet:`);
  for (const k of unused) console.log('  -', k);
}
