var expect = require('expect.js');
var sinon = require('sinon');

var consoleLogSpy;
var consoleInfoSpy;
var consoleWarnSpy;
var consoleErrorSpy;

var realWindowConsole;

describe('_log()', function () {

    beforeEach(function () {
	sinon.sandbox.create();

        this.xhr = sinon.useFakeXMLHttpRequest();
        var requests = this.requests = [];
        this.xhr.onCreate = function (xhr) {
            requests.push(xhr);
        };

        // Don't spam the test output
        realWindowConsole = window.console;
        window.console = {
            log: function () {},
            info: function () {},
            warn: function () {},
            error: function () {}
        };

        AT.init({
            apiKey: 'foo',
            autoSend: false
        });
    });

    afterEach(function () {
        sinon.sandbox.restore();

        this.xhr.restore();

        window.console = realWindowConsole;
    });

    it('should have a _log function', function () {
        expect(AT._log).to.be.a('function');
    });

    it('should not log by default (config.debug) is undefined', function () {
        consoleLogSpy = sinon.sandbox.spy(window.console, 'log');
        AT._log('log', 'foo');

        expect(consoleLogSpy.called).to.be(false);
    });

    it('should not log if config.debug is false', function () {
        AT.init({
            apiKey: 'foo',
            autoSend: false,
            debug: false
        });

        consoleLogSpy = sinon.sandbox.spy(window.console, 'log');
        AT._log('log', 'foo');

        expect(consoleLogSpy.called).to.be(false);
    });

    it('should not log if window.console is undefined', function () {
        var oldWindowConsole = window.console;
        window.console = undefined;

        AT._log('log', 'foo'); // this will fail if attempting to call console.anything in the SDK

        window.console = oldWindowConsole;
    });

    it('should log if config.debug is truthy and window.console is available', function () {
        AT.init({
            apiKey: 'foo',
            autoSend: false,
            debug: true
        });

        consoleLogSpy = sinon.sandbox.spy(window.console, 'log');
        AT._log('log', 'foo');

        expect(consoleLogSpy.args[0][0]).to.be('foo');
    });

    xit('should use console.log by default', function () {
        AT.init({
            apiKey: 'foo',
            autoSend: false,
            debug: true
        });

        consoleLogSpy = sinon.sandbox.spy(window.console, 'log');
        AT._log('foo');

        expect(consoleLogSpy.args[0][0]).to.be('foo');
    });

    it('should use console.log if called with log', function () {
        AT.init({
            apiKey: 'foo',
            autoSend: false,
            debug: true
        });

        consoleLogSpy = sinon.sandbox.spy(window.console, 'log');
        AT._log('log', 'foo');

        expect(consoleLogSpy.args[0][0]).to.be('foo');
    });

    it('should use console.info if called with info', function () {
        AT.init({
            apiKey: 'foo',
            autoSend: false,
            debug: true
        });

        consoleInfoSpy = sinon.sandbox.spy(window.console, 'info');
        AT._log('info', 'foo');

        expect(consoleInfoSpy.args[0][0]).to.be('foo');
    });

    it('should use console.warn if called with warn', function () {
        AT.init({
            apiKey: 'foo',
            autoSend: false,
            debug: true
        });

        consoleWarnSpy = sinon.sandbox.spy(window.console, 'warn');
        AT._log('warn', 'foo');

        expect(consoleWarnSpy.args[0][0]).to.be('foo');
    });

    it('should use console.error if called with error', function () {
        AT.init({
            apiKey: 'foo',
            autoSend: false,
            debug: true
        });

        consoleErrorSpy = sinon.sandbox.spy(window.console, 'error');
        AT._log('error', 'foo');

        expect(consoleErrorSpy.args[0][0]).to.be('foo');
    });
});
