var expect = require('expect.js');
var sinon = require('sinon');

var _prepareDataStub;
var _appendTokenToUrlStub;

describe('simplified SDK functions', function () {
    beforeEach(function () {
	sinon.sandbox.create();
    });

    afterEach(function () {
        sinon.sandbox.restore();
    });

    it('should have a createToken function', function () {
	expect(AT.createToken).to.be.a('function');
    });

    describe('createToken()', function () {
        beforeEach(function () {
	    this.xhr = sinon.useFakeXMLHttpRequest();
            var requests = this.requests = [];
            this.xhr.onCreate = function (xhr) {
                requests.push(xhr);
            };
        });

        afterEach(function () {
            this.xhr.restore();
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
                200,
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
                200,
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
                200,
                { 'Content-Type': 'application/json; charset=utf-8' },
                JSON.stringify(tokens)
            );

            // Assert
            expect(AT.queryParamName).to.equal(tokens[0].queryParamName);
        });

        it('should append the received token to the URL with the query parameter name', function () {
            // Arrange
            var tokens = [
                { token: 'foo',
                  sharepointName: 'bar',
                  queryParamName: 'ATAT' }
            ];
            var spy = sinon.sandbox.spy();
            var _appendTokenToUrlStub = sinon.sandbox.stub(window.AT, '_appendTokenToUrl');

            // Act
            AT.createToken({}, spy);
            this.requests[0].respond(
                200,
                { 'Content-Type': 'application/json; charset=utf-8' },
                JSON.stringify(tokens)
            );

            // Assert
            expect(_appendTokenToUrlStub.args[0][0]).to.equal(tokens[0].token);
            expect(_appendTokenToUrlStub.args[0][1]).to.equal(tokens[0].queryParamName);
        });
    });

    describe('updateToken()', function () {
        beforeEach(function () {
	    this.xhr = sinon.useFakeXMLHttpRequest();
            var requests = this.requests = [];
            this.xhr.onCreate = function (xhr) {
                requests.push(xhr);
            };
        });

        afterEach(function () {
            this.xhr.restore();
        });

        it('should fail if no token is provided - with cb', function () {
            // Act
            AT.updateToken(null, {}, function (err, res) {
                // Assert
                expect(err.message).to.be('[updateToken] You must specify a token to update.');
            });
        });

        it('should fail if no token is provided - no cb', function () {
            // Act
            AT.updateToken(null, {});

            // Assert
            expect(this.requests.length).to.be(0);
        });

        it('should fail if the token is an empty string - with cb', function () {
            // Act
            AT.updateToken('', {}, function (err, res) {
                // Assert
                expect(err.message).to.be('[updateToken] You must specify a token to update.');
            });
        });

        it('should fail if the token is an empty string - no cb', function () {
            // Act
            AT.updateToken('', {});

            // Assert
            expect(this.requests.length).to.be(0);
        });

        it('should return the token that was returned by the server (same one in args)', function () {
            // Arrange
            var token = { token: 'footoken' };
            var spy = sinon.sandbox.spy();

            // Act
            AT.updateToken('token', {}, spy);
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

    describe('lockToken', function () {
        beforeEach(function () {
	    this.xhr = sinon.useFakeXMLHttpRequest();
            var requests = this.requests = [];
            this.xhr.onCreate = function (xhr) {
                requests.push(xhr);
            };
        });

        afterEach(function () {
            this.xhr.restore();
        });

        it('should fail if no token is provided - with cb', function () {
            // Act
            AT.lockToken(null, function (err, res) {
                // Assert
                expect(err.message).to.be('[lockToken] You must specify a token to lock.');
            });
        });

        it('should fail if no token is provided - no cb', function () {
            // Act
            AT.lockToken(null);

            // Assert
            expect(this.requests.length).to.be(0);
        });

        it('should fail if the token is an empty string - with cb', function () {
            // Act
            AT.lockToken('', function (err, res) {
                // Assert
                expect(err.message).to.be('[lockToken] You must specify a token to lock.');
            });
        });

        it('should fail if the token is an empty string - no cb', function () {
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
    });

    describe('consumeToken', function () {
        beforeEach(function () {
	    this.xhr = sinon.useFakeXMLHttpRequest();
            var requests = this.requests = [];
            this.xhr.onCreate = function (xhr) {
                requests.push(xhr);
            };
        });

        afterEach(function () {
            this.xhr.restore();
        });

        it('should fail if no token is provided - with cb', function () {
            // Act
            AT.consumeToken(null, {}, function (err, res) {
                // Assert
                expect(err.message).to.be('[consumeToken] You must specify a token to lock.');
            });
        });

        it('should fail if no token is provided - no cb', function () {
            // Act
            AT.consumeToken(null);

            // Assert
            expect(this.requests.length).to.be(0);
        });

        it('should fail if the token is an empty string - with cb', function () {
            // Act
            AT.consumeToken('', function (err, res) {
                // Assert
                expect(err.message).to.be('[consumeToken] You must specify a token to lock.');
            });
        });

        it('should fail if the token is an empty string - no cb', function () {
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
});
