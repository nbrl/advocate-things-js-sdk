var expect = require('expect.js');
var sinon = require('sinon');

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

    it('should fail if no token is provided - with cb', function () {
        // Act
        AT.consumeToken(null, {}, function (err, res) {
            // Assert
            expect(err.message).to.be('[consumeToken] You must specify a token to consume.');
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
            expect(err.message).to.be('[consumeToken] You must specify a token to consume.');
        });
    });

    it('should fail if the token is an empty string - no cb', function () {
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
});
