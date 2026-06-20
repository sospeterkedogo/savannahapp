const path = require('path');

/** @type {import('next').NextConfig} */       
const nextConfig = {
  output: 'standalone',
  images: {
    domains: [],
  },
  outputFileTracingRoot: path.join(__dirname, '../../'),
};

module.exports = nextConfig;
