var expect = require('expect.js');
var sinon = require('sinon');

var _ = require('lodash');

var _appendTokenToUrlStub;
var _prepareDataSpy;

var jsonStringifySpy;

describe('createToken()', function () {

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

    it('should have a createToken function', function () {
	expect(AT.createToken).to.be.a('function');
    });

    it('should correctly identify arguments (str, obj, fun)', function () {
        var str = 'str';
        var obj = { obj: 'obj' };
        var fun = sinon.sandbox.spy();


	AT.createToken(str, obj, fun);
        this.requests[0].respond(400); // quickest route to finish
        expect(fun.calledOnce).to.be(true); // If this wasn't the case, typeof spy != function and would fail
        // TODO: assertions for name and obj.

        AT.createToken(obj, fun);
        // TODO: all assertions

        AT.createToken(fun);
        // TODO: all assertions

        AT.createToken(str, fun);
        // TODO: all assertions
    });

    it('should return an error if the XHR fails - with cb', function () {
        // Arrange
        var spy = sinon.sandbox.spy();

        // Act
	AT.createToken({}, spy);
        this.requests[0].respond(400);

        // Assert
        expect(this.requests.length).to.be(1);
        var err = spy.args[0][0];
        expect(err.message).to.equal('Bad Request');
    });

    it('should return if the XHR fails - no cb', function () {
        // Arrange
        var jsonSpy = sinon.sandbox.spy(window.JSON, 'parse');
        _prepareDataStub = sinon.sandbox.stub(window.AT, '_prepareData'); // So JSON.parse is not used externally

        // Act
        AT.createToken({});
        this.requests[0].respond(400);

        // Assert
        expect(this.requests.length).to.be(1);
        expect(jsonSpy.called).to.be(false);
    });

    it('should return an the array of tokens received from the server', function () {
        // Arrange
        var tokens = [
            { token: 'foo',
              sharepointName: 'bar' }
        ];
        var spy = sinon.sandbox.spy();

        // Act
        AT.createToken({}, spy);
        this.requests[0].respond(
            201,
            { 'Content-Type': 'application/json; charset=utf-8' },
            JSON.stringify(tokens)
        );

        // Assert
        expect(this.requests.length).to.equal(1);
        var err = spy.args[0][0];
        var res = spy.args[0][1];
        expect(err).to.be(null);
        expect(res).to.eql(tokens);
    });

    it('should assign the global AT.shareToken with the new share token', function () {
	// Arrange
        var tokens = [
            { token: 'foo',
              sharepointName: 'bar' }
        ];
        var spy = sinon.sandbox.spy();

        // Act
        AT.createToken({}, spy);
        this.requests[0].respond(
            201,
            { 'Content-Type': 'application/json; charset=utf-8' },
            JSON.stringify(tokens)
        );

        // Assert
        expect(AT.shareToken).to.equal(tokens[0].token);
    });

    it('should assign the global AT.queryParamName with the new query parameter name', function () {
	// Arrange
        var tokens = [
            { token: 'foo',
              sharepointName: 'bar',
              queryParamName: 'ATAT' }
        ];
        var spy = sinon.sandbox.spy();

        // Act
        AT.createToken({}, spy);
        this.requests[0].respond(
            201,
            { 'Content-Type': 'application/json; charset=utf-8' },
            JSON.stringify(tokens)
        );

        // Assert
        expect(AT.queryParamName).to.equal(tokens[0].queryParamName);
    });

    it('should append the received token to the URL with the query parameter name for the token', function () {
        // Arrange
        var tokens = [
            { token: 'foo',
              sharepointName: 'bar',
              queryParamName: 'ATAT',
              abs: true }
        ];
        var spy = sinon.sandbox.spy();
        var _appendTokenToUrlStub = sinon.sandbox.stub(window.AT, '_appendTokenToUrl');

        // Act
        AT.createToken({}, spy);
        this.requests[0].respond(
            201,
            { 'Content-Type': 'application/json; charset=utf-8' },
            JSON.stringify(tokens)
        );

        // Assert
        expect(_appendTokenToUrlStub.args[0][0]).to.eql(tokens);
    });
});
