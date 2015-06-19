var expect = require('expect.js');
var sinon = require('sinon');

var _getShareTokens;

describe('consumeToken()', function () {

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

    it('should have a consumeToken function', function () {
        expect(AT.consumeToken).to.be.a('function');
    });

    it('should correctly identify arguments (str, obj, fun)', function () {
        // Arrange
        var str = 'str123';
        var obj = { obj: 'obj' };
        var fun = sinon.sandbox.spy();
        _prepareDataSpy = sinon.sandbox.spy(window.AT, '_prepareData');

        // Act
        AT.consumeToken(str, obj, fun);
        this.requests[0].respond(400); // quickest route to finish

        // Assert
        expect(fun.calledOnce).to.be(true); // If this wasn't the case, typeof spy != function and would fail
        expect(_prepareDataSpy.args[0][0]).to.eql(obj);
        expect(this.requests[0].url).to.contain(str);
    });

    it('should correctly identify arguments (obj, fun)', function () {
        // Arrange
        var obj = { obj: 'obj' };
        var fun = sinon.sandbox.spy();
        _prepareDataSpy = sinon.sandbox.spy(window.AT, '_prepareData');
        var token = 'abc123';
        _getShareTokensStub = sinon.sandbox.stub(window.AT, '_getShareTokens');
        _getShareTokensStub.returns([token]);

        // Act
        AT.consumeToken(obj, fun);
        this.requests[0].respond(400); // quickest route to finish

        // Assert
        expect(fun.calledOnce).to.be(true); // If this wasn't the case, typeof spy != function and would fail
        expect(_prepareDataSpy.args[0][0]).to.eql(obj);
        expect(this.requests[0].url).to.contain(token); // fallback token
    });

    it('should correctly identify arguments (fun)', function () {
        // Arrange
        var fun = sinon.sandbox.spy();
        var origWindowAdvocateThingsData = window.advocate_things_data;
        window.advocate_things_data = { foo: 'bar' };
        _prepareDataSpy = sinon.sandbox.spy(window.AT, '_prepareData');
        var token = 'abc123';
        _getShareTokensStub = sinon.sandbox.stub(window.AT, '_getShareTokens');
        _getShareTokensStub.returns([token]);

        // Act
        AT.consumeToken(fun);
        this.requests[0].respond(400); // quickest route to finish

        // Assert
        expect(fun.calledOnce).to.be(true); // If this wasn't the case, typeof spy != function and would fail
        expect(_prepareDataSpy.args[0][0]).to.eql(window.advocate_things_data); // fallback data
        expect(this.requests[0].url).to.contain(token); // fallback token

        window.advocate_things_data = origWindowAdvocateThingsData;
    });

    it('should correctly identify arguments (str, fun)', function () {
        // Arrange
        var str = 'str123';
        var fun = sinon.sandbox.spy();
        var origWindowAdvocateThingsData = window.advocate_things_data;
        window.advocate_things_data = { foo: 'bar' };
        _prepareDataSpy = sinon.sandbox.spy(window.AT, '_prepareData');
        var token = 'abc123';
        _getShareTokensStub = sinon.sandbox.stub(window.AT, '_getShareTokens');
        _getShareTokensStub.returns([token]);

        // Act
        AT.consumeToken(str, fun);
        this.requests[0].respond(400); // quickest route to finish

        // Assert
        expect(fun.calledOnce).to.be(true); // If this wasn't the case, typeof spy != function and would fail
        expect(_prepareDataSpy.args[0][0]).to.eql(window.advocate_things_data); // fallback data
        expect(this.requests[0].url).to.contain(str); // fallback token

        window.advocate_things_data = origWindowAdvocateThingsData;
    });

    it('should fail if no token is provided and no stored tokens are available - with cb', function () {
        // Arrange
        _getShareTokensStub = sinon.sandbox.stub(window.AT, '_getShareTokens');
        _getShareTokensStub.returns([]);

        // Act
        AT.consumeToken(null, {}, function (err, res) {
            // Assert
            expect(err.message).to.be('[consumeToken] You must specify a token to consume.');
        });
    });

    it('should fail if no token is provided - no cb', function () {
        // Arrange
        _getShareTokensStub = sinon.sandbox.stub(window.AT, '_getShareTokens');
        _getShareTokensStub.returns([]);

        // Act
        AT.consumeToken(null);

        // Assert
        expect(this.requests.length).to.be(0);
    });

    it('should fail if the token is an empty string - with cb', function () {
        // Arrange
        _getShareTokensStub = sinon.sandbox.stub(window.AT, '_getShareTokens');
        _getShareTokensStub.returns([]);

        // Act
        AT.consumeToken('', function (err, res) {
            // Assert
            expect(err.message).to.be('[consumeToken] You must specify a token to consume.');
        });
    });

    it('should fail if the token is an empty string - no cb', function () {
        // Arrange
        _getShareTokensStub = sinon.sandbox.stub(window.AT, '_getShareTokens');
        _getShareTokensStub.returns([]);

        // Act
        AT.consumeToken('');

        // Assert
        expect(this.requests.length).to.be(0);
    });

    it('should return the token that was returned by the server (same one in args)', function () {
        // Arrange
        var token = { token: 'footoken' };
        var spy = sinon.sandbox.spy();

        // Act
        AT.consumeToken('token', {}, spy);
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
});
