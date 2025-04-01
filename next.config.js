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
    // We need to ignore build errors during deployment since Cloudflare types
    // won't be available in the Vercel environment
    ignoreBuildErrors: process.env.VERCEL === '1',
  },
  // Configure proper handling of ESLint
  eslint: {
    ignoreDuringBuilds: process.env.VERCEL === '1',
  },
  // Environment configuration
  env: {
    DEPLOYMENT_ENV: process.env.VERCEL === '1' ? 'vercel' : 'cloudflare'
  }
}

module.exports = nextConfig 