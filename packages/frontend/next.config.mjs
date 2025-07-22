/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['@libsql/client', 'drizzle-orm', '@libsql/core', '@libsql/hrana-client', '@libsql/isomorphic-fetch'],
  transpilePackages: [], 
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push(
        ({ context, request }, callback) => {
          if (/^@libsql\//.test(request) || /^drizzle-orm/.test(request)) {
            return callback(null, `commonjs ${request}`);
          }
          if (/^\.\.\/server\/node_modules\//.test(request)) {
            return callback(null, `commonjs ${request}`);
          }
          callback();
        }
      );
    }
    return config;
  },
};

export default nextConfig
