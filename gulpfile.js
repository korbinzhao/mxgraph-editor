var gulp = require('gulp');

gulp.task('less', function(){
  return gulp.src('src/*.less')
    .pipe(gulp.dest('lib'))
});

gulp.task('stylus', function(){
  return gulp.src('src/*.styl')
  .pipe(gulp.dest('lib'))
});

gulp.task('default', [ 'less', 'stylus' ]);
