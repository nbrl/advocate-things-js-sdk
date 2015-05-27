var expect = require('expect.js');
var sinon = require('sinon');

var scriptId = 'advocate-things-script';
var scriptUrl = 'https://cloudfront.whatever/bucket/sdk.js';
var apiKey = 'foobar';

describe('the SDK', function () {

    beforeEach(function () {
        sinon.sandbox.create();
    });

    afterEach(function () {
        sinon.sandbox.restore();
    });

    describe('basics', function () {

        it('should have an AT object in window', function () {
	    expect(window.AT).to.be.an('object');
        });

    });



    describe('_getApiKey()', function () {

        function addScriptToPage() {
            var elScript = document.createElement('script');
            elScript.id = scriptId;
            elScript.src = scriptUrl + '?key=' + apiKey;
            elScript.type = 'text/javascript';
            document.getElementsByTagName('head')[0].appendChild(elScript);
        }

        function removeScriptFromPage() {
            var elScript = document.getElementById(scriptId);
            if (elScript) {
                elScript.parentNode.removeChild(elScript);
            }
        }

        afterEach(function () {
            removeScriptFromPage();
        });

        it('should return null if there is no AT script element on the page', function () {
            // Assert
            expect(AT._getApiKey()).to.be(null);
        });

        it('should return null if there is an AT script but no key', function () {
            // Arrange
            addScriptToPage();
            document.getElementById(scriptId).src = scriptUrl;

	    // Assert
            expect(AT._getApiKey()).to.be(null);
        });

        it('should return the correct api key', function () {
            // Arrange
            addScriptToPage();

            // Assert
	    expect(AT._getApiKey()).to.equal(apiKey);
        });

    });



    describe('sendSharepoint()', function () {

        it('should return null if there is no api key', function () {
	    var getApiKeyStub = sinon.sandbox.stub(window.AT, '_getApiKey');
            getApiKeyStub.returns(apiKey);

            expect(AT._getApiKey()).to.equal(apiKey);
        });

    });

});
