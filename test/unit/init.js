var expect = require('expect.js');
var sinon = require('sinon');

var _autoSendStub;
var _logSpy;
var _logStub;

describe('init()', function () {

    beforeEach(function () {
	sinon.sandbox.create();

        this.xhr = sinon.useFakeXMLHttpRequest();
        var requests = this.requests = [];
        this.xhr.onCreate = function (xhr) {
            requests.push(xhr);
        };
    });

    afterEach(function () {
        sinon.sandbox.restore();

        this.xhr.restore();
    });

    it('should have an init function', function () {
	expect(AT.init).to.be.a('function');
    });

    it('should return immediately if no config is passed', function () {
        _logStub = sinon.sandbox.stub(window.AT, '_log');

        AT.init();

        expect(_logStub.called).to.be(false);
    });

    it('should fail if no API key is provided in the config', function () {
	_logSpy = sinon.sandbox.spy(window.AT, '_log');

        AT.init({ foo: 'bar' });

        expect(_logSpy.args[1]).to.eql(['error', 'No API key specified']);
    });

    it('should automatically send data if autoSend is switched on', function () {
	_autoSendStub = sinon.sandbox.stub(window.AT, '_autoSend');

        AT.init({ apiKey: 'foo', autoSend: true });

        expect(_autoSendStub.calledOnce).to.be(true);
    });

    it('should not automatically send data if autoSend is switched off', function () {
	_autoSendStub = sinon.sandbox.stub(window.AT, '_autoSend');

        AT.init({ apiKey: 'foo', autoSend: false });

        expect(_autoSendStub.called).to.be(false);
    });

    it('should automatically send data if the autoSend config option is not defined', function () {
	_autoSendStub = sinon.sandbox.stub(window.AT, '_autoSend');

        AT.init({ apiKey: 'foo' });

        expect(_autoSendStub.calledOnce).to.be(true);
    });
});
