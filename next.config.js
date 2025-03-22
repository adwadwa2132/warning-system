/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure webpack to properly handle leaflet-draw
  webpack: (config) => {
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

 