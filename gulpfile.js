var gulp = require('gulp');
var inject = require('gulp-inject');
var uglify = require('gulp-uglify');

gulp.task('build', function () {
    var target = gulp.src('./lib/sdk2.js');
    var sources = gulp.src(
        [
            './bower_components/fingerprint/fingerprint.js',
            './bower_components/json2/json2.js',
            './bower_components/history.js/scripts/bundled/html4+html5/native.history.js',
            './lib/moz-object.keys.js',
            './lib/moz-foreach.js',
            './lib/cookieStorage.js',
            './lib/localStorage.js'
        ]
    );

    var options = {
        starttag: '/* inject */',
        endtag:   '/* endinject */',
        transform: function (filePath, file) {
            return file.contents.toString('utf-8');
        }
    };

    return target.pipe(inject(sources, options))
                 .pipe(gulp.dest('./dist'));
});

gulp.task('watch', function () {
    var toWatch = ['./lib/sdk2.js'];
    gulp.watch(toWatch, ['build']);
});

gulp.task('ugly', function () {
    gulp.src('./dist/sdk2.js')
        .pipe(uglify())
        .pipe(gulp.dest('./dist'));
});

gulp.task('default', ['build']);
