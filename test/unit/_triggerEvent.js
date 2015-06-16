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
        var spyTC1 = sinon.sandbox.spy();
        var spyTC2 = sinon.sandbox.spy();
        var spyTU = sinon.sandbox.spy();
        AT.addEventListener(AT.Events.TokenCreated, spyTC1);
        AT.addEventListener(AT.Events.TokenCreated, spyTC2);
        AT.addEventListener(AT.Events.TokenUpdated, spyTU);

        // Act
	AT._triggerEvent(AT.Events.TokenCreated);

        // Assert
        expect(spyTC1.calledOnce).to.be(true);
        expect(spyTC2.calledOnce).to.be(true);
        expect(spyTU.calledOnce).to.be(false);
    });

    it('should call the function with defined data', function () {
        // Arrange
        var spy = sinon.sandbox.spy();
        AT.addEventListener(AT.Events.TokenCreated, spy);
        var data = {
            foo: 'bar'
        };

        // Act
	AT._triggerEvent(AT.Events.TokenCreated, data);

        // Assert
        expect(spy.calledOnce).to.be(true);
        expect(spy.args[0][0]).to.eql(data);
    });
});
