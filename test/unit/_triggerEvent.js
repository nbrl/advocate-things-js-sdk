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

    it('should have a _triggerEvent function', function () {
        // Assert
        expect(AT._triggerEvent).to.be.a('function');
    });

    it('should call the correct functions for the listener', function () {
        // Arrange
        var spyTC = sinon.sandbox.spy();
        var spyTU = sinon.sandbox.spy();
        AT.addEventListener(AT.Events.TokenCreated, spyTC);
        AT.addEventListener(AT.Events.TokenUpdated, spyTU);

        // Act
	AT._triggerEvent(AT.Events.TokenCreated);

        // Assert
        expect(spyTC.calledOnce).to.be(true);
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
