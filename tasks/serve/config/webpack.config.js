import * as R from "ramda"
import path from "path"
import webpack from "webpack"
import SpritesmithPlugin from "webpack-spritesmith"

const inlineFileSizeLimit = 4096
const assetPath = path.join(process.cwd(), "public", "assets")

/**
 * setPathWith :: [ String ] -> ({ a } -> *) -> { a } -> { a, String: * }
 * Updates the config with the return value of fn that can transform the
 * current config
 * Example:
 * setPathWith("background", R.prop("color"), { background: null, color: "blue"})
 * // { background: "blue", color: "blue" }
 */
const setPathWith = R.curry(function setPathWith (name, fn, config) {
  return R.assocPath([].concat(name), fn(config), config)
})

/**
 * appendWith :: [ String ] -> ({ a } -> *) -> { a } -> { a }
 * Appends the return value of a config transform function to a path on the
 * config.
 * Example:
 * appendWith("items", R.prop("color"), { color: "red", items: [] })
 * // => { color: "red", items: ["red"] }
 * appendWith(["list", items" ], R.prop("color"), { color: "blue", list: { items: [] } })
 * // => { color: "blue", list: { items: ["blue"] } }
 */
const appendWith = R.curry(function appendWith (name, fn, config) {
  const paths = [].concat(name)
  const current = R.path(paths, config)

  return R.assocPath(paths, R.append(fn(config), current), config)
})

function getMode (config) {
  return "development"
}

function getDevTool (config) {
  return "source-map"
}

function getEntries (config) {
  return [
    "webpack/hot/dev-server",
    "webpack-hot-middleware/client?reload=true&noinfo=true",
    "./src/app/app.js",
  ]
}

function getOutput (config) {
  return  {
    path: path.resolve(process.cwd(), "public"),
    publicPath: "/js/",
    filename: "js/app.js",
  }
}

function getResolve (config) {
  return {
    extensions: [".js", ".json", ".jsx"],
    modules: [
      path.resolve(process.cwd(), "src"),
      "node_modules",
    ]
  }
}

function getBabelRule (config) {
  return {
    test: /\.js[x]?$/,
    exclude: /node_modules/,
    loader: "babel-loader",
  }
}

function getImageRule (config) {
  return {
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
  }
}

function getSVGRule (config) {
  return {
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
  }
}

function getMediaRule (config) {
  return {
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
  }
}

function getFontRule (config) {
  return {
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
  }
}

function getSCSSRule (config) {
  return {
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
}

function getModule (config) {
  return {
    rules: []
  }
}

function getSpritesmithPlugin (config) {
  const src = path.resolve(process.cwd(), "src")

  return new SpritesmithPlugin({
    src: {
      cwd: src,
      glob: "**/sprites/**/*.png"
    },
    target: {
      image: path.join(src, "assets/sprite.png"),
      css: path.join(src, "src/assets/sprite.scss"),
    },
    apiOptions: {
      cssImageRef: "assets/sprite.png"
    }
  })
}

function getHotPlugin (config) {
  return new webpack.HotModuleReplacementPlugin()
}

function getPlugins (config) {
  return []
}

export default {}
  |> setPathWith("mode", getMode)
  |> setPathWith("devtool", getDevTool)
  |> setPathWith("entry", getEntries)
  |> setPathWith("output", getOutput)
  |> setPathWith("resolve", getResolve)
  |> setPathWith("module", getModule)
  |> appendWith([ "module", "rules" ], getBabelRule)
  |> appendWith([ "module", "rules" ], getImageRule)
  |> appendWith([ "module", "rules" ], getSVGRule)
  |> appendWith([ "module", "rules" ], getMediaRule)
  |> appendWith([ "module", "rules" ], getFontRule)
  |> appendWith([ "module", "rules" ], getSCSSRule)
  |> setPathWith("plugins", getPlugins)
  |> appendWith([ "plugins" ], getSpritesmithPlugin)
  |> appendWith([ "plugins" ], getHotPlugin)
