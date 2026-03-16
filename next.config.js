/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Turbopack configuration (default in Next.js 16)
  turbopack: {
    // Turbopack handles WASM files automatically
  },
  // Webpack configuration for sql.js WASM support
  webpack: (config, { isServer }) => {
    // Handle sql.js WASM files
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };
    
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    
    return config;
  },
};

export default nextConfig;
