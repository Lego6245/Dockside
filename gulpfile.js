const spawn = require('cross-spawn');
const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const ts = require('gulp-typescript');
const path = require('path');

const tsProject = ts.createProject('tsconfig.json');

gulp.task('compile', () => {
  return tsProject.src()
    .pipe(sourcemaps.init())
    .pipe(tsProject())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));
});

gulp.task('copy_html', () => {
  return gulp.src(['lib/*.html'])
    .pipe(gulp.dest('dist'));
});

gulp.task('start', ['compile', 'copy_html'], () => {
  return new Promise((resolve, reject) => {
    spawn(getLocalPathForBinary('electron'), ['dist/app.js'], { stdio: 'inherit' })
      .on('close', exitCode => onProcessClosed(exitCode, resolve, reject))
      .on('error', reject);
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
