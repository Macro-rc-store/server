const { merge } = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'production',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          mangle: {
            reserved: ['__awaiter']
          },
          compress: {
            drop_console: false,
            pure_funcs: ['console.log'] // <-- add any other pure functions you want to keep
          },
          output: {
            comments: false
          },
          sourceMap: false
        },
        extractComments: false,
      })
    ]
  }
});