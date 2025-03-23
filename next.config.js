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
    };
    
    // Handle CSS externally - don't bundle CSS
    config.module.rules.push({
      test: /\.(css)$/,
      use: ['ignore-loader'],
    });
    
    return config;
  },
  
  // Enable transpile modules for leaflet packages
  transpilePackages: ['react-leaflet', 'leaflet', 'leaflet-draw'],
};

module.exports = nextConfig;

 