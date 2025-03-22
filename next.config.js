/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  // Disable type checking during build
  typescript: {
    ignoreBuildErrors: true,
    tsconfigPath: false,
  },
  
  // Allow images from external domains
  images: {
    domains: ['openweathermap.org'],
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
      'leaflet-draw': require.resolve('leaflet-draw')
    };
    
    return config;
  },
  
  // Enable transpile modules for leaflet packages
  transpilePackages: ['react-leaflet', 'leaflet', 'leaflet-draw'],
};

module.exports = nextConfig;

 