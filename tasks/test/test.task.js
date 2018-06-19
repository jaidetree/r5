import gulp from 'gulp';
import jest from 'jest-cli';
import jestConfig from './config/jest.config.js';

gulp.task('test:unit', () => {
  return jest.runCLI(jestConfig, [jestConfig.rootDir])
    .then(({ results }) => {
    });
});
