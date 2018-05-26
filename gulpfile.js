const spawn = require('cross-spawn');
const gulp = require('gulp');
const clean = require('gulp-clean');
const path = require('path');
const runSequence = require('run-sequence');
const webpack = require('webpack');
const config = require('./webpack.dev.js');

gulp.task('copy_html', () => {
  return gulp.src(['lib/*.html'])
    .pipe(gulp.dest('dist'));
});

/**
 * Build the dotnet bridge project into our dist folder.
 */
gulp.task('build_bridge', () => {
  return new Promise((resolve, reject) => {
    spawn('dotnet publish', ['./lib/bridge', '-c', 'Release', '-r', 'win-x86', '-o', `${__dirname}/dist/resources/win`], { stdio: 'inherit' })
      .on('close', exitCode => onProcessClosed(exitCode, resolve, reject))
      .on('error', reject);
  });
});

/**
 * The dotnet building leaves some unwanted files in lib/bridge so we want to clean those up.
 */
gulp.task('cleanup_lib', () => {
  return gulp.src(['lib/bridge/bin', 'lib/bridge/obj'], { read: false })
    .pipe(clean());
});

gulp.task('start', () => {
  runSequence('copy_html', 'build_bridge', 'cleanup_lib')
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
