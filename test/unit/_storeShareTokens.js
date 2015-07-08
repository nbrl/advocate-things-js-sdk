var expect = require('expect.js');
var sinon = require('sinon');

var apiKey = 'foobarbaz';
var defaultSessionStorageName = 'advocate-things-session';

describe('_storeShareTokens()', function () {

    beforeEach(function () {
	sinon.sandbox.create();

        this.xhr = sinon.useFakeXMLHttpRequest();
        var requests = this.requests = [];
        this.xhr.onCreate = function (xhr) {
            requests.push(xhr);
        };

        AT._autoInit();         // restore everything
        AT.init({
            apiKey: apiKey,
            autoSend: false
        });
    });

    afterEach(function () {
        sinon.sandbox.restore();

        this.xhr.restore();
    });

    it('should have a _storeShareTokens function', function () {
        expect(AT._storeShareTokens).to.be.a('function');
    });

    it('should return immediately if the passed data is not an array', function () {
        var jsonParseSpy = sinon.sandbox.spy(window.JSON, 'parse');

	AT._storeShareTokens(null);
        AT._storeShareTokens({});
        AT._storeShareTokens('string');
        AT._storeShareTokens(123);

        expect(jsonParseSpy.called).to.be(false);
    });

    it('should store only the tokens from the passed object array', function () {
        var setItemSpy = sinon.sandbox.spy();
        var fakeStore = {
            setItem: setItemSpy,
            getItem: function () {
                var stored = {
                    anotherApiKey: [
                        'one', 'two', 'three'
                    ]
                };
                stored[apiKey] = [
                    'foo', 'bar', 'baz'
                ];

                return JSON.stringify(stored);
            }
        };
        var _initSessionStorageStub = sinon.sandbox.stub(window.AT, '_initSessionStorage');
        _initSessionStorageStub.returns(fakeStore);
        AT._autoInit();

	var tokenData = [
            { token: 'foo' },
            { token: 'bar' },
            { token: 'baz' }
        ];

        AT._storeShareTokens(tokenData);

        expect(setItemSpy.args[0][0]).to.equal(defaultSessionStorageName);
        var tokenArrayForApiKey = JSON.parse(setItemSpy.args[0][1])[apiKey];
        expect(tokenArrayForApiKey).to.eql(['foo','bar','baz']);
    });
});
