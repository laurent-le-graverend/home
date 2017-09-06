const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const cleanCss = require('gulp-clean-css');
const del = require('del');
const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const inlinesource = require('gulp-inline-source');
const usemin = require('gulp-usemin');
const gutil = require('gulp-util');
const plumber = require('gulp-plumber');
const runSequence = require('run-sequence');
const sass = require('gulp-sass');

gulp.task('clean', function() {
  return del(['dist']);
});

gulp.task('styles', () => {
  return gulp.src('./src/**/*.scss')
    .pipe(plumber((error) => {
      gutil.log(gutil.colors.red(error.message));
      this.emit('end');
    }))
    .pipe(sass())
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(cleanCss())
    .pipe(gulp.dest('./dist/'))
    .pipe(browserSync.stream());
});

gulp.task('scripts', () => {
  return gulp.src('./src/**/*.js')
    .pipe(gulp.dest('./dist/'));
});

gulp.task('html', ['scripts'], () => {
  return gulp.src('src/**/*.html')
    .pipe(usemin({
      html: [() => {
        return htmlmin({
          collapseWhitespace: true,
          conservativeCollapse: true,
          minifyCSS: true,
          minifyJS: true,
          removeComments: true,
          removeCommentsFromCDATA: true
        });
      }]
    }))
    .pipe(inlinesource())
    .pipe(gulp.dest('./dist/'));
});

gulp.task('copyOthers', () => {
  return gulp.src([
    'src/humans.txt'
  ])
    .pipe(gulp.dest('./dist'));
});

gulp.task('images', () => {
  return gulp.src('src/**/*.{png,jpg,svg,gif}')
    .pipe(imagemin([
      imagemin.svgo({ plugins: [{ removeTitle: true, removeViewBox: true }] })
    ]))
    .pipe(gulp.dest('./dist'));
});

gulp.task('serve', () => {
  return runSequence(
    'clean',
    ['html', 'images', 'styles', 'scripts'], () => {
      browserSync.init({
        ghostMode: false,
        server: './dist'
      });

      gulp.watch('./src/**/*.scss', ['styles']);
      gulp.watch('./src/**/*.js', ['scripts', 'html']);
      gulp.watch('./src/**/*.html', ['html']);

      // Reload the browser when files are compiled
      gulp.watch('./dist/**/*.js').on('change', browserSync.reload);
      gulp.watch('./dist/**/*.html').on('change', browserSync.reload);
    });
});

gulp.task('build', () => {
  return runSequence(
    'clean',
    ['html', 'images', 'styles', 'scripts', 'copyOthers']
  );
});

gulp.task('default', ['serve']);
