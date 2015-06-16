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
        // TODO: fix if possible - can only test with _triggerEvent, but can't
        //       trigger a fake event type!
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

    it('should only allow functions to be added as listeners', function () {
        // Arrage
        AT.addEventListener(AT.Events.TokenCreated, null);
        AT.addEventListener(AT.Events.TokenCreated, 'string');
        AT.addEventListener(AT.Events.TokenCreated, {});
        AT.addEventListener(AT.Events.TokenCreated, { string: 'string'});
        AT.addEventListener(AT.Events.TokenCreated, []);
        AT.addEventListener(AT.Events.TokenCreated, ['string']);

        // Act/Assert - this will fail if trigger tries to call a non-function.
        AT._triggerEvent(AT.Events.TokenCreated);
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
