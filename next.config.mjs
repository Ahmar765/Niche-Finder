import withPWA from 'next-pwa';
import { firebaseEnvFromHosting } from './src/firebase/next-env.mjs';

const firebaseEnv = firebaseEnvFromHosting();

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...pwaConfig,
  env: {
    ...firebaseEnv,
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
