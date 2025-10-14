/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    optimizePackageImports: ["next-auth"],
    outputFileTracingExcludes: {
      "**/*": ["**/export-detail.json", "**/export/**"]
    }
  }
};
module.exports = nextConfig;
