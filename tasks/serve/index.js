import gulp from 'gulp';
import browserSync from 'browser-sync';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import _ from 'highland';

gulp.task('serve', () => {
  return browserSync({
    baseDir: 'public',
    middlware: [
      webpackDevMiddleware(bundler, {
        publicPath: '',
        stats: { colors: true },
      }),
      webpackHotMiddlware(bundler),
    ],
  });
});
