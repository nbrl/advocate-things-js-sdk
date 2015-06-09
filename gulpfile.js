var gulp = require('gulp');
var inject = require('gulp-inject');
var karma = require('karma').server;
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var del = require('del');
var replace = require('gulp-replace');

var sdkPath = './src/sdk.js';
var karmaConfFile = __dirname + '/karma.conf.js';
var sourcePaths = [
    sdkPath,
    './lib/*.js'
];
var buildLibs = [
  './bower_components/json2/json2.js',
  './bower_components/history.js/scripts/bundled/html4+html5/native.history.js',
  './bower_components/cookie/cookie.js',
  './lib/cookieStorage.js', // requires cookie.js
  './lib/localStorage.js',
  './bower_components/fingerprint/fingerprint.js'
];

/**
 * Clean up the dist folder.
 */
gulp.task('clean', function () {
    del(['./dist/*']);
});

/**
 * Build distributable JS file by injecting extra libraries.
 */
gulp.task('build', function () {
    var target = gulp.src(sdkPath);
    var sources = gulp.src(buildLibs);

    var options = {
        starttag: '/* inject:utils */',
        endtag:   '/* endinject:utils */',
        transform: function (filePath, file) {
            return file.contents.toString('utf-8');
        }
    };

    return target.pipe(inject(sources, options))
                 .pipe(gulp.dest('./dist/'));
});

/**
 * Build JS suitable for local collectors.
 */
gulp.task('build-local', ['build'], function () {
    return gulp.src('./dist/sdk.js')
        .pipe(replace(/https:\/\/sharepoint-data-collector.herokuapp.com/g, 'http://127.0.0.1:3000'))
        .pipe(gulp.dest('./dist/'));
});

/**
 * Minify the compiled JS.
 */
function minifyDist () {
    return gulp.src('./dist/sdk.js')
        .pipe(uglify())
        .pipe(rename('sdk.min.js'))
        .pipe(gulp.dest('./dist'));
}
gulp.task('minify', ['build'], minifyDist);
gulp.task('uglify', ['build'], minifyDist);

/**
 * Single test run.
 */
gulp.task('test', ['build'], function (done) {
    karma.start({
        configFile: karmaConfFile,
        singleRun: true
    }, done);
});

/**
 * Test minified file.
 * TODO: find a better way to do this.
 */
gulp.task('test-min', ['minify'], function (done) {
    var files = [
        './dist/sdk.min.js',
        './test/*.js'
    ];

    karma.start({
        configFile: karmaConfFile,
        singleRun: true,
        files: files
    }, done);
});

/**
 * Watch for source code changes.
 */
function rebuildSourceOnChange () {
    return gulp.watch(sourcePaths, ['build']);
}
gulp.task('watch-src', rebuildSourceOnChange);

/**
 * Watch for changes and run tests
 */
function watchAndTest (done) {
    karma.start({
        configFile: karmaConfFile,
        singleRun: false,
        autoWatch: true
    }, done);
}
gulp.task('tdd', ['watch-src'], watchAndTest);
gulp.task('watch', ['watch-src'], watchAndTest);

gulp.task('default', ['test']);
