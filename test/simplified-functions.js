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
});
