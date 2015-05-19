var expect = require('expect.js');
var sinon = require('sinon');

var scriptTagId = 'advocate-things-script';

describe('the SDK', function () {
    beforeEach(function () {
        sinon.sandbox.create();
    });

    afterEach(function () {
        sinon.sandbox.restore();
    });

    describe('the SDK interface', function () {
        it('should be an object', function () {
            expect(AT).to.be.an('object');
        });

        it('should have a getApiKey function', function () {
	    expect(AT.getApiKey).to.be.a('function');
        });

        it('should have an init function', function () {
            expect(AT.init).to.be.a('function');
        });

        it('should have an initStorage function', function () {
	    expect(AT.initStorage).to.be.a('function');
        });
    });

    describe('exposed functions', function () {
        beforeEach(function () {
            // Remove any injected script tags from previous tests so we don't
            // end up with duplicates.
            var scriptTag = document.getElementById(scriptTagId);
            if (scriptTag) {
                scriptTag.parentNode.removeChild(scriptTag);
            }
        });

        describe('getApiKey()', function () {
            it('should return false when no API key is present', function () {
                var res = AT.getApiKey();
                expect(res).to.equal(false);
            });

            it('should return false if no ?key query parameter is present on the element src', function () {
                var fakeScriptElement = document.createElement('script');
                fakeScriptElement.id = scriptTagId;
                fakeScriptElement.src = 'https://some.url/path/sdk.js?thisisaqpm=butwrong';
                fakeScriptElement.type = 'text/javascript';
                document.head.appendChild(fakeScriptElement);

                var res = AT.getApiKey();

                expect(res).to.equal(false);
            });

            it('should return true if an API key is present', function () {
                var fakeScriptElement = document.createElement('script');
                fakeScriptElement.id = scriptTagId;
                fakeScriptElement.src = 'https://some.url/path/sdk.js?key=realkey';
                fakeScriptElement.type = 'text/javascript';
                document.head.appendChild(fakeScriptElement);

                var res = AT.getApiKey();

                expect(res).to.equal(true);
            });
        });

        describe('initStorage()', function () {

        });

        describe('init()', function () {
            var getATScriptElementStub;
            var getApiKeyStub;

            beforeEach(function() {
                getATScriptElementStub = sinon.sandbox.stub(AT, 'getATScriptElement');
                getApiKeyStub = sinon.sandbox.stub(AT, 'getApiKey');
            });

            it('should return false during init if no valid API key is present', function () {
                getApiKeyStub.returns(false);
	        var res = AT.init();
                expect(res).to.equal(false);
            });

            it('should not return false if an API key is present', function () {
                getApiKeyStub.returns(true);

	        var res = AT.init();
                expect(res).to.not.equal(false);
            });
        });
    });

    // it('should have a send function', function () {
    //     expect(AT.send).to.be.a('function');
    // });

    // it('should have a sendSharepoint function', function () {
    //     expect(AT.sendSharepoint).to.be.a('function');
    // });

    // it('should have a sendTouchpoint function', function () {
    //     expect(AT.sendTouchpoint).to.be.a('function');
    // });

    // it('should have an addEventListener function', function () {
    //     expect(AT.addEventListener).to.be.a('function');
    // });

    // it('should expose an enum of events', function () {
    //     expect(AT.Events).to.be.an('object');
    //     expect(AT.Events.TouchpointSaved).to.be.a('string');
    //     expect(AT.Events.SharepointSaved).to.be.a('string');
    //     expect(AT.Events.ReferredPerson).to.be.a('string');
    // });

    // it('should expose the most recently referred person', function () {
    //     expect(AT.referredPerson).to.be(null); // initially
    // });

    // it('should expose the current sharepoint token', function () {
    //     expect(AT.sharepointToken).to.be(null); // initially
    // });
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
