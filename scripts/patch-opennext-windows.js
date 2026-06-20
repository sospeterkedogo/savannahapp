const fs = require('fs');
const path = require('path');

const target = path.join(
  __dirname,
  '..',
  'node_modules',
  '@opennextjs',
  'aws',
  'dist',
  'build',
  'copyTracedFiles.js'
);

if (!fs.existsSync(target)) {
  console.warn('OpenNext copyTracedFiles.js not found; skipping Windows patch.');
  process.exit(0);
}

let source = fs.readFileSync(target, 'utf8');
const marker = 'OPENNEXT_WINDOWS_SYMLINK_FALLBACK';

if (!source.includes('function copyWithoutSymlinks(')) {
  const helper = `
function copyWithoutSymlinks(from, to) {
    const stat = statSync(from);
    if (stat.isDirectory()) {
        mkdirSync(to, { recursive: true });
        for (const entry of readdirSync(from)) {
            copyWithoutSymlinks(path.join(from, entry), path.join(to, entry));
        }
        return;
    }
    mkdirSync(path.dirname(to), { recursive: true });
    copyFileAndMakeOwnerWritable(from, to);
}
`;

  source = source.replace(
    'const __dirname = url.fileURLToPath(new URL(".", import.meta.url));',
    `const __dirname = url.fileURLToPath(new URL(".", import.meta.url));${helper}`
  );
}

const patchedBlock = `        if (symlink) {
            try {
                symlinkSync(symlink, to);
            }
            catch (e) {
                if (e.code === "EEXIST") {
                    // Ignore existing symlink targets.
                } else if (e.code === "EPERM" || e.code === "ENOTSUP") {
                    // ${marker}
                    const resolvedFrom = path.isAbsolute(symlink)
                        ? symlink
                        : path.resolve(path.dirname(from), symlink);
                    copyWithoutSymlinks(resolvedFrom, to);
                } else {
                    throw e;
                }
            }
        }`;

const originalBlock = `        if (symlink) {
            try {
                symlinkSync(symlink, to);
            }
            catch (e) {
                if (e.code !== "EEXIST") {
                    throw e;
                }
            }
        }`;

if (source.includes(patchedBlock)) {
  process.exit(0);
}

if (source.includes('cpSync(from, to, { recursive: true, force: true });')) {
  source = source.replace(
    /        if \(symlink\) \{[\s\S]*?        \}\n        else \{/,
    `${patchedBlock}
        else {`
  );
} else if (source.includes(originalBlock)) {
  source = source.replace(originalBlock, patchedBlock);
} else {
  console.warn('OpenNext copyTracedFiles.js changed upstream; Windows patch not applied.');
  process.exit(0);
}

fs.writeFileSync(target, source);
console.log('Applied OpenNext Windows symlink fallback patch.');
