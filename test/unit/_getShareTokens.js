var expect = require('expect.js');
var sinon = require('sinon');

var apiKey = 'foo';

describe.only('_getShareTokens()', function () {

    beforeEach(function () {
	sinon.sandbox.create();

        this.xhr = sinon.useFakeXMLHttpRequest();
        var requests = this.requests = [];
        this.xhr.onCreate = function (xhr) {
            requests.push(xhr);
        };

        AT.init({
            apiKey: apiKey,
            autoSend: false
        });
    });

    afterEach(function () {
        sinon.sandbox.restore();

        this.xhr.restore();
    });

    it('should have a _getShareTokens function', function () {
        expect(AT._getShareTokens).to.be.a('function');
    });

    it('should return an empty array if there are no tokens stored for the current api key', function () {
        var fakeStore = {
            getItem: function () {
                var data = {
                    wrongapikey: [ 'foo', 'bar', 'baz' ]
                };

                return JSON.stringify(data);
            }
        };

        var _initSessionStorageStub = sinon.sandbox.stub(window.AT, '_initSessionStorage');
        _initSessionStorageStub.returns(fakeStore);
        AT._autoInit();

        expect(AT._getShareTokens()).to.eql([]);
    });

    it('should return an array of tokens when there are tokens stored for the current api key', function () {
        var fakeStore = {
            getItem: function () {
                var data = {
                    wrongapikey: [ 'foo', 'bar', 'baz' ]
                };
                data[apiKey] = [ 'one', 'two' ];

                return JSON.stringify(data);
            }
        };

        var _initSessionStorageStub = sinon.sandbox.stub(window.AT, '_initSessionStorage');
        _initSessionStorageStub.returns(fakeStore);
        AT._autoInit();

        expect(AT._getShareTokens()).to.eql([ 'one', 'two' ]);
    });
});
