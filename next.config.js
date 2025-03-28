/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  // Disable type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Set the output directory 
  distDir: '.next',
  
  // Remove export setting to allow server-side rendering
  // output: 'export', // Static HTML export was causing issues
  
  // Configure image optimization for Netlify
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.openweathermap.org',
      },
      {
        protocol: 'https',
        hostname: 'unpkg.com',
      }
    ],
    // Fallback if sharp isn't available in Netlify functions
    minimumCacheTTL: 60,
    formats: ['image/avif', 'image/webp'],
  },
  
  // Disable ESLint
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable SWC compiler which is causing hangs
  swcMinify: false,
  
  // Configure webpack with minimal settings
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

 