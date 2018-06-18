import path from 'path';
import webpack from 'webpack';

export default {
  mode: 'development',
  devtool: 'cheap-eval-source-map',
  entry: [
    'webpack/hot/dev-server',
    'webpack-hot-middleware/client',
    './app/app.js',
  ],
  output: {
    path: path.resolve(__dirname, '..', 'dist'),
    publicPath: '/js/',
    filename: 'app.js',
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },
    ],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],
}
