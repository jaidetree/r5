import path from "path"
import webpack from "webpack"
import SpritesmithPlugin from "webpack-spritesmith"

const inlineFileSizeLimit = 4096
const assetPath = path.join(process.cwd(), "public", "assets")

export default {
  mode: "development",
  devtool: "source-map",
  entry: [
    "webpack/hot/dev-server",
    "webpack-hot-middleware/client?reload=true&noinfo=true",
    "./src/app/app.js",
  ],
  output: {
    path: path.resolve(process.cwd(), "public"),
    publicPath: "/js/",
    filename: "js/app.js",
  },
  resolve: {
    extensions: [".js", ".json", ".jsx"],
    modules: [
      path.resolve(process.cwd(), "src"),
      "node_modules",
    ]
  },
  module: {
    rules: [
      {
        test: /\.js[x]?$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      },
      {
        test: /\.(png|jpe?g|gif|webp)(\?.*)?$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: inlineFileSizeLimit,
              name: "img/[name].[hash:8].[ext]",
              outputPath: "assets/",
              publicPath: "assets/",
            }
          },
          {
            loader: "image-webpack-loader",
            options: {
              disable: true,
            }
          }
        ]
      },
      {
        test: /\.(svg)(\?.*)?$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "img/[name].[hash:8].[ext]",
              outputPath: "assets/",
              publicPath: "assets/",
            },
          },
          {
            loader: "image-webpack-loader",
          }
        ]
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: inlineFileSizeLimit,
              name: path.join(assetPath, "img/[name].hash[:8].[ext]"),
              outputPath: "assets/",
              publicPath: "assets/",
            }
          }
        ]
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: inlineFileSizeLimit,
              name: "fonts/[name].hash[:8].[ext]",
              outputPath: "assets/",
              publicPath: "assets/",
            }
          }
        ]
      },
      {
        test: /\.scss$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              camelCase: true,
              minimize: true,
              localIdentName: "[local]--[hash:base64:5]",
              modules: true,
            },
          },
          "sass-loader",
        ]
      }
    ],
  },
  plugins: [
    new SpritesmithPlugin({
      src: {
        cwd: path.resolve(process.cwd(), "src"),
        glob: "**/sprites/**/*.png"
      },
      target: {
        image: path.resolve(process.cwd(), "src/assets/sprite.png"),
        css: path.resolve(process.cwd(), "src/assets/sprite.scss"),
      },
      apiOptions: {
        cssImageRef: "assets/sprite.png"
      }
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
}
