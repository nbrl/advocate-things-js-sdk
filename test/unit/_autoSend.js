var expect = require('expect.js');
var sinon = require('sinon');

var createTokenStub;
var registerTouchStub;

describe('_autoSend()', function () {

    beforeEach(function () {
	sinon.sandbox.create();

        this.xhr = sinon.useFakeXMLHttpRequest();
        var requests = this.requests = [];
        this.xhr.onCreate = function (xhr) {
            requests.push(xhr);
        };

        AT.init({
            apiKey: 'foo',
            autoSend: false
        });

        createTokenStub = sinon.sandbox.stub(window.AT, 'createToken');
        //createTokenStub.yieldsAsync(null, 'foo');
        registerTouchStub = sinon.sandbox.stub(window.AT, 'registerTouch');
    });

    afterEach(function () {
        sinon.sandbox.restore();

        this.xhr.restore();
    });

    it('should have an _autoSend function', function () {
	expect(AT._autoSend).to.be.a('function');
    });

    it('should register a touch if autoSend === touch', function () {
        AT.init({
            apiKey: 'foo',
            autoSend: 'touch'
        });

        expect(registerTouchStub.calledOnce).to.be(true);
        expect(createTokenStub.called).to.be(false);
    });

    it('should create a share token if autoSend === share', function () {
	AT.init({
            apiKey: 'foo',
            autoSend: 'share'
        });

        expect(createTokenStub.calledOnce).to.be(true);
        expect(registerTouchStub.called).to.be(false);
    });

    it('should send touch and share data if autoSend === true', function (done) {
        registerTouchStub.yieldsAsync(null);
        createTokenStub.yieldsAsync(null);

	AT.init({
            apiKey: 'foo',
            autoSend: true
        }, function () {
            expect(registerTouchStub.calledOnce).to.be(true);
            expect(createTokenStub.calledOnce).to.be(true);

            done();
        });
    });
});
