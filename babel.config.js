module.exports = {
  presets: [
    [
      'next/babel',
      {
        'preset-env': {
          targets: {
            browsers: ['last 2 versions', 'ie >= 11']
          },
          useBuiltIns: 'usage',
          corejs: 3,
          loose: true,
          modules: 'commonjs'
        }
      }
    ]
  ],
  plugins: [
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-proposal-private-methods', { loose: true }],
    ['@babel/plugin-proposal-private-property-in-object', { loose: true }]
  ]
}; 