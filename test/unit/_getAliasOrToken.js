var expect = require('expect.js');
var sinon = require('sinon');

describe('_getAliasOrToken()', function () {

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

    it('should have a _getAliasOrToken function', function () {
        expect(AT._getAliasOrToken).to.be.a('function');
    });

    it('should return null if no data is provided', function () {
	expect(AT._getAliasOrToken()).to.be(null);
    });

    it('should return null if a non object is provided', function () {
	expect(AT._getAliasOrToken('')).to.be(null);
        expect(AT._getAliasOrToken('foo')).to.be(null);
        expect(AT._getAliasOrToken([])).to.be(null);
        expect(AT._getAliasOrToken(['one', 'two'])).to.be(null);
    });

    it('should return null if an object is provided with no token or alias', function () {
	expect(AT._getAliasOrToken({foo: 'foo', bar: 'bar'})).to.be(null);
    });

    it('should return the alias if one is present', function () {
        var obj = { token: 'token123' };
	expect(AT._getAliasOrToken(obj)).to.be(obj.token);
    });

    it('should return the token if one is provided', function () {
        var obj = { alias: 'alias123' };
	expect(AT._getAliasOrToken(obj)).to.be(obj.alias);
    });

    it('should preferentially return the alias if an alias and a token is provided', function () {
        var obj = { token: 'token123', alias: 'alias123' };
	expect(AT._getAliasOrToken(obj)).to.be(obj.alias);
    });
});
