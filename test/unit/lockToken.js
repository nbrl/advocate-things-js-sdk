var expect = require('expect.js');
var sinon = require('sinon');

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
