var expect = require('expect.js');
var sinon = require('sinon');

describe('registerTouch()', function () {

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

    it('should have a registerTouch function', function () {
        expect(AT.registerTouch).to.be.a('function');
    });

    it('should return an error if the XHR fails - with cb', function () {

    });

    it('should return if the XHR fails - no cb', function () {

    });
});
