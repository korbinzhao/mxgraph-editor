const gulp = require('gulp');
const less = require('gulp-less');
const postcss = require('gulp-postcss');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('autoprefixer');
const replace = require('gulp-replace');
 
gulp.task('less', () => gulp.src('src/*.less')
  .pipe(less())
  .pipe(gulp.dest('lib')));

gulp.task('autoprefixer', () => gulp.src('src/*.css')
  .pipe(sourcemaps.init())
  .pipe(postcss([autoprefixer()]))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest('./lib')));

gulp.task('replace', () => {
  gulp.src('lib/*.js')
    .pipe(replace(/\/(.+)\.less/, '/$1.css'))
    .pipe(replace(/\/(.+)\.styl/, '/$1.css'))
    .pipe(gulp.dest('lib'));
});

gulp.task('default', ['less', 'autoprefixer', 'replace']);
