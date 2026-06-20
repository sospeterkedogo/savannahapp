/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rqazxvcanqiurjlrtkpz.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

module.exports = nextConfig;

const { initOpenNextCloudflareForDev } = require('@opennextjs/cloudflare');
initOpenNextCloudflareForDev();
