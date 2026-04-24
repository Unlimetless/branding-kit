/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@brandflow/ui', '@brandflow/i18n', '@brandflow/auth'],
  typedRoutes: true,
  output: 'standalone',
}

module.exports = nextConfig