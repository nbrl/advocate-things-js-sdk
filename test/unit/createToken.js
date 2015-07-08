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

    it('should correctly identify arguments ()', function () {
        // Arrange
        _prepareDataSpy = sinon.sandbox.spy(window.AT, '_prepareData');
        var origWindowAdvocateThingsData = window.advocate_things_data;
        window.advocate_things_data = { foo: 'bar' };

        // Act
        AT.createToken();
        this.requests[0].respond(400);

        // Assert
        expect(JSON.parse(this.requests[0].requestBody)._at.touchpointName).to.equal(undefined);
        expect(_prepareDataSpy.args[0][0]).to.eql(window.advocate_things_data);
        expect(_prepareDataSpy.args[0][0]).to.eql(window.advocate_things_data); // when data is null, use this

        window.advocate_things_data = origWindowAdvocateThingsData; // restore
    });

    it('should correctly identify arguments (str)', function () {
        // Arrange
        var str = 'str123';
        _prepareDataSpy = sinon.sandbox.spy(window.AT, '_prepareData');

        // Act
        AT.createToken(str);
        this.requests[0].respond(400);

        // Assert
        expect(JSON.parse(this.requests[0].requestBody)._at.sharepointName).to.equal(str);
    });

    it('should correctly identify arguments (obj)', function () {
        // Arrange
        var obj = { obj: 'obj' };
        _prepareDataSpy = sinon.sandbox.spy(window.AT, '_prepareData');

        // Act
        AT.createToken(obj);

        // Assert
        expect(_prepareDataSpy.args[0][0]).to.eql(obj);
    });

    it('should correctly identify arguments (func)', function () {
        // Arrange
        var fun = sinon.sandbox.spy();
        var origWindowAdvocateThingsData = window.advocate_things_data;
        window.advocate_things_data = { foo: 'bar' };
        _prepareDataSpy = sinon.sandbox.spy(window.AT, '_prepareData');

        // Act
        AT.createToken(fun);
        this.requests[0].respond(400); // quickest route to finish

        // Assert
        expect(fun.calledOnce).to.be(true); // If this wasn't the case, typeof spy != function and would fail
        expect(_prepareDataSpy.args[0][0]).to.eql(window.advocate_things_data); // fallback data

        window.advocate_things_data = origWindowAdvocateThingsData;
    });

    it('should correctly identify arguments (str, obj)', function () {
        // Arrange
        var str = 'str123';
        var obj = { obj: 'obj' };
        _prepareDataSpy = sinon.sandbox.spy(window.AT, '_prepareData');

        // Act
        AT.createToken(str, obj);
        this.requests[0].respond(400);

        // Assert
        expect(JSON.parse(this.requests[0].requestBody)._at.sharepointName).to.equal(str);
        expect(_prepareDataSpy.args[0][0]).to.eql(obj);
    });

    it('should correctly identify arguments (str, func)', function () {
        // Arrange
        var str = 'str123';
        var fun = sinon.sandbox.spy();
        var origWindowAdvocateThingsData = window.advocate_things_data;
        window.advocate_things_data = { foo: 'bar' };
        _prepareDataSpy = sinon.sandbox.spy(window.AT, '_prepareData');

        // Act
        AT.createToken(str, fun);
        this.requests[0].respond(400); // quickest route to finish

        // Assert
        expect(fun.calledOnce).to.be(true); // If this wasn't the case, typeof spy != function and would fail
        expect(_prepareDataSpy.args[0][0]).to.eql(window.advocate_things_data); // fallback data
        expect(JSON.parse(this.requests[0].requestBody)._at.sharepointName).to.equal(str);

        window.advocate_things_data = origWindowAdvocateThingsData;
    });

    it('should correctly identify arguments (obj, fun)', function () {
        // Arrange
        var obj = { obj: 'obj' };
        var fun = sinon.sandbox.spy();
        _prepareDataSpy = sinon.sandbox.spy(window.AT, '_prepareData');

        // Act
        AT.registerTouch(obj, fun);
        this.requests[0].respond(400); // quickest route to finish

        // Assert
        expect(fun.calledOnce).to.be(true); // If this wasn't the case, typeof spy != function and would fail
        expect(_prepareDataSpy.args[0][0]).to.eql(obj);
    });

    it('should correctly identify arguments (str, obj, fun)', function () {
        // Arrange
        var str = 'str123';
        var obj = { obj: 'obj' };
        var fun = sinon.sandbox.spy();
        _prepareDataSpy = sinon.sandbox.spy(window.AT, '_prepareData');

        // Act
        AT.createToken(str, obj, fun);
        this.requests[0].respond(400); // quickest route to finish

        // Assert
        expect(fun.calledOnce).to.be(true); // If this wasn't the case, typeof spy != function and would fail
        expect(_prepareDataSpy.args[0][0]).to.eql(obj);
        expect(JSON.parse(this.requests[0].requestBody)._at.sharepointName).to.equal(str);
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
        AT.createToken('foo', data);

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
        AT.createToken('foo', null);

        // Assert
        expect(_prepareDataSpy.args[0][0]).to.eql(window.advocate_things_data);

        window.advocate_things_data = origWindowAdvocateThingsData;
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
