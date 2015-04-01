// Karma configuration
// Generated on Mon Mar 16 2015 11:11:15 GMT+0000 (GMT)

module.exports = function(config) {
  // Require Sauce credentials on Travis
  if (process.env.TRAVIS) {
    if (!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY) {
      console.log('SauceLabs credentials are needed for Travis tests.');
      process.exit(1);
    }
  }

  var conf = {
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'browserify'],


    // list of files / patterns to load in the browser
    files: [
      './dist/*.js',
      // {pattern: './dist/sdk2.js', included: false, served: true},
      // {pattern: './test/*.js', included: false, served: true},
      // './test/*.html',
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
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  };

  // Set up Sauce Labs config when running on Travis
  if (process.env.TRAVIS) {
    conf.reporters = ['spec', 'saucelabs'];
    conf.autoWatch = false;
    conf.singleRun = true;
    conf.captureTimeout = 120000;

    conf.browsers = Object.keys(browsers);
    conf.customLaunchers = browsers;

    conf.sauceLabs = {
      testName: 'build-things-js-sdk with Karma',
      recordScreenshots: false,
      connectoOptions: {
        port: 5757,
        logfile: 'sauce_connect.log'
      }
    };
  }

  // This is the config that is passed to Karma
  config.set(conf);
};

var browsers = {
  // sl_chrome: {
  //   base: 'SauceLabs',
  //   browserName: 'chrome',
  //   platform: 'Windows 7',
  //   version: '31'
  // },
  sl_ie7_winxp: {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    platform: 'windows xp',
    version: '7.0'
  }
};
