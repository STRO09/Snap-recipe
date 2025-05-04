import type {NextConfig} from 'next';


const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export', // Required for static export
  assetPrefix: isProd ? '/my-next-app/' : '', // <-- Replace with your repo name
  trailingSlash: true, // Optional but recommended for static export
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
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
