// Karma configuration
// Generated on Mon Mar 16 2015 11:11:15 GMT+0000 (GMT)

module.exports = function(config) {
  // Decide whether to run the tests on Sauce Labs, or fall back to using
  // PhantomJS. Default to PhantomJS (TEST_ON_SAUCE=false).
  var TEST_ON_SAUCE = false;

  // Allows us to force a remote test on Sauce Labs by exporting TEST_ON_SAUCE.
  // Also tells Travis to use Sauce Labs if the current test is not for a PR.
  // See: http://docs.travis-ci.com/user/pull-requests/
  if (process.env.TEST_ON_SAUCE || process.env.TRAVIS_PULL_REQUEST == 'false') {
    TEST_ON_SAUCE = true;
  }

  var conf = {
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'browserify'],


    // list of files / patterns to load in the browser
    files: [
      './dist/sdk.js',
      './test/*.js'
    ],


    // list of files to exclude
    exclude: [
      './**/*.swp'
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      './test/*.js': ['browserify'],
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    // reporters: ['progress'],
    reporters: ['spec'], // add 'saucelabs'


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true
  };

  // Augment config for Sauce Labs
  if (TEST_ON_SAUCE) {
    if (!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY) {
      console.log('Sauce Labs credentials are needed for Sauce Labs tests.');
      process.exit(1);
    }

    conf.reporters.push('saucelabs');
    conf.captureTimeout = 120000;
    conf.browserNoActivityTimeout = 30000;

    conf.browsers = Object.keys(browsers);
    conf.customLaunchers = browsers;

    conf.sauceLabs = {
      testName: 'advocate-things-js-sdk with Karma',
      recordScreenshots: false,
      connectOptions: {
        port: 5757,
        logfile: 'sauce_connect.log'
      }
    };
  }

  // This is the config that is passed to Karma
  config.set(conf);
};

var browsers = {
  // sl_chrome31_win7: {
  //   base: 'SauceLabs',
  //   browserName: 'chrome',
  //   platform: 'Windows 7',
  //   version: '31'
  // },
  // sl_ie10_win7: {
  //   base: 'SauceLabs',
  //   browserName: 'internet explorer',
  //   platform: 'Windows 7',
  //   version: '10.0'
  // },
  sl_ie7_winxp: {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    platform: 'windows xp',
    version: '7.0'
  }
};
