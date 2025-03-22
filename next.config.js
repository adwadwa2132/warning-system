/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Allow images from external domains
  images: {
    domains: ['openweathermap.org'],
  },
  
  // Configure webpack to handle SVG files
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // Fix for leaflet and leaflet-draw import issues
    config.resolve.alias = {
      ...config.resolve.alias,
      'leaflet-draw': require.resolve('leaflet-draw')
    };
    return config;
  },
  // Enable transpile modules for leaflet packages
  transpilePackages: ['react-leaflet', 'leaflet', 'leaflet-draw'],
};

module.exports = nextConfig;

 