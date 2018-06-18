import path from 'path';
import webpack from 'webpack';

export default {
  mode: 'development',
  devtool: 'cheap-eval-source-map',
  entry: [
    'webpack/hot/dev-server',
    'webpack-hot-middleware/client?reload=true&noinfo=true',
    './app/app.js',
  ],
  output: {
    path: path.resolve(process.cwd(), 'public', 'js'),
    publicPath: '/js/',
    filename: 'app.js',
  },
  resolve: {
    extensions: ['.js', '.json', '.jsx']
  },
  module: {
    rules: [
      { test: /\.js[x]?$/, exclude: /node_modules/, loader: "babel-loader" },
    ],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],
}
