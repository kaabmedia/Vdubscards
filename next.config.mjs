// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'midnightblue-turkey-213128.hostingersite.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
