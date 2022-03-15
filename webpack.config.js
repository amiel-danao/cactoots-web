const path = require('path');

module.exports = {
  // The entry point file described above
  entry: {
    index: './public/src/index.js',
    orders: './public/src/orders.js',
  },
  // The location of the build folder described above
  output: {
    path: path.resolve(__dirname, 'public/dist/js'),
    filename: '[name].bundle.js',
  },
  // Optional and for development only. This provides the ability to
  // map the built code back to the original source format when debugging.
  devtool: 'source-map',
  //devtool: 'eval-source-map',
  devServer: {
        static: {
        directory: path.join(__dirname, 'public'),
        },
        compress: true,
        port: 5000,
    }
};