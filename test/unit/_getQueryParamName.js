var expect = require('expect.js');
var sinon = require('sinon');

// TODO: rethink this as if there is no query param name, it just won't be appended.
var defaultQueryParamName = 'AT'; // Although useless, this in the SDK means that
                                  // we'll never end up with foo.com?null=foo

describe('_getQueryParamName()', function () {

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

    it('should have a _getQueryParamName function', function () {
        expect(AT._getQueryParamName).to.be.a('function');
    });

    it('should return a default query param name if no data is provided', function () {
	expect(AT._getQueryParamName()).to.be(defaultQueryParamName);
    });

    it('should return a default query param name if a non object is provided', function () {
	expect(AT._getQueryParamName('')).to.be(defaultQueryParamName);
        expect(AT._getQueryParamName('foo')).to.be(defaultQueryParamName);
        expect(AT._getQueryParamName([])).to.be(defaultQueryParamName);
        expect(AT._getQueryParamName(['one', 'two'])).to.be(defaultQueryParamName);
    });

    it('should return a default query param name if an object is provided with no query param name', function () {
	expect(AT._getQueryParamName({foo: 'foo', bar: 'bar'})).to.be(defaultQueryParamName);
    });

    it('should return the alias if one is present', function () {
        var obj = { queryParamName: 'FOO' };
	expect(AT._getQueryParamName(obj)).to.be(obj.queryParamName);
    });
});
