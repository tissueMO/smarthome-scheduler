/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  basePath: process.env.BASE_DIR || '',
};

module.exports = nextConfig;
