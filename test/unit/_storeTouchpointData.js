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

        AT.init({
            apiKey: 'foo',
            autoSend: false
        });
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

    it('should return immediately if the passed data is falsy', function () {
        // Arrange
        var spy = sinon.sandbox.spy();
        var store = {
            hasItem: spy
        };
        _initStorageStub = sinon.sandbox.stub(window.AT, '_initStorage');
        _initStorageStub.returns(store);
        AT._autoInit();

        // Act
        AT._storeTouchpointData(null);

        // Assert
        expect(spy.called).to.be(false);
    });

    it('should return immediately if the passed data is not an object', function () {
        // Arrange
        var spy = sinon.sandbox.spy();
        var store = {
            hasItem: spy
        };
        _initStorageStub = sinon.sandbox.stub(window.AT, '_initStorage');
        _initStorageStub.returns(store);
        AT._autoInit();

        // Act
        AT._storeTouchpointData({});
        AT._storeTouchpointData([]);
        AT._storeTouchpointData('foo');
        AT._storeTouchpointData(123);

        // Assert
        expect(spy.called).to.be(false);
    });

    it('should return immediately if the passed object does not have a token property', function () {
        // Arrange
        var spy = sinon.sandbox.spy();
        var store = {
            hasItem: spy
        };
        _initStorageStub = sinon.sandbox.stub(window.AT, '_initStorage');
        _initStorageStub.returns(store);
        AT._autoInit();

        // Act
        AT._storeTouchpointData({foo: 'foo', bar: 'bar'});

        // Assert
        expect(spy.called).to.be(false);
    });

    it('should initialise the advocate-things storage item if it does not exist', function () {
        var jsonParseSpy = sinon.sandbox.spy(window.JSON, 'parse');
        AT._autoInit();
        AT.init({
            apiKey: 'foo',
            autoSend: false
        });

        AT._storeTouchpointData({ token: 'foo' });
        expect(jsonParseSpy.calledOnce).to.be(true);
    });
});
