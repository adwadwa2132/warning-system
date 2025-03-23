/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  // Disable type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Enable static exports 
  output: 'standalone',
  
  // Allow images from external domains
  images: {
    domains: ['openweathermap.org'],
    unoptimized: true,
  },
  
  // Disable ESLint
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Configure webpack to handle SVG files and path aliases
  webpack(config) {
    // SVG handling
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // Explicitly set up path aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
      'leaflet': path.resolve(__dirname, 'node_modules/leaflet'),
      'leaflet-draw': path.resolve(__dirname, 'node_modules/leaflet-draw'),
    };
    
    return config;
  },
  
  // External modules that should be transpiled
  transpilePackages: ['react-leaflet', 'leaflet', 'leaflet-draw'],
  
  // Disable CSS modules since we're loading CSS from CDN
  cssModules: false,
};

module.exports = nextConfig;

 