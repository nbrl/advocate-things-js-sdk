var expect = require('expect.js');
var sinon = require('sinon');

var _autoSendSpy;
var initStub;

describe('asynchronous loading', function () {
    beforeEach(function () {
	sinon.sandbox.create();
    });

    afterEach(function () {
        sinon.sandbox.restore();
    });

    describe('initialisation functions', function () {
        it('should have an init function', function () {
	    expect(AT.init).to.be.a('function');
        });
    });

    describe('init()', function () {
        beforeEach(function () {
	    _autoSendSpy = sinon.sandbox.spy(window.AT, '_autoSend');
        });

        xit('should immediately return if no configuration is provided', function () {
            // Can't currently test
            // Act
            AT.init();
        });

        it('should immediately return if no API key is specified', function () {
            // Act
	    AT.init({autoSend: true}); // Need autoSend to test if stub called.

            // Assert
            expect(_autoSendSpy.called).to.be(false);
        });

        it('should call autoSend if it is enabled', function () {
            // Act
            AT.init({
                apiKey: 'foo',
                autoSend: true
            });

            // Assert
            expect(_autoSendSpy.calledOnce).to.be(true);
        });

        it('should not call autoSend if it is disabled', function () {
            // Act
            AT.init({
                apiKey: 'foo',
                autoSend: false
            });

            // Assert
            expect(_autoSendSpy.called).to.be(false);
        });
    });

    describe('example implementation', function () {
        beforeEach(function () {

        });
        afterEach(function () {
            window.atAsyncInit = undefined;
            var el = document.getElementById('advocate-things-script');
            if (el) {
                el.parentNode.removeChild(el);
            }
        });

        xit('should allow the basic implementation to work', function () {
            // For now this breaks the functions that expect the 'old' SDK implementation.
            var history = window.History;
            window.History = undefined; // Stops History.js re-initialisation error.
            initStub = sinon.sandbox.stub(window.AT, 'init');

            // Define async init var
            window.atAsyncInit = function () {
                AT.init({
                    apiKey: 'foo',
                    autoSend: false,
                    debug: true
                });
            };

            expect(initStub.called).to.be(false);

            (function(d, s, id){
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) {return;}
                js = d.createElement(s); js.id = id;
                js.src = "/base/dist/sdk.js";
                fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'advocate-things-script'));

            setTimeout(function () {
                // Small hack to give the script time to load
                expect(initStub.calledOnce).to.be(true);
            }, 50);

            window.History = history;
        });
    });
});
