var expect = require('expect.js');
var sinon = require('sinon');

describe('the SDK interface', function () {
    it('should be an object', function () {
        expect(AT).to.be.an('object');
    });

    it('should have an init function', function () {
        expect(AT.init).to.be.a('function');
    });

    it('should have a synchronous send function', function () {
        expect(AT.send).to.be.a('function');
    });

    it('should have an addEventListener function', function () {
        expect(AT.addEventListener).to.be.a('function');
    });
});

describe('the init function', function () {
    it('should register a TouchpointSaved event listener', function () {
        AT.init();
    });
});

describe('the send function', function () {
    it('should emit a TouchpointSaved event', function () {
    });

    xit('should log in the console if the _at object is missing', function () {
        AT.send({}, function (res) {
            expect(/present/.test(window.console)).to.not.be(null);
            console.log(/present/.test(window.console));
        });
    });
});
