import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
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
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
   webpack: (config, { isServer, buildId }) => {
    // This is to ensure our worker file is bundled correctly by Next.js/Webpack.
    if (isServer) {
        config.entry['pdf-parser-worker'] = './src/lib/pdf-parser-worker.ts';
    }
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse'],
  },
};

export default nextConfig;
