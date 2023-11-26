const { merge } = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const common = require('./webpack.common.js');
const WebpackObfuscator = require('webpack-obfuscator');

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
          output: {
            comments: false
          },
          sourceMap: false
        },
        extractComments: false
      })
    ]
  },
  plugins: [
    new WebpackObfuscator({
      target: 'node',
      disableConsoleOutput: true,
      selfDefending: true,
      debugProtection: true,
      stringArrayIndexesType: [
        'hexadecimal-number'
      ],
      rotateStringArray: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 0.75,
      numbersToExpressions: true,
      unicodeEscapeSequence: true,
      exclude: /\.s\.ts$/
    }, [])
  ]
});