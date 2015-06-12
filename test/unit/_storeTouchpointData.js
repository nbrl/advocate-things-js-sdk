var expect = require('expect.js');
var sinon = require('sinon');

var _initStorageStub;

describe('_storeTouchpointData()', function () {

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

    it('should have a _storeTouchpointData function', function () {
        expect(AT._storeTouchpointData).to.be.a('function');
    });

    it('should return immediately if called without data', function () {
        var hasItemStub = sinon.sandbox.stub();
        var store = {
            hasItem: hasItemStub
        };

        _initStorageStub = sinon.sandbox.stub(window.AT, '_initStorage');
        _initStorageStub.returns(store);
        AT._autoInit();
        AT.init({
            apiKey: 'foo',
            autoSend: false
        });

	AT._storeTouchpointData();

        expect(hasItemStub.called).to.be(false);
    });

    it('should return immediately if called with non-[object Object]', function () {
        var hasItemStub = sinon.sandbox.stub();
        var store = {
            hasItem: hasItemStub
        };

        _initStorageStub = sinon.sandbox.stub(window.AT, '_initStorage');
        _initStorageStub.returns(store);
        AT._autoInit();
        AT.init({
            apiKey: 'foo',
            autoSend: false
        });

	AT._storeTouchpointData('foo');
        AT._storeTouchpointData(['foo']);
        AT._storeTouchpointData(1337);

        expect(hasItemStub.called).to.be(false);
    });

    xit('should initialise an empty object in our namespace if it is empty', function () {

    });

    xit('should not reinitialise an empty object in our namespace if it is not empty', function () {

    });

    xit('should not overwrite data that already exists with the same key', function () {

    });

    xit('should should add the given data to the array under the right api key', function () {

    });

    xit('should add the given data to the array under the right api key when data lready exists', function () {

    });

    xit('should not store a token again if it already exists in storage', function () {

    });

    xit('should  update a token that is already present with new metadata rather than partially duplicating', function () {

    });
});
