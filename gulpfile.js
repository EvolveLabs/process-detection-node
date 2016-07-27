var gulp = require('gulp');
var lab = require('gulp-lab');

gulp.task('test', function () {
    return gulp.src(['bogus'])
      .pipe(lab('-L -m 5000'));
});

gulp.task('watch', function () {
    return gulp.watch(['index.js', 'test/**', 'lib/**'], ['test']);
});

gulp.task('default', ['test', 'watch']);
