import type {NextConfig} from 'next';

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // The placeholder 'YOUR-REPO-NAME-HERE' will be automatically replaced
  // by the GitHub Actions workflow during deployment.
  // You do not need to change it manually.
  basePath: process.env.NODE_ENV === 'production' ? '/YOUR-REPO-NAME-HERE' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/YOUR-REPO-NAME-HERE/' : '',
  output: 'export',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true, // Required for static export to GitHub Pages.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
