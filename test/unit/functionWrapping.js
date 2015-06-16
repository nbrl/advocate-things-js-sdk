var expect = require('expect.js');
var sinon = require('sinon');

var _prepareDataStub;
var consoleLogSpy;
var consoleInfoSpy;
var consoleWarnSpy;
var consoleErrorSpy;

var realWindowConsole;

describe('wrapping of API functions', function () {

    beforeEach(function () {
	sinon.sandbox.create();

        this.xhr = sinon.useFakeXMLHttpRequest();
        var requests = this.requests = [];
        this.xhr.onCreate = function (xhr) {
            requests.push(xhr);
        };

        _prepareDataStub = sinon.sandbox.stub(window.AT, '_prepareData');

                // Don't spam the test output
        realWindowConsole = window.console;
        window.console = {
            log: function () {},
            info: function () {},
            warn: function () {},
            error: function () {}
        };

        // AT.init({
        //     apiKey: 'foo',
        //     autoSend: false
        // });
    });

    afterEach(function () {
        sinon.sandbox.restore();

        this.xhr.restore();

        window.console = realWindowConsole;
    });

    it('should log and not make a request if no API key when calling a wrapped function', function () {
        // Arrange
        consoleWarnSpy = sinon.sandbox.spy(window.console, 'warn');
        AT.init({
            autoSend: false,
            debug: true
        });

        // Act
        AT.createToken();       // wrapped

        // Assert
        expect(_prepareDataStub.called).to.be(false);
        expect(consoleWarnSpy.calledOnce).to.be(true);
        expect(consoleWarnSpy.args[0][0]).to.equal('No API key');
    });
});
