var expect = require('expect.js');
var sinon = require('sinon');

var _initStorageStub;

var storeNotExists = {
    hasItem: function () {
        return false;
    }
};

var storeEmpty = {
    hasItem: function () {
        return true;
    },
    getItem: function () {
        return JSON.stringify({});
    }
};

var storedTokens = JSON.stringify({
    api_key_with_data: [
        { token: 'token1',
          metadata: 'meta1'
        },
        { token: 'token2',
          metadata: 'meta2'
        }
    ],
    api_key_without_data: [],
    another_api_key_with_data: [
        { token: 'shouldNeverSeeThisToken',
          metadata: 'irrelevent'
        }
    ]
});

var storeFull = {
    hasItem: function () {
        return true;
    },
    getItem: function () {
        return storedTokens;
    }
};

describe('_getTouchpointShareTokens()', function () {

    beforeEach(function () {
	sinon.sandbox.create();

        this.xhr = sinon.useFakeXMLHttpRequest();
        var requests = this.requests = [];
        this.xhr.onCreate = function (xhr) {
            requests.push(xhr);
        };
    });

    afterEach(function () {
        sinon.sandbox.restore();

        this.xhr.restore();
    });

    it('should have a _getTouchpointShareTokens function', function () {
        expect(AT._getTouchpointShareTokens).to.be.a('function');
    });

    xit('should return an empty array if there is no advocate things storage', function () {
        _initStorageStub = sinon.sandbox.stub(window.AT, '_initStorage');
        _initStorageStub.returns(storeNotExists);
        AT._autoInit();

        AT.init({
            apiKey: 'foo',
            autoSend: false
        });

	expect(AT._getTouchpointShareTokens()).to.eql([]);
    });

    it('should return an empty array if the advocate things storage is empty', function () {
        _initStorageStub = sinon.sandbox.stub(window.AT, '_initStorage');
        _initStorageStub.returns(storeEmpty);
        AT._autoInit();

        AT.init({
            apiKey: 'foo',
            autoSend: false
        });

	expect(AT._getTouchpointShareTokens()).to.eql([]);
    });

    it('should return an empty array if there are no stored objects for a client api key', function () {
	_initStorageStub = sinon.sandbox.stub(window.AT, '_initStorage');
        _initStorageStub.returns(storeFull);
        AT._autoInit();

        AT.init({
            apiKey: 'api_key_without_data',
            autoSend: false
        });

        expect(AT._getTouchpointShareTokens()).to.eql([]);
    });

    it('should return an array of tokens for the provided client api key', function () {
        _initStorageStub = sinon.sandbox.stub(window.AT, '_initStorage');
        _initStorageStub.returns(storeFull);
        AT._autoInit();

        AT.init({
            apiKey: 'api_key_with_data',
            autoSend: false
        });

        expect(AT._getTouchpointShareTokens()).to.eql([
            'token1',
            'token2'
        ]);
    });
});
