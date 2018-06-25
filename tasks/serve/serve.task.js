import URL from "url"
import gulp from "gulp"
import browserSync from "browser-sync"
import webpackConfig from "./config/webpack.config"
import webpackDevMiddleware from "webpack-dev-middleware"
import webpackHotMiddleware from "webpack-hot-middleware"
import webpack from "webpack"

gulp.task("serve", () => {
  const bundler = webpack(webpackConfig)

  return browserSync({
    open: false,
    server: {
      baseDir: "public",
      middleware: [
        webpackDevMiddleware(bundler, {
          publicPath: "/",
          stats: { colors: true },
        }),
        webpackHotMiddleware(bundler),
        (req, res, next) => {
          // remove trailing slash from requests
          req.url = req.url.endsWith("/") && req.url.length > 1
            ? req.url.slice(0, -1)
            : req.url
          next()
        },
        (req, res, next) => {
          const url = URL.parse(req.url)

          // rewrite URIs to index for SPA architecture
          if (!url.pathname.includes(".")) {
            req.url = "/"
          }

          next()
        },
      ],
    },
    files: ["public/**/*.html", "public/**/*.css"]
  })
})
