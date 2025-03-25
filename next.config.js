/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000']
    }
  },
  // Ensure proper handling of the app router
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  // Configure proper handling of static assets
  images: {
    domains: ['localhost'],
  },
  // Ensure proper handling of the app directory
  distDir: '.next',
  // Configure proper handling of TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },
  // Configure proper handling of ESLint
  eslint: {
    ignoreDuringBuilds: false,
  }
}

module.exports = nextConfig 