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
  webpack: (config) => {
    // Handle CSS imports
    config.module.rules.push({
      test: /\.css$/,
      use: ['style-loader', 'css-loader'],
      include: [
        /node_modules\/leaflet/,
        /node_modules\/leaflet-draw/,
        /node_modules\/react-datepicker/,
      ],
    });

    // Add support for SVG files
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack', 'url-loader'],
      include: [/node_modules\/leaflet-draw/],
    });

    // Add support for image files in leaflet-draw
    config.module.rules.push({
      test: /\.(png|jpe?g|gif)$/i,
      use: [{
        loader: 'file-loader',
        options: {
          publicPath: '/_next',
          name: 'static/media/[name].[hash].[ext]',
        },
      }],
      include: [
        /node_modules\/leaflet/,
        /node_modules\/leaflet-draw/,
      ],
    });

    // Resolve path aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
      'leaflet': require.resolve('leaflet'),
      'leaflet-draw': require.resolve('leaflet-draw'),
      'leaflet/dist/leaflet.css': path.resolve(__dirname, 'node_modules/leaflet/dist/leaflet.css'),
    };

    // Explicitly transpile leaflet packages
    config.module.rules.push({
      test: /\.js$/,
      include: [
        /node_modules\/leaflet/,
        /node_modules\/leaflet-draw/,
        /node_modules\/@react-leaflet/,
        /node_modules\/react-leaflet/,
      ],
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['next/babel'],
        },
      },
    });

    return config;
  },
  
  // External modules that should be transpiled
  transpilePackages: ['react-leaflet', '@react-leaflet', 'leaflet', 'leaflet-draw'],
  
  // Add middleware configuration to ensure it only applies to admin routes
  experimental: {},
};

module.exports = nextConfig;

 