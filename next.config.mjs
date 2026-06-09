import path from 'path';
import { fileURLToPath } from 'url';
import { firebaseEnvFromHosting } from './src/firebase/next-env.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const firebaseEnv = firebaseEnvFromHosting();

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname),
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
