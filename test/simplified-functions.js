var expect = require('expect.js');
var sinon = require('sinon');

describe.only('simplified SDK functions', function () {
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

        it('should return an the array of tokens received from the server', function () {
            // Arrange
            var tokens = [
                { token: 'foo',
                  sharepointName: 'bar' }
            ];
            var spy = sinon.sandbox.spy();

            // Act
            AT.createToken({}, spy);

            // Assert
            expect(this.requests.length).to.equal(1);

            // Act
            this.requests[0].respond(
                200,
                { 'Content-Type': 'application/json; charset=utf-8' },
                JSON.stringify(tokens)
            );

            // Assert
            var err = spy.args[0][0];
            var res = spy.args[0][1];
            expect(err).to.be(null);
            expect(res).to.eql(tokens);
        });

        it('should return an error if a non-20x response is received from the server', function () {
	    // Arrange
            var spy = sinon.sandbox.spy();

            // Act
            AT.createToken({}, spy);
            this.requests[0].respond(
                400,
                { 'Content-Type': 'text/plain; charset=utf-8' }
            );

            // Assert
            var err = spy.args[0][0];
            expect(err.message).to.equal('Bad Request');
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

            // Act
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

            // Act
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

            // Act
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
