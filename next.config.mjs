/** @type {import('next').NextConfig} */
const nextConfig = {
  output:'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  assetPrefix: '',
  basePath: '',
  trailingSlash: true,
}

export default nextConfig
