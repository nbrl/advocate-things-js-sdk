var expect = require('expect.js');
var sinon = require('sinon');

var _initEventListenersSpy;
var _initStorageSpy;

describe('_autoInit()', function () {

    beforeEach(function () {
	sinon.sandbox.create();

        this.xhr = sinon.useFakeXMLHttpRequest();
        var requests = this.requests = [];
        this.xhr.onCreate = function (xhr) {
            requests.push(xhr);
        };

        _initEventListenersSpy = sinon.sandbox.spy(window.AT, '_initEventListeners');
        _initStorageSpy = sinon.sandbox.spy(window.AT, '_initStorage');

        AT.init({
            apiKey: 'foo',
            autoSend: false
        });
    });

    afterEach(function () {
        sinon.sandbox.restore();

        this.xhr.restore();
    });

    it('should have a _autoInit function', function () {
        // Assert
        expect(AT._autoInit).to.be.a('function');
    });

    it('should initialise the event listeners object', function () {
        // Act
        AT._autoInit();

        // Assert
	expect(_initEventListenersSpy.calledOnce).to.be(true);
    });

    it('should initialise SDK storage', function () {
        // Act
        AT._autoInit();

        // Assert
	expect(_initStorageSpy.calledOnce).to.be(true);
    });
})
