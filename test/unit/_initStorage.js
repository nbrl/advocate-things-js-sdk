var expect = require('expect.js');
var sinon = require('sinon');

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
});
