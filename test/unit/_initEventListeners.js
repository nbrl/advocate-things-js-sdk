var expect = require('expect.js');
var sinon = require('sinon');

describe('_initEventListeners()', function () {

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

    it('should have a _initEventListeners function', function () {
        expect(AT._initEventListeners).to.be.a('function');
    });

    it('should return an object of listener arrays', function () {
        var res = AT._initEventListeners();

        // AT.Events.forEach(function (evt) {
        //     console.log('Evt: ' + evt);
        //     expect(res[evt]).to.be.an('array');
        // });
        for (var evt in AT.Events) {
            if (AT.Events.hasOwnProperty(evt)) {
                expect(res[evt]).to.be.an('array');
            }
        }
    });
});
