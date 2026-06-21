/**
 * Validates landing page image paths exist locally or in OpenNext assets.
 * Usage: node scripts/validate-landing-images.mjs
 */
import { existsSync } from 'node:fs';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const LANDING_IMAGES = [
  '/images/bbq3.jpeg',
  '/images/grilling-p.jpg',
  '/images/burger-drinks-p.jpg',
  '/images/about-bbq.jpeg',
  '/images/about-drinks.jpeg',
  '/images/meat-w.jpg',
  '/images/bbq3.jpeg',
  '/images/logo.png',
];

function resolveAsset(webPath) {
  const relative = webPath.replace(/^\//, '');
  const candidates = [
    join('public', relative),
    join('.open-next', 'assets', relative),
  ];
  return candidates.find((p) => existsSync(p)) || null;
}

console.log('\n=== Landing page image validation ===\n');

let failed = 0;
for (const src of LANDING_IMAGES) {
  const file = resolveAsset(src);
  if (file) {
    console.log(`  ✓ ${src} → ${file}`);
  } else {
    console.error(`  ✗ ${src} — not found in public/ or .open-next/assets/`);
    failed++;
  }
}

// Also scan index.tsx for /images/ references
const indexSrc = readFileSync('src/pages/index.tsx', 'utf8');
const refs = [...indexSrc.matchAll(/['"](\/images\/[^'"]+)['"]/g)].map((m) => m[1]);
const uniqueRefs = [...new Set(refs)];

console.log(`\n  Found ${uniqueRefs.length} image refs in index.tsx`);
for (const ref of uniqueRefs) {
  if (!LANDING_IMAGES.includes(ref) && !resolveAsset(ref)) {
    console.error(`  ✗ Unlisted ref missing: ${ref}`);
    failed++;
  }
}

console.log(failed ? `\n=== ${failed} issue(s) ===\n` : '\n=== All landing images OK ===\n');
process.exitCode = failed ? 1 : 0;
