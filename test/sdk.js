var expect = require('expect.js');
var sinon = require('sinon');
var _ = require('lodash');

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

        it('should have a tidyDataObject function', function () {
	    expect(AT.tidyDataObject).to.be.a('function');
        });

        it('should have a getTokenOrAlias function', function () {
	    expect(AT.getTokenOrAlias).to.be.a('function');
        });
    });

    describe('helper functions', function () {
        afterEach(function () {
            // Remove any injected script tags from previous tests so we don't
            // end up with duplicates.
            var scriptTag = document.getElementById(scriptTagId);
            if (scriptTag) {
                scriptTag.parentNode.removeChild(scriptTag);
            }
        });

        describe('getApiKey()', function () {
            it('should return null when no API key is present', function () {
                var res = AT.getApiKey();
                expect(res).to.equal(null);
            });

            it('should return null if no ?key query parameter is present on the element src', function () {
                var fakeScriptElement = document.createElement('script');
                fakeScriptElement.id = scriptTagId;
                fakeScriptElement.src = 'https://some.url/path/sdk.js?thisisaqpm=butwrong';
                fakeScriptElement.type = 'text/javascript';
                // document.head does not exist in IE <= 9
                document.getElementsByTagName('head')[0].appendChild(fakeScriptElement);

                var res = AT.getApiKey();

                expect(res).to.equal(null);
            });

            it('should return the API key if one is present', function () {
                var fakeScriptElement = document.createElement('script');
                fakeScriptElement.id = scriptTagId;
                fakeScriptElement.src = 'https://some.url/path/sdk.js?key=realkey';
                fakeScriptElement.type = 'text/javascript';
                document.getElementsByTagName('head')[0].appendChild(fakeScriptElement);

                var res = AT.getApiKey();

                expect(res).to.equal('realkey');
            });
        });

        describe('tidyDataObject()', function () {
            var minDataObject;
            var apiKey = 'abcdef123456';

            beforeEach(function () {
                // Re-initialise internal variable for API key
                var getApiKeyStub = sinon.sandbox.stub(AT, 'getApiKey');
                getApiKeyStub.returns(apiKey);
                AT.init();
            });

            function checkStructure(res, hasMeta) {
                expect(res._at).to.be.an('object');
                expect(res._at.apiKey).to.equal(apiKey);
                expect(res._at.fingerprint).to.be.a('string');
                expect(res._at.url).to.match(/^http[s]*:\/\//);
                if (hasMeta) {
                    expect(res._client).to.be.an('object');
                } else {
                    expect(res._client).to.eql({});
                }
            }

            it('should return a minimally initialised object if the provided data is undefined/null', function () {
	        var resNull = AT.tidyDataObject(null);
                var resEmpty = AT.tidyDataObject();

                checkStructure(resNull);
                checkStructure(resEmpty);
            });

            it('should return a minimally initialised object if the provided data is an empty object', function () {
	        var res = AT.tidyDataObject({});

                checkStructure(res);
            });

            it('should return a minimally initialised object if the provided data has no _at but has meta', function () {
                var data = {
                    foo: {
                        bar: 'baz'
                    }
                };
	        var res = AT.tidyDataObject(data);

                checkStructure(res, true);
            });

            it('should not clobber extra valid parameters in the _at object', function () {
                var emailAddress = 'johnsmith@example.com';
                var data = {
                    _at: {
                        email: emailAddress
                    }
                };

	        var res = AT.tidyDataObject(data);

                // Check it still adheres to the minimal spec
                checkStructure(res);

                // Check supplied params not clobbered
                expect(res._at.email).to.equal(emailAddress);
            });

            it('should not clobber extra valid parameters in the _at object', function () {
                var randomValue = 'some nonsense goes in here';
                var paramName = 'randomUnsupported_parameter';
                var data = {
                    _at: {}
                };
                data._at[paramName] = randomValue;

	        var res = AT.tidyDataObject(data, function () {
                    console.log('hello world');
                });

                // Check it still adheres to the minimal spec
                checkStructure(res);

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

	        var res = AT.tidyDataObject(data);

                // Check it still adheres to the minimal spec (including metadata)
                checkStructure(res, true);

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

	        var res = AT.tidyDataObject(data);

                // Check it still adheres to the minimal spec (including metadata)
                checkStructure(res, true);

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

	        var res = AT.tidyDataObject(data);

                // Check it still adheres to the minimal spec (including metadata)
                checkStructure(res, true);

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

	        var res = AT.tidyDataObject(data);

                // Check it still adheres to the minimal spec (including metadata)
                checkStructure(res, true);

                expect(res._client).to.eql(expectedClientObject);
            });
        });

        describe('getTokenOrAlias()', function () {
            it('should return null if given an empty or null argument', function () {
                expect(AT.getTokenOrAlias()).to.be(null);
                expect(AT.getTokenOrAlias(null)).to.be(null);
            });

            it('should return null if given an empty object', function () {
	        expect(AT.getTokenOrAlias({})).to.be(null);
            });

            it('should return null if given an object which does not contain alias or token', function () {
                var data = {
                    foo: 'bar',
                    baz: 'qux'
                };
                expect(AT.getTokenOrAlias(data)).to.be(null);
            });

            it('should return the sharepoint alias if it is present', function () {
                var data = {
                    alias: 'foo'
                };
                expect(AT.getTokenOrAlias(data)).to.be(data.alias);
            });

            it('should preferentially return the alias if both alias and token are present', function () {
                var data = {
                    alias: 'foo',
                    token: 'bar'
                };
                expect(AT.getTokenOrAlias(data)).to.be(data.alias);
            });

            it('should return the sharepoint token if no alias is available', function () {
                var data = {
                    token: 'foo'
                };
                expect(AT.getTokenOrAlias(data)).to.be(data.token);
            });
        });

        describe('initEventListeners()', function () {
            it('should return an object with keys for all supported events initialised with empty arrays', function () {
	        var listeners = AT.initEventListeners();
                var expectedEventKeys = ['SharepointSaved', 'TouchpointSaved', 'ReferredPerson'];

                expectedEventKeys.forEach(function (key) {
                    expect(listeners[key]).to.eql([]);
                });
            });
        });

        // describe('init()', function () {
        //     var getATScriptElementStub;
        //     var getApiKeyStub;

        //     beforeEach(function() {
        //         getATScriptElementStub = sinon.sandbox.stub(AT, 'getATScriptElement');
        //         getApiKeyStub = sinon.sandbox.stub(AT, 'getApiKey');
        //     });

        //     it('should return false during init if no valid API key is present', function () {
        //         getApiKeyStub.returns(false);
	//         var res = AT.init();
        //         expect(res).to.equal(false);
        //     });

        //     it('should not return false if an API key is present', function () {
        //         getApiKeyStub.returns(true);

	//         var res = AT.init();
        //         expect(res).to.not.equal(false);
        //     });
        // });
    });

    describe('public functions', function () {
        var apiKey = 'abcdef123456';

        describe('sendSharepoint()', function () {
            beforeEach(function () {
                // Re-initialise internal variable for API key
                var fakeScriptElement = document.createElement('script');
                fakeScriptElement.id = scriptTagId;
                fakeScriptElement.src = 'https://some.url/path/sdk.js?key=' + apiKey;
                fakeScriptElement.type = 'text/javascript';
                document.getElementsByTagName('head')[0].appendChild(fakeScriptElement);
                AT.getApiKey();
            });

            afterEach(function () {
                var scriptTag = document.getElementById(scriptTagId);
                if(scriptTag) {
                    scriptTag.parentNode.removeChild(scriptTag);
                }
            });

            it('should return immediately if no apiKey is set', function () {
                var res = AT.sendSharepoint();

                expect(res).to.be(null);
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
