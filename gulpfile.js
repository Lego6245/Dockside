const spawn = require('cross-spawn');
const gulp = require('gulp');
const path = require('path');
const webpack = require('webpack');
const config = require('./webpack.dev.js');

gulp.task('copy_html', () => {
  return gulp.src(['lib/*.html'])
    .pipe(gulp.dest('dist'));
});

gulp.task('start', ['copy_html'], () => {
  return new Promise((resolve, reject) => {
    return webpack(config).run((err, stats) => {
      spawn(getLocalPathForBinary('electron'), ['dist/app.bundle.js'], { stdio: 'inherit' })
        .on('close', exitCode => onProcessClosed(exitCode, resolve, reject))
        .on('error', reject);
    });
  });
});

function getLocalPathForBinary(name) {
  return path.normalize(`${process.cwd()}/node_modules/.bin/${name}`);
}

function onProcessClosed(exitCode, resolve, reject) {
  if (exitCode === 0) {
    resolve();
  } else {
    reject(new Error(`Child process failed with exit code ${exitCode}`));
  }
}
