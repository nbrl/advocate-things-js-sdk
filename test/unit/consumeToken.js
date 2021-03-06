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

    it('should correctly identify arguments ()', function () {
        // Arrange
        var defToken = 'abc123';
        _prepareDataSpy = sinon.sandbox.spy(window.AT, '_prepareData');
        var origWindowAdvocateThingsData = window.advocate_things_data;
        window.advocate_things_data = { foo: 'bar' };
        _getDefaultTokenStub = sinon.sandbox.stub(window.AT, 'getDefaultToken');
        _getDefaultTokenStub.returns(defToken);

        // Act
        AT.consumeToken();
        this.requests[0].respond(400);

        // Assert
        expect(_prepareDataSpy.args[0][0]).to.eql(window.advocate_things_data); // when data is null, use this
        expect(this.requests[0].url).to.contain(defToken);

        window.advocate_things_data = origWindowAdvocateThingsData; // restore
    });

    it('should correctly identify arguments (str)', function () {
        // Arrange
        var str = 'str123';
        var origWindowAdvocateThingsData = window.advocate_things_data;
        window.advocate_things_data = { foo: 'bar' };
        _prepareDataSpy = sinon.sandbox.spy(window.AT, '_prepareData');

        // Act
        AT.consumeToken(str);
        this.requests[0].respond(400); // quickest route to finish

        // Assert
        expect(_prepareDataSpy.args[0][0]).to.eql(window.advocate_things_data); // fallback data
        expect(this.requests[0].url).to.contain(str);

        window.advocate_things_data = origWindowAdvocateThingsData;
    });

    it('should correctly identify arguments (obj)', function () {
        // Arrange
        var defToken = 'abc123';
        var obj = { obj: 'obj' };
        _prepareDataSpy = sinon.sandbox.spy(window.AT, '_prepareData');
        _getDefaultTokenStub = sinon.sandbox.stub(window.AT, 'getDefaultToken');
        _getDefaultTokenStub.returns(defToken);

        // Act
        AT.consumeToken(obj);
        this.requests[0].respond(400); // quickest route to finish

        // Assert
        expect(_prepareDataSpy.args[0][0]).to.eql(obj);
        expect(this.requests[0].url).to.contain(defToken);
    });

    it('should correctly identify arguments (func)', function () {
        // Arrange
        var defToken = 'abc123';
        var fun = sinon.sandbox.spy();
        var origWindowAdvocateThingsData = window.advocate_things_data;
        window.advocate_things_data = { foo: 'bar' };
        _prepareDataSpy = sinon.sandbox.spy(window.AT, '_prepareData');
        _getDefaultTokenStub = sinon.sandbox.stub(window.AT, 'getDefaultToken');
        _getDefaultTokenStub.returns(defToken);

        // Act
        AT.consumeToken(fun);
        this.requests[0].respond(400); // quickest route to finish

        // Assert
        expect(fun.calledOnce).to.be(true); // If this wasn't the case, typeof spy != function and would fail
        expect(_prepareDataSpy.args[0][0]).to.eql(window.advocate_things_data); // fallback data
        expect(this.requests[0].url).to.contain(defToken);

        window.advocate_things_data = origWindowAdvocateThingsData;
    });

    it('should correctly identify arguments (str, obj)', function () {
        // Arrange
        var str = 'str123';
        var obj = { obj: 'obj' };
        _prepareDataSpy = sinon.sandbox.spy(window.AT, '_prepareData');

        // Act
        AT.consumeToken(str, obj);
        this.requests[0].respond(400);

        // Assert
        expect(_prepareDataSpy.args[0][0]).to.eql(obj);
        expect(this.requests[0].url).to.contain(str);
    });

    it('should correctly identify arguments (str, func)', function () {
        // Arrange
        var str = 'str123';
        var fun = sinon.sandbox.spy();
        var origWindowAdvocateThingsData = window.advocate_things_data;
        window.advocate_things_data = { foo: 'bar' };
        _prepareDataSpy = sinon.sandbox.spy(window.AT, '_prepareData');

        // Act
        AT.consumeToken(str, fun);
        this.requests[0].respond(400); // quickest route to finish

        // Assert
        expect(fun.calledOnce).to.be(true); // If this wasn't the case, typeof spy != function and would fail
        expect(_prepareDataSpy.args[0][0]).to.eql(window.advocate_things_data); // fallback data
        expect(this.requests[0].url).to.contain(str);

        window.advocate_things_data = origWindowAdvocateThingsData;
    });

    it('should correctly identify arguments (obj, fun)', function () {
        // Arrange
        var defToken = 'abc123';
        var obj = { obj: 'obj' };
        var fun = sinon.sandbox.spy();
        _prepareDataSpy = sinon.sandbox.spy(window.AT, '_prepareData');
        _getDefaultTokenStub = sinon.sandbox.stub(window.AT, 'getDefaultToken');
        _getDefaultTokenStub.returns(defToken);

        // Act
        AT.consumeToken(obj, fun);
        this.requests[0].respond(400); // quickest route to finish

        // Assert
        expect(fun.calledOnce).to.be(true); // If this wasn't the case, typeof spy != function and would fail
        expect(_prepareDataSpy.args[0][0]).to.eql(obj);
        expect(this.requests[0].url).to.contain(defToken);
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

    it('should use the specified data when it is provided', function () {
        // Arrange
        var origWindowAdvocateThingsData = window.advocate_thing_data;
        var _prepareDataSpy = sinon.sandbox.spy(window.AT, '_prepareData');
        window.advocate_things_data = {
            _at: {
                name: 'foo',
                userId: 'id3'
            }
        };
        var data = { some: 'data' };

        // Act
        AT.consumeToken('foo', data);

        // Assert
        expect(_prepareDataSpy.args[0][0]).to.eql(data);

        window.advocate_things_data = origWindowAdvocateThingsData;
    });

    it('should fallback to using window.advocate_things_data when no data is provided', function () {
        // Arrange
        var origWindowAdvocateThingsData = window.advocate_thing_data;
        var _prepareDataSpy = sinon.sandbox.spy(window.AT, '_prepareData');
        window.advocate_things_data = {
            _at: {
                name: 'foo',
                userId: 'id3'
            }
        };

        // Act
        AT.consumeToken('foo', null);

        // Assert
        expect(_prepareDataSpy.args[0][0]).to.eql(window.advocate_things_data);

        window.advocate_things_data = origWindowAdvocateThingsData;
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

    it('should return the token that was returned by the server (same one in session storage)', function () {
        // Arrange
        var token = 'abc123';
        _getShareTokensStub = sinon.sandbox.stub(window.AT, '_getShareTokens');
        _getShareTokensStub.returns([token]);
        var spy = sinon.sandbox.spy();

        // Act
        AT.consumeToken({ _at: { shareChannel: 'foo' } }, spy);
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
