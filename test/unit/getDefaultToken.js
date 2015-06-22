var expect = require('expect.js');
var sinon = require('sinon');

var _getShareTokensStub;

describe('getDefaultToken()', function () {

    beforeEach(function () {
	sinon.sandbox.create();

        this.xhr = sinon.useFakeXMLHttpRequest();
        var requests = this.requests = [];
        this.xhr.onCreate = function (xhr) {
            requests.push(xhr);
        };

	_getShareTokensStub = sinon.sandbox.stub(window.AT, '_getShareTokens');

        AT.init({
            apiKey: 'foo',
            autoSend: false
        });
    });

    afterEach(function () {
        sinon.sandbox.restore();

        this.xhr.restore();
    });

    it('should have a getDefaultToken function', function () {
        expect(AT.getDefaultToken).to.be.a('function');
    });

    it('should return null if there are no stored tokens', function () {
        _getShareTokensStub.returns([]);

        expect(AT.getDefaultToken()).to.equal(null);
    });

    it('should return the first share token in the share token array', function () {
	_getShareTokensStub.returns([ 'foo', 'bar', 'baz' ]);

        expect(AT.getDefaultToken()).to.equal('foo');
    });
});
