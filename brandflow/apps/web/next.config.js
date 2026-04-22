/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@brandflow/ui', '@brandflow/i18n', '@brandflow/auth'],
  experimental: {
    typedRoutes: true,
  },
}

module.exports = nextConfig