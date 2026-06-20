const { execSync } = require('child_process');

// Cloudflare Workers Builds runs `npm run build` then `wrangler deploy`.
// OpenNext needs a bundling step after `next build` to create `.open-next/`.
if (!process.env.WORKERS_CI && !process.env.CI) {
  process.exit(0);
}

execSync('npx opennextjs-cloudflare build --skipNextBuild', { stdio: 'inherit' });
