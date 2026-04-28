/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@brandflow/auth', '@brandflow/i18n'],
  typedRoutes: false,
  output: 'standalone',
}

module.exports = nextConfig