var gulp = require('gulp');
var inject = require('gulp-inject');
var uglify = require('gulp-uglify');

gulp.task('build', function () {
    var target = gulp.src('./src/sdk.js');
    var sources = gulp.src(
        [
            './bower_components/fingerprint/fingerprint.js',
            './bower_components/json2/json2.js',
            './bower_components/history.js/scripts/bundled/html4+html5/native.history.js',
            './bower_components/cookie/cookie.js',
            './lib/cookieStorage.js', // requires cookie.js
            './lib/localStorage.js',
            './lib/moz-object.keys.js',
            './lib/moz-foreach.js'
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
    var toWatch = ['./src/sdk.js'];
    gulp.watch(toWatch, ['build']);
});

gulp.task('ugly', function () {
    gulp.src('./dist/sdk.js')
        .pipe(uglify())
        .pipe(gulp.dest('./dist'));
});

gulp.task('default', ['build']);
