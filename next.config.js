/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  // Disable type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Set the output directory for Netlify
  distDir: '.next',
  
  // Configure output for optimization
  output: 'export', // Static HTML export
  
  // Allow images from external domains
  images: {
    unoptimized: true, // Required for static export
  },
  
  // Disable ESLint
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable SWC compiler which is causing hangs
  swcMinify: false,
  
  // Simply configure webpack with minimal settings
  webpack: (config) => {
    // Resolve path aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
    };

    // Add fallbacks for node polyfills
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };

    return config;
  },
  
  // Disable React strict mode to prevent double mounting
  reactStrictMode: false,
  
  // Simplify experimental features to avoid compilation issues
  experimental: {
    optimizeCss: false, // Disable CSS optimization as it can cause issues
  }
};

module.exports = nextConfig;

 