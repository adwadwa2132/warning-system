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
    // First, remove any existing CSS rules that might conflict
    const cssRules = config.module.rules.filter(rule => 
      rule.test && rule.test.toString().includes('.css')
    );
    
    const filteredRules = config.module.rules.filter(rule => 
      !rule.test || !rule.test.toString().includes('.css')
    );
    
    config.module.rules = filteredRules;
    
    // Now add a single, comprehensive CSS rule
    config.module.rules.push({
      test: /\.css$/,
      use: [
        'style-loader', 
        {
          loader: 'css-loader',
          options: {
            importLoaders: 1,
            sourceMap: true,
          },
        },
        {
          loader: 'postcss-loader',
          options: {
            sourceMap: true,
          },
        }
      ],
      // No include filter to handle all CSS files
    });

    // Add support for SVG files
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack', 'url-loader'],
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
      // Add alias for ajv to ensure it's found
      'ajv/dist/compile/codegen': path.resolve(__dirname, 'node_modules/ajv/dist/compile/codegen'),
    };

    // Explicitly transpile packages
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

    // Add fallbacks for node polyfills
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };

    return config;
  },
  
  // External modules that should be transpiled
  transpilePackages: ['react-leaflet', '@react-leaflet', 'leaflet', 'leaflet-draw', 'react-datepicker', 'ajv', 'ajv-keywords'],
  
  // Add middleware configuration to ensure it only applies to admin routes
  experimental: {},
};

module.exports = nextConfig;

 