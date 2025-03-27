/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  // Disable type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Set the output directory for Netlify
  distDir: '.next',
  
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
  webpack: (config) => {
    // Add support for SVG files
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // Add support for all image files
    config.module.rules.push({
      test: /\.(png|jpe?g|gif)$/i,
      use: [{
        loader: 'file-loader',
        options: {
          publicPath: '/_next',
          name: 'static/media/[name].[hash].[ext]',
        },
      }],
    });

    // Resolve path aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
      'leaflet': require.resolve('leaflet'),
      'leaflet-draw': require.resolve('leaflet-draw'),
    };

    // Add fallbacks for node polyfills
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };

    return config;
  },
  
  // External modules that should be transpiled
  transpilePackages: ['react-leaflet', '@react-leaflet', 'leaflet', 'leaflet-draw', 'react-datepicker'],
  
  // Set strict mode to false to avoid double mounting during development
  reactStrictMode: false,
};

module.exports = nextConfig;

 