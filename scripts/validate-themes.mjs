/**
 * Validates theme system: dark + light only, bg & text CSS vars.
 * Usage: node scripts/validate-themes.mjs
 */
import { readFileSync } from 'node:fs';

const LEGACY_THEMES = ['midnight', 'obsidian', 'nebula', 'solar', 'relux'];
let failed = 0;

function pass(msg) {
  console.log(`  ✓ ${msg}`);
}

function fail(msg) {
  console.error(`  ✗ ${msg}`);
  failed++;
}

console.log('\n=== Theme validation (dark + light, bg & text only) ===\n');

const themeCtx = readFileSync('src/components/ThemeContext.tsx', 'utf8');
const types = readFileSync('src/types/app.ts', 'utf8');
const css = readFileSync('src/styles/globals.css', 'utf8');
const doc = readFileSync('src/pages/_document.tsx', 'utf8');

if (types.includes("'dark' | 'light'")) {
  pass('Theme type is dark | light only');
} else {
  fail('Theme type must be dark | light');
}

for (const legacy of LEGACY_THEMES) {
  if (types.includes(`'${legacy}'`)) {
    fail(`Legacy theme still in types: ${legacy}`);
  }
}

if (themeCtx.includes("['dark', 'light']")) {
  pass('ThemeContext cycles dark ↔ light only');
} else {
  fail('ThemeContext THEMES array incorrect');
}

if (themeCtx.includes('normalizeTheme') && themeCtx.includes("'solar'")) {
  pass('Legacy stored themes normalize to dark/light');
} else {
  fail('Missing legacy theme normalization');
}

for (const legacy of LEGACY_THEMES) {
  if (css.includes(`[data-theme="${legacy}"]`)) {
    fail(`Legacy CSS block still present: ${legacy}`);
  }
}

if (css.includes('[data-theme="dark"]') && css.includes('[data-theme="light"]')) {
  pass('CSS defines dark and light data-theme blocks');
} else {
  fail('Missing dark/light CSS theme blocks');
}

const lightBlock = css.match(/\[data-theme="light"\]\s*\{([^}]+)\}/s)?.[1] || '';
const darkBlock = css.match(/\[data-theme="dark"\]\s*\{([^}]+)\}/s)?.[1] || '';

for (const varName of ['--sav-bg', '--sav-text', '--vaha-bg', '--vaha-text']) {
  if (lightBlock.includes(varName) && (darkBlock.includes(varName) || css.includes(`:root`))) {
    pass(`Light theme sets ${varName}`);
  } else {
    fail(`Light theme missing ${varName}`);
  }
}

if (!lightBlock.includes('--sav-accent:') && !lightBlock.includes('--sav-accent ')) {
  pass('Light theme does not override accent (bg & text only)');
} else {
  fail('Light theme should not change accent colors');
}

if (css.includes('--vaha-text-muted') && css.includes('.text-vaha-muted')) {
  pass('Vaha text utilities wired to theme variables');
} else {
  fail('Vaha theme text overrides missing');
}

if (doc.includes("normalized = theme === 'light'")) {
  pass('_document normalizes stored theme before paint');
} else {
  fail('_document theme script needs normalization');
}

console.log(failed ? `\n=== ${failed} issue(s) ===\n` : '\n=== All theme checks passed ===\n');
process.exitCode = failed ? 1 : 0;
