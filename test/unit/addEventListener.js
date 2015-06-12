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

    xit('should return immediately if an invalid event is given', function () {
        // TODO: fix if possible - can only test with _triggerEvent, but can't
        //       trigger a fake event type!
    });

    it('should add an event listener to the correct type', function () {
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
});
