import gulp from 'gulp';
import browserSync from 'browser-sync';
import webpackConfig from './config/webpack.config';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import webpack from 'webpack';
import _ from 'highland';

gulp.task('serve', () => {
  const bundler = webpack(webpackConfig);

  return browserSync({
    open: false,
    server: {
      baseDir: 'public',
      middlware: [
        webpackDevMiddleware(bundler, {
          publicPath: webpackConfig.output.publicPath,
          stats: { colors: true },
        }),
        webpackHotMiddleware(bundler),
      ],
    },
    files: ['public/**/*.html', 'public/**/*.css']
  });
});
