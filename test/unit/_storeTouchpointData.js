var expect = require('expect.js');
var sinon = require('sinon');

describe.only('_storeTouchpointData()', function () {

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
        // Assert
        expect(AT._storeTouchpointData).to.be.a('function');
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
})
