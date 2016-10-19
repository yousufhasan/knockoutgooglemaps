var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var minifyCSS = require('gulp-minify-css');

// Include plugins
var concat = require('gulp-concat');
 // Concatenate JS Files
gulp.task('scripts', function() {
    return gulp.src(['js/jquery-2.2.0.min.js','js/knockout-3.4.0.js', 'js/script.js'])
      .pipe(concat('main.js'))
      .pipe(rename({suffix: '.min'}))
      .pipe(uglify())
      .pipe(gulp.dest('build/js'));
});

gulp.task('css', function() {
    return gulp.src(['css/bootstrap.min.css','css/font-awesome.min.css', 'css/main.css'])
      .pipe(concat('main.css'))
      .pipe(rename({suffix: '.min'}))
      .pipe(minifyCSS())
      .pipe(gulp.dest('build/css'));
});

// Watch for changes in files
gulp.task('watch', function() {
   // Watch .js files
  gulp.watch('js/*.js', ['scripts']);

 });

 // Default Task
gulp.task('default', ['scripts','css','watch']);