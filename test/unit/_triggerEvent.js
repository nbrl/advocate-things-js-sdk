var expect = require('expect.js');
var sinon = require('sinon');

describe('_triggerEvent()', function () {

    beforeEach(function () {
	sinon.sandbox.create();

        this.xhr = sinon.useFakeXMLHttpRequest();
        var requests = this.requests = [];
        this.xhr.onCreate = function (xhr) {
            requests.push(xhr);
        };

        AT._autoInit(); // reinitialise event listeners

        AT.init({
            apiKey: 'foo',
            autoSend: false
        });
    });

    afterEach(function () {
        sinon.sandbox.restore();

        this.xhr.restore();
    });

    it('should have a _triggerEvent function', function () {
        // Assert
        expect(AT._triggerEvent).to.be.a('function');
    });

    it('should call an event listener for the named event type', function () {
        // Arrange
	var spy = sinon.sandbox.spy();

        AT.addEventListener(AT.Events.TokenCreated, spy);

        // Act
        AT._triggerEvent(AT.Events.TokenCreated);

        // Assert
        expect(spy.calledOnce).to.be(true);
    });

    it('should call multiple listeners if they exist for the same event', function () {
        // Arrange
	var spy1 = sinon.sandbox.spy();
        var spy2 = sinon.sandbox.spy();

        AT.addEventListener(AT.Events.TokenCreated, spy1);
        AT.addEventListener(AT.Events.TokenCreated, spy2);

        // Act
        AT._triggerEvent(AT.Events.TokenCreated);

        // Assert
        expect(spy1.calledOnce).to.be(true);
        expect(spy2.calledOnce).to.be(true);
    });

    it('should call only the listeners associated with the triggered event', function () {
        // Arrange
        var evt1Spy1 = sinon.sandbox.spy();
        var evt1Spy2 = sinon.sandbox.spy();
        var evt2Spy1 = sinon.sandbox.spy();

        AT.addEventListener(AT.Events.TokenCreated, evt1Spy1);
        AT.addEventListener(AT.Events.TokenCreated, evt1Spy2);
        AT.addEventListener(AT.Events.UpdateToken, evt2Spy1);

        // Act
        AT._triggerEvent(AT.Events.TokenCreated);

        // Assert
        expect(evt1Spy1.calledOnce).to.be(true);
        expect(evt1Spy2.calledOnce).to.be(true);
        expect(evt2Spy1.called).to.be(false);
    });
});
