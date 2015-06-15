var expect = require('expect.js');
var sinon = require('sinon');

describe('addEventListener()', function () {

    beforeEach(function () {
	sinon.sandbox.create();

        this.xhr = sinon.useFakeXMLHttpRequest();
        var requests = this.requests = [];
        this.xhr.onCreate = function (xhr) {
            requests.push(xhr);
        };

        AT._autoInit();         // clear out event listeners

        AT.init({
            apiKey: 'foo',
            autoSend: false
        });
    });

    afterEach(function () {
        sinon.sandbox.restore();

        this.xhr.restore();
    });

    it('should have a addEventListener function', function () {
        // Assert
        expect(AT.addEventListener).to.be.a('function');
    });

    xit('should return immediately if attempting to add a non-existent type', function () {
        // Can't currently test as cannot call non-existent type!
    });

    it('should return immediately if attempting to add a non-function', function () {
        // Act
        AT._autoInit();
        AT.addEventListener(AT.Events.TokenCreated, 'foo');

        // Assert
        AT._triggerEvent(AT.Events.TokenCreated); // will fail if trying to `call` a string
    });

    it('should add an event listener to the correct event type', function () {
        // Arrange
        var spy = sinon.sandbox.spy();

        // Act
        AT.addEventListener(AT.Events.TokenCreated, spy);
        AT._triggerEvent(AT.Events.TokenCreated);

        // Assert
        expect(spy.calledOnce).to.be(true);
    });

    it('should add multiple event listeners to the correct event type', function () {
        // Arrange
        var spy1 = sinon.sandbox.spy();
        var spy2 = sinon.sandbox.spy();

        // Act
        AT.addEventListener(AT.Events.TokenCreated, spy1);
        AT.addEventListener(AT.Events.TokenCreated, spy2);
        AT._triggerEvent(AT.Events.TokenCreated);

        // Assert
        expect(spy1.calledOnce).to.be(true);
        expect(spy2.calledOnce).to.be(true);
    });

    it('should event listeners to multiple types and keep them separated', function () {
        // Arrange
        var spyTC = sinon.sandbox.spy();
        var spyTU = sinon.sandbox.spy();

        // Act
        AT.addEventListener(AT.Events.TokenCreated, spyTC);
        AT.addEventListener(AT.Events.TokenUpdated, spyTU);
        AT._triggerEvent(AT.Events.TokenCreated);

        // Assert
        expect(spyTC.calledOnce).to.be(true);
        expect(spyTU.calledOnce).to.be(false);
    });
})
