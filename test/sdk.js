var expect = require('expect.js');
var sinon = require('sinon');

describe('the SDK interface', function () {
    it('should be an object', function () {
        expect(AT).to.be.an('object');
    });

    it('should have an init function', function () {
        expect(AT.init).to.be.a('function');
    });

    it('should have a send function', function () {
        expect(AT.send).to.be.a('function');
    });

    it('should have a sendSharepoint function', function () {
        expect(AT.sendSharepoint).to.be.a('function');
    });

    it('should have a sendTouchpoint function', function () {
        expect(AT.sendTouchpoint).to.be.a('function');
    });

    it('should have an addEventListener function', function () {
        expect(AT.addEventListener).to.be.a('function');
    });

    it('should expose an enum of events', function () {
        expect(AT.Events).to.be.an('object');
        expect(AT.Events.TouchpointSaved).to.be.a('string');
        expect(AT.Events.SharepointSaved).to.be.a('string');
        expect(AT.Events.ReferredPerson).to.be.a('string');
    });

    it('should expose the most recently referred person', function () {
        expect(AT.referredPerson).to.be(null); // initially
    });

    it('should expose the current sharepoint token', function () {
        expect(AT.sharepointToken).to.be(null); // initially
    });
});

// describe('the init function', function () {
//     it('should register a TouchpointSaved event listener', function () {
//         var myListener = function () {};
//         AT.addEventListener('TouchpointSaved', myListener);

//         console.log(listeners);
//     });
// });

// describe('the send function', function () {
//     it('should emit a TouchpointSaved event', function () {
//     });

//     xit('should log in the console if the _at object is missing', function () {
//         AT.send({}, function (res) {
//             expect(/present/.test(window.console)).to.not.be(null);
//             console.log(/present/.test(window.console));
//         });
//     });
// });
