/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["next-auth"]
  }
};
module.exports = nextConfig;
