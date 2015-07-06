var expect = require('expect.js');
var sinon = require('sinon');

var storageName = 'advocate-things';

describe('_initStorage()', function () {

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

    it('should have a _initStorage function', function () {
        expect(AT._initStorage).to.be.a('function');
    });

    it('should return a store object', function () {
	var store = AT._initStorage();

        expect(store).to.be.an('object');
    });

    it('should have a getItem function on the store object', function () {
        var store = AT._initStorage();

	expect(store.getItem).to.be.a('function');
    });

    it('should have a setItem function on the store object', function () {
        var store = AT._initStorage();

        expect(store.setItem).to.be.a('function');
    });

    it('should have a hasItem function on the store object', function () {
        var store = AT._initStorage();

        expect(store.hasItem).to.be.a('function');
    });

    it('should have a removeItem function on the store object', function () {
        var store = AT._initStorage();

        expect(store.removeItem).to.be.a('function');
    });

    it('should initialise the storage if it is uninitialised', function () {
        var origCookieStorage = AT._utils.cookieStorage;
        var origLclStorage = AT._utils.lclStorage;

        var setItemSpy = sinon.sandbox.spy();
        AT._utils.cookieStorage = AT._utils.lclStorage = {
            hasItem: function () {
                return false;
            },
            setItem: function (storeName, toStore) {
                if (storeName === 'test') {
                    return;
                }

                return setItemSpy(storeName, toStore);
            }
        };

        AT._initStorage();

        expect(setItemSpy.calledOnce).to.be(true);
        expect(setItemSpy.args[0][0]).to.equal(storageName);
        expect(setItemSpy.args[0][1]).to.equal(JSON.stringify({}));

        // Revert
        AT._utils.cookieStorage = origCookieStorage;
        AT._utils.lclStorage = origLclStorage;
    });
});
