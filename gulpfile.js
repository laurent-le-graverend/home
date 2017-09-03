const gulp = require('gulp');
const gutil = require('gulp-util');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const minifycss = require('gulp-minify-css');
const plumber = require('gulp-plumber');

// Compile Sass, Autoprefix and minify
gulp.task('styles', () => {
  return gulp.src('./styles/**/*.scss')
    .pipe(plumber((error) => {
      gutil.log(gutil.colors.red(error.message));
      this.emit('end');
    }))
    .pipe(sass())
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(minifycss())
    .pipe(gulp.dest('./css/'));
});

// Default task
gulp.task('default', () => {
  gulp.start('styles');
});

// Watch files for changes
gulp.task('watch', () => {

  // Watch .scss files
  gulp.watch('./styles/**/*.scss', ['styles']);

});
