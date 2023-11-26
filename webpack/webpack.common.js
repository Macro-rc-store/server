const path = require('path');

function getPackagePath(packageName) {
  return `./packages/${packageName}/src/index.ts`;
}

module.exports = {
  entry: {
    service: getPackagePath('service')
  },
  target: 'node',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      }
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: '[name]/index.js',
    path: path.resolve(__dirname, '../dist'),
  },
};
