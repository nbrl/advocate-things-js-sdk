var expect = require('expect.js');
var sinon = require('sinon');

var _getShareTokensStub;

describe('lockToken()', function () {

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
    });

    afterEach(function () {
        sinon.sandbox.restore();

        this.xhr.restore();
    });

    it('should have a lockToken function', function () {
        expect(AT.lockToken).to.be.a('function');
    });

    it('should correctly identify arguments (token, cb)', function () {
	// Arrange
        var str = 'str123';
        var fun = sinon.sandbox.spy();

        // Act
        AT.lockToken(str, fun);
        this.requests[0].respond(400); // quickest route to finish

        // Assert
        expect(fun.calledOnce).to.be(true); // If this wasn't the case, typeof spy != function and would fail
        expect(this.requests[0].url).to.contain(str);
    });

    it('should correctly identify arguments (cb)', function () {
        // Arrange
        var fun = sinon.sandbox.spy();
        var token = 'abc123';
        _getShareTokensStub = sinon.sandbox.stub(window.AT, '_getShareTokens');
        _getShareTokensStub.returns([token]);

        // Act
        AT.lockToken(fun);
        this.requests[0].respond(400); // quickest route to finish

        // Assert
        expect(fun.calledOnce).to.be(true); // If this wasn't the case, typeof spy != function and would fail
        expect(this.requests[0].url).to.contain(token); // fallback token
    });

    it('should fail if no token is provided and no stored tokens are available - with cb', function () {
        // Arrange
        _getShareTokensStub = sinon.sandbox.stub(window.AT, '_getShareTokens');
        _getShareTokensStub.returns([]);

        // Act
        AT.lockToken(null, function (err, res) {
            // Assert
            expect(err.message).to.be('[lockToken] You must specify a token to lock.');
        });
    });

    it('should fail if no token is provided and no stored tokens are available - no cb', function () {
        // Arrange
        _getShareTokensStub = sinon.sandbox.stub(window.AT, '_getShareTokens');
        _getShareTokensStub.returns([]);

        // Act
        AT.lockToken(null);

        // Assert
        expect(this.requests.length).to.be(0);
    });

    it('should fail if the token is an empty string and no stored tokens are available - with cb', function () {
        // Arrange
        _getShareTokensStub = sinon.sandbox.stub(window.AT, '_getShareTokens');
        _getShareTokensStub.returns([]);

        // Act
        AT.lockToken('', function (err, res) {
            // Assert
            expect(err.message).to.be('[lockToken] You must specify a token to lock.');
        });
    });

    it('should fail if the token is an empty string and no stored tokens are available - no cb', function () {
        // Arrange
        _getShareTokensStub = sinon.sandbox.stub(window.AT, '_getShareTokens');
        _getShareTokensStub.returns([]);

        // Act
        AT.lockToken('');

        // Assert
        expect(this.requests.length).to.be(0);
    });

    it('should return the token that was returned by the server (same one in args)', function () {
        // Arrange
        var token = { token: 'footoken' };
        var spy = sinon.sandbox.spy();

        // Act
        AT.lockToken('token', spy);
        this.requests[0].respond(
            200,
            { 'Content-Type': 'application/json; charset=utf-8' },
            JSON.stringify(token)
        );

        // Assert
        var err = spy.args[0][0];
        var res = spy.args[0][1];
        expect(err).to.be(null);
        expect(res).to.eql(token.token);
    });

    it('should return the token that was returned by the server (same one in window.advocate_things_data)', function () {
        // Arrange
        var token = 'abc123';
        _getShareTokensStub = sinon.sandbox.stub(window.AT, '_getShareTokens');
        _getShareTokensStub.returns([token]);
        var spy = sinon.sandbox.spy();

        // Act
        AT.lockToken(spy);
        this.requests[0].respond(
            200,
            { 'Content-Type': 'application/json; charset=utf-8' },
            JSON.stringify({ token: token })
        );

        // Assert
        var err = spy.args[0][0];
        var res = spy.args[0][1];
        expect(err).to.be(null);
        expect(res).to.eql(token);
    });
});
