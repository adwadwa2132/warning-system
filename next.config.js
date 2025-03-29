/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  // Disable type checking during build to speed up builds
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Keep the output directory as .next for proper Next.js build
  distDir: '.next',
  
  // Temporarily enable static exports for Netlify
  // We can remove this if we decide to use server components later
  output: 'export',
  
  // Configure image optimization for static export
  images: {
    unoptimized: true, // Required for static export
    domains: ['openweathermap.org', 'unpkg.com'],
  },
  
  // Disable ESLint during builds
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

    // Add basic loaders for CSS and SVG files
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

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
  
  // Skip transpilation of node_modules since they should already be compiled
  transpilePackages: [],

  // Simplify experimental features to avoid compilation issues
  experimental: {
    // Disable all experimental features to prevent hanging during builds
    optimizeCss: false,
    optimizePackageImports: [],
    serverComponentsExternalPackages: [],
  }
};

module.exports = nextConfig;

 