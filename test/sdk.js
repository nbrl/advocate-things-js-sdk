var expect = require('expect.js');
var sinon = require('sinon');
var _ = require('lodash');

var scriptId = 'advocate-things-script';
var scriptUrl = 'https://cloudfront.whatever/bucket/sdk.js';
var apiKey = 'foobar';

var _getApiKeyStub;

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



    describe('_prepareData()', function () {

        beforeEach(function () {
            _getApiKeyStub = sinon.sandbox.stub(window.AT, '_getApiKey');
            _getApiKeyStub.returns(apiKey);
        });

        function checkMinObj (data, hasMeta) {
            expect(data._at).to.be.an('object');
            expect(data._at.apiKey).to.equal(apiKey);
            expect(data._at.fingerprint).to.be.a('string');
            expect(data._at.url).to.match(/^http[s]*:\/\//);
            if (hasMeta) {
                expect(data._client).to.be.an('object');
            } else {
                expect(data._client).to.eql({});
            }
        }

        it('should return a minimally initialised object if called with non-[object Object]', function () {
            var args = [ null, undefined, 'string', [ 'array' ]];

            for (var i=0; i<args.length; i++) {
                checkMinObj(AT._prepareData(args[i]));
            }
        });

        it('should return a minimally initialised object if called with an empty object', function () {
	    checkMinObj(AT._prepareData({}));
        });

        it('should return a minimally initialised object if the provided data has no _at but has meta', function () {
	    var data = {
                foo: {
                    bar: 'baz'
                }
            };

            var res = AT._prepareData(data);
            checkMinObj(res, true);
            expect(res._client).to.eql(data);
        });

        it('should not clobber extra valid parameters in the _at object', function () {
	    var emailAddress = 'johnsmith@example.com';
            var data = {
                _at: {
                    email: emailAddress
                }
            };

            var res = AT._prepareData(data);
            checkMinObj(res, true);
            expect(res._at.email).to.equal(emailAddress);
        });

        it('should not clobber extra invalid parameters in the _at object', function () {
            var randomValue = 'some nonsense goes in here';
            var paramName = 'randomUnsupported_parameter';
            var data = {
                _at: {}
            };
            data._at[paramName] = randomValue;

            var res = AT._prepareData(data)

            // Check it still adheres to the minimal spec
            checkMinObj(res);

            // Check supplied params not clobbered
            expect(res._at[paramName]).to.equal(randomValue);
        });

        it('should correctly tidy the object when client metadata is present', function () {
            var emailAddress = 'johnsmith@example.com';
            var meta = {
                transaction: {
                    amount: 50.50,
                    products: [
                        'product-1',
                        'product-2',
                        'firetruck'
                    ]
                }
            };
            var data = {
                _at: {
                    email: emailAddress
                }
            };
            _.extend(data, meta);

            var res = AT._prepareData(data);

            // Check it still adheres to the minimal spec (including metadata)
            checkMinObj(res, true);

            expect(res._client).to.eql(meta);
        });

        it('should not touch the object when _client object exists and no new data is present', function () {
            var data = {
                _at: {
                    email: 'johnsmith@example.com'
                },
                _client: {
                    transaction: {
                        amount: 24.99,
                        items: [ 'one', 'two' ],
                        order_id: '12352341'
                    }
                }
            };

            var res = AT._prepareData(data);

            // Check it still adheres to the minimal spec (including metadata)
            checkMinObj(res, true);

            expect(res._client).to.eql(data._client);
        });

        it('should correctly insert any new data when client metadata and a _client object exists', function () {
            var data = {
                _at: {
                    email: 'johnsmith@example.com'
                },
                _client: {
                    transaction: {
                        amount: 24.99,
                        items: [ 'one', 'two' ],
                        order_id: '12352341'
                    }
                }
            };
            var extraData = {
                user_facebook_id: 'fb1234'
            };
            _.extend(data, extraData);

            var expectedClientObject = _.extend(data._client, extraData);

            var res = AT._prepareData(data);

            // Check it still adheres to the minimal spec (including metadata)
            checkMinObj(res, true);

            expect(res._client).to.eql(expectedClientObject);
        });

        it('should overwrite keys in the _client object if conflicting client metadata and _client object exists', function () {
            var data = {
                _at: {
                    email: 'johnsmith@example.com'
                },
                _client: {
                    transaction: {
                        amount: 24.99,
                        items: [ 'one', 'two' ],
                        order_id: '12352341'
                    }
                }
            };
            var extraData = {
                transaction: {
                    amount: 15.49
                }
            };
            _.extend(data, extraData);

            // Note that this replaces the whole transaction object.
            var expectedClientObject = _.extend(data._client, extraData);

            var res = AT._prepareData(data);

            // Check it still adheres to the minimal spec (including metadata)
            checkMinObj(res, true);

            expect(res._client).to.eql(expectedClientObject);
        });

    });



    describe('sendSharepoint()', function () {

        beforeEach(function () {
            _getApiKeyStub = sinon.sandbox.stub(window.AT, '_getApiKey');
            _getApiKeyStub.returns(apiKey);
        });

        it('should return immediately if there is no api key', function () {
            // Arrange
            _getApiKeyStub.returns(null);

            expect(AT.sendSharepoint()).to.be(null);
        });

    });

});
