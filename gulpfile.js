var gulp = require('gulp');
var inject = require('gulp-inject');

gulp.task('default', function () {
    var target = gulp.src('./lib/sdk.js');
    var sources = gulp.src(
        [
            './bower_components/fingerprint/fingerprint.js',
            './bower_components/json2/json2.js',
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
