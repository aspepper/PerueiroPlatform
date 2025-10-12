/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    optimizePackageImports: ["next-auth"]
  }
};
module.exports = nextConfig;
