var expect = require('expect.js');
var sinon = require('sinon');
var _ = require('lodash');

var scriptId = 'advocate-things-script';
var scriptUrl = 'https://cloudfront.whatever/bucket/sdk.js';
var apiKey = 'foobar';
var defaultQueryParamName = 'AT';

var spcUrl = 'https://sharepoint-data-collector.herokuapp.com/sharepoint/data';
var tpcUrl = 'https://touchpoint-data-collector.herokuapp.com/touchpoint/data';

var _autoSendStub;
var _getApiKeyStub;
var _initStub;
var _initEventListenersStub;
var _initStorageStub;
var _prepareDataStub;
var _storeTouchpointDataStub;
var _triggerEventStub;

var sendStub;
var sendSharepointStub;
var sendTouchpointStub;

var _appendTokenToUrlSpy;

// http://www.dangaur.com/blog/2013/12/29/dangerous-testing-with-mocha.html
var skipie7 = true; // set to true to skip certain tests that fail on IE7

describe('the SDK', function () {

    beforeEach(function () {
        sinon.sandbox.create();
    });

    afterEach(function () {
        sinon.sandbox.restore();
    });

    describe('the SDK interface', function () {

        it('should have an AT object in window', function () {
            expect(window.AT).to.be.an('object');
        });

        describe('external', function () {

            it('should have an addEventListener function', function () {
                expect(AT.addEventListener).to.be.a('function');
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

        });

        describe('internal', function () {

            it('should have an _autoSend function', function () {
                expect(AT._autoSend).to.be.a('function');
            });

            it('should have an _init function', function () {
                expect(AT._init).to.be.a('function');
            });

            it('should have an _appendTokenToUrl function', function () {
                expect(AT._appendTokenToUrl).to.be.a('function');
            });

            it('should have a _getApiKey function', function () {
                expect(AT._getApiKey).to.be.a('function');
            });

            it('should have a _getSharepointTokens function', function () {
                expect(AT._getSharepointTokens).to.be.a('function');
            });

            it('should have a _getTokenOrAlias function', function () {
                expect(AT._getTokenOrAlias).to.be.a('function');
            });

            it('should have an _initEventListeners function', function () {
                expect(AT._initEventListeners).to.be.a('function');
            });

            it('should have an _initStorage function', function () {
                expect(AT._initStorage).to.be.a('function');
            });

            it('should have a _log function', function () {
                expect(AT._log).to.be.a('function');
            });

            it('should have a _prepareData function', function () {
                expect(AT._prepareData).to.be.a('function');
            });

            it('should have a _storeTouchpointData function', function () {
                expect(AT._storeTouchpointData).to.be.a('function');
            });

            it('should have a _triggerEvent function', function () {
                expect(AT._triggerEvent).to.be.a('function');
            });

        });

    });

    describe('internal functions', function () {

        describe('_appendTokenToUrl()', function () {

            afterEach(function () {

            });

            it('should immediately return null if token is not set', function () {
                var token = null;
                var param = 'bar';
                expect(AT._appendTokenToUrl(token, param)).to.be(null);
            });

            it('should immediately return null if query param name is not set', function () {
                var token = 'foo';
                var param = null;
                expect(AT._appendTokenToUrl(token, param)).to.be(null);
            });

            it('should immediately return null if neither token or param are set', function () {
                var token = null;
                var param = null;
                expect(AT._appendTokenToUrl(token, param)).to.be(null);
            });

            it('should append the query parameter to the page url', function () {
                // History isn't implemented in legacy browsers, so rewrites of query params don't work the same.
                // They are approached with a hashtag hack, which presently doesn't work properly.
                // Before: http://localhost:9876/context.html
                // After (html5): http://localhost:9876/context.html?query
                // After (html4): http://localhost:9876/context.html#?query
                // Actual (html4): http://localhost:9876/context.html#context.html?query
                var token = 'foo';
                var param = 'bar';

                var res = AT._appendTokenToUrl(token, param);
                expect(window.location.href.split('?').pop()).to.contain(param + '=' + token);

                // This would fail on ie7 because the query params are after the #.
                (!skipie7) && expect(window.location.search).to.equal('?' + param + '=' + token);
            });

            (!skipie7) && it('should append the query parameter to the page url when it is not the first', function () {
                var token = 'foo';
                var param = 'bar';

                // Append another query param
                History.replaceState(null, null, '?ignore=true');

                var res = AT._appendTokenToUrl(token, param);
                expect(window.location.href.split('?').pop()).to.contain(param + '=' + token);

                // This would fail on ie7
                expect(window.location.search).to.contain(param + '=' + token);

                // Remove ignore=true
                History.replaceState(null, null, '?');
            });

            (!skipie7) && it('should append the query parameter to the page url (before the hash) when a hash parameter is present', function () {
                var token = 'foo';
                var param = 'bar';

                window.location.hash = 'somehash';
                var res = AT._appendTokenToUrl(token, param);

                var str = param + '=' + token;
                expect(window.location.href.split('?').pop()).to.contain(str);
                expect(window.location.href.indexOf(str)).to.be.below(window.location.href.indexOf('#'));

                // This would fail on ie7
                expect(window.location.search).to.contain(str);
            });

            (!skipie7) && it('should append the query parameter to the page url (before the hash) when a hash parameter is present and query params alraedy exist', function () {
                var token = 'foo';
                var param = 'bar';

                History.replaceState(null, null, '?ignore=true');
                window.location.hash = 'somehash';

                var res = AT._appendTokenToUrl(token, param);

                var str = param + '=' + token;
                expect(window.location.href.split('?').pop()).to.contain(str);
                expect(window.location.href.indexOf(str)).to.be.below(window.location.href.indexOf('#'));

                // This would fail on ie7
                expect(window.location.search).to.contain(str);

                // Restore query params
                History.replaceState(null, null, '?');
            });

            xit('should not overwrite the window title when updating the history (query param)', function () {
                // Don't appear to be able to get anything useful re: page title. It is to do with how karma
                // executes test, but document.title is always undefined. This is actually correct as the
                // karma test runner HTML has empty title tags as found by:
                //   console.log(document.getElementsByTagName('title')[0].innerHTML);
                //   console.log(document.documentElement.innerHTML);
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

        describe('_getQueryParamName()', function () {

            it('should return a default when called with null', function () {
                expect(AT._getQueryParamName(null)).to.equal(defaultQueryParamName);
            });

            it('should return a default when called with an empty object', function () {
                expect(AT._getQueryParamName({})).to.equal(defaultQueryParamName);
            });

            it('should return a default when called with an empty array', function () {
                expect(AT._getQueryParamName([])).to.equal(defaultQueryParamName);
            });

            it('should return a default when called with a string', function () {
                expect(AT._getQueryParamName('string')).to.equal(defaultQueryParamName);
            });

            it('should return a default when any object passed in does not contain a query param name', function () {
                var obj = {
                    token: 'bar',
                    alias: 'baz',
                    somethingElse: [ 'entirely' ]
                };

                expect(AT._getQueryParamName(obj)).to.equal(defaultQueryParamName);
            });

            it('should return the query param name from the passed object', function () {
                var qpm = 'foobarbaz';
                var obj = {
                    token: 'foo',
                    queryParamName: qpm
                };

                expect(AT._getQueryParamName(obj)).to.equal(qpm);
            });

            it('should return the query param name from the first object in an array of objects if param present', function () {
                var qpm = 'foobarbaz';
                var arr = [
                    {
                        token: 'foo',
                        queryParamName: qpm
                    },
                    {
                        token: 'bar',
                        queryParamName: 'notqpm'
                    }
                ];

                expect(AT._getQueryParamName(arr)).to.equal(qpm);
            });

            it('should return the default query param name when the object in array[0] does not have name defined', function () {
                var arr = [
                    {
                        token: 'foo'
                    }
                ];

                expect(AT._getQueryParamName(arr)).to.equal(defaultQueryParamName);
            });

            it('should return the default query param name when the object in array[0] does not have name defined even when array[>=1] does', function () {
                var qpm = 'foobarbaz';
                var arr = [
                    {
                        token: 'bar'
                    },
                    {
                        token: 'foo',
                        queryParamName: qpm
                    }
                ];

                expect(AT._getQueryParamName(arr)).to.equal(defaultQueryParamName);
            });

            it('should return the default query param name when the element array[0] is not an object', function () {
                var qpm = 'foobarbaz';
                var arr = [
                    [],
                    {
                        token: 'foo',
                        queryParamName: qpm
                    }
                ];

                expect(AT._getQueryParamName(arr)).to.equal(defaultQueryParamName);
            });

            it('should return the default query param name when the element array[0] is null', function () {
                var qpm = 'foobarbaz';
                var arr = [
                    null,
                    {
                        token: 'foo',
                        queryParamName: qpm
                    }
                ];

                expect(AT._getQueryParamName(arr)).to.equal(defaultQueryParamName);
            });

            it('should return the default query param name when queryParamName is defined but is null', function () {
                var qpm = 'foobarbaz';
                var obj = {
                        token: 'foo',
                        queryParamName: null
                };

                expect(AT._getQueryParamName(obj)).to.equal(defaultQueryParamName);
            });

            it('should return the default query param name when queryParamName is defined but is an empty string', function () {
                var qpm = 'foobarbaz';
                var obj = {
                        token: 'foo',
                        queryParamName: ''
                };

                expect(AT._getQueryParamName(obj)).to.equal(defaultQueryParamName);
            });

        });

        describe('_getSharepointTokens()', function () {
            var fakeTokens = ['foo', 'bar', 'baz', 'qux'];

            function storage(hasItems) {
                _getApiKeyStub = sinon.sandbox.stub(window.AT, '_getApiKey');
                _getApiKeyStub.returns(apiKey);

                var storedData = {
                    keyWithoutData: [],
                    keyWithData: [
                        { token: 'foo', metadata: {} },
                        { token: 'bar', metadata: {} },
                        { token: 'baz', metadata: {} },
                        { token: 'qux', metadata: {} }
                    ]
                };

                var fakeStore = {
                    hasItem: function (key) {
                        return hasItems;
                    },
                    getItem: function (key) {
                        return (hasItems) ? JSON.stringify(storedData) : null;
                    }
                };

                _initStorageStub = sinon.sandbox.stub(window.AT, '_initStorage');
                _initStorageStub.returns(fakeStore);

                sendStub = sinon.sandbox.stub(window.AT, 'send');
                sendStub.returns(null);

                AT._init();
            }

            it('should return an empty array if there are no entries for advocate things', function () {
                //_utilsStoreHasItemStub.returns(false);
                storage(false);
                var res = AT._getSharepointTokens();

                expect(res).to.be.an('array');
                expect(res.length).to.equal(0);
            });

            it('should return an empty array if there is no storage property corresponding to our api key', function () {
                storage(true);

                _getApiKeyStub.returns('keyWithoutData');

                var res = AT._getSharepointTokens();

                expect(res).to.be.an('array');
                expect(res).to.eql([]);
            });

            it('should return an array of sharepoint tokens when they exist', function () {
                storage(true);

                _getApiKeyStub.returns('keyWithData');

                var res = AT._getSharepointTokens();

                expect(res).to.be.an('array');
                expect(res).to.eql(['foo', 'bar', 'baz', 'qux']);
            });

        });

        describe('_getTokenOrAlias()', function () {

            it('should return null if given an empty or null argument', function () {
                expect(AT._getTokenOrAlias()).to.be(null);
                expect(AT._getTokenOrAlias(null)).to.be(null);
            });

            it('should return null if given an empty object', function () {
                expect(AT._getTokenOrAlias({})).to.be(null);
            });

            it('should return null if given an object which does not contain alias or token', function () {
                var data = {
                    foo: 'bar',
                    baz: 'qux'
                };
                expect(AT._getTokenOrAlias(data)).to.be(null);
            });

            it('should return the sharepoint alias if it is present', function () {
                var data = {
                    alias: 'foo'
                };
                expect(AT._getTokenOrAlias(data)).to.be(data.alias);
            });

            it('should preferentially return the alias if both alias and token are present', function () {
                var data = {
                    alias: 'foo',
                    token: 'bar'
                };
                expect(AT._getTokenOrAlias(data)).to.be(data.alias);
            });

            it('should return the sharepoint token if no alias is available', function () {
                var data = {
                    token: 'foo'
                };
                expect(AT._getTokenOrAlias(data)).to.be(data.token);
            });

        });

        describe('_initEventListeners()', function () {

            it('should return an object of listener arrays', function () {
                var res = AT._initEventListeners();

                expect(res.SharepointSaved).to.be.an('array');
                expect(res.TouchpointSaved).to.be.an('array');
                expect(res.ReferredPerson).to.be.an('array');
            });

        });

        describe('_initStorage()', function () {

            it('should return a store object with the correct interface', function () {
                var res = AT._initStorage();

                expect(res).to.be.an('object');
                expect(res.getItem).to.be.a('function');
                expect(res.setItem).to.be.a('function');
                expect(res.hasItem).to.be.a('function');
                expect(res.removeItem).to.be.a('function');
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

                var res = AT._prepareData(data);

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

            it('should not double-nest data when run twice', function () {
                var data = {
                    _at: {
                        sharepointName: 'foo',
                        email: 'john@smith.com',
                        userId: 3
                    },
                    user: {
                        id: 3,
                        name: 'John Smith',
                        email: 'john@smith.com'
                    }
                };

                var first = AT._prepareData(data);
                var second = AT._prepareData(first);

                expect(first).to.eql(second);
            });


        });

        describe('_storeTouchpointData()', function () {
            var storage;

            beforeEach(function () {
                storage = {};

                var fakeStore = {
                    hasItem: function (key) {
                        return storage.hasOwnProperty(key);
                    },
                    getItem: function (key) {
                        return storage[key];
                    },
                    setItem: function (key, value) {
                        storage[key] = value;
                    }
                };

                _initStorageStub = sinon.sandbox.stub(window.AT, '_initStorage');
                _initStorageStub.returns(fakeStore);

                sendStub = sinon.sandbox.stub(window.AT, 'send');
                sendStub.returns(null);

                AT._init(); // add fakeStore as local store.
            });

            afterEach(function () {
                storage = {};
            });

            it('should return null immediately if the data provided is null', function () {
                var res = AT._storeTouchpointData(null);
                expect(res).to.be(null);
            });

            it('should return null immediately if the data provided is not an object', function () {
                expect(AT._storeTouchpointData('string')).to.be(null);
                expect(AT._storeTouchpointData([])).to.be(null);
                expect(AT._storeTouchpointData(123)).to.be(null);
            });

            xit('should initialise an empty object in our namespace if it is empty', function () {
                // Can't really test this?
            });

            xit('should not re-initialise an empty object in our namespace if it is not empty', function () {
                var data = { // TODO: is this definition representative?
                    token: 'foo',
                    metadata: 'bar'
                };

                AT._storeTouchpointData(data);
                console.log('::' + storage);
            });

            xit('should not overwrite data that already exists with the same key', function () {

            });

            xit('should add the given data to the array under the right api key', function () {

            });

            xit('should add the given data to the array under the right api key when data already exists', function () {

            });

            it('should not store a token again if it already exists in storage', function () {

            });

        });

        describe('_triggerEvent()', function () {

            beforeEach(function () {
                _getApiKeyStub = sinon.sandbox.stub(window.AT, '_getApiKey');
                _getApiKeyStub.returns(apiKey);

                _autoSendStub = sinon.sandbox.stub(window.AT, '_autoSend');
                _autoSendStub.returns(null);
                AT._init();
            });

            it('should call an event listener for the named event type', function () {
                var spy = sinon.sandbox.spy();
                AT.addEventListener(AT.Events.SharepointSaved, spy);

                AT._triggerEvent(AT.Events.SharepointSaved, {});

                expect(spy.calledOnce).to.be(true);
            });

            it('should call all the event listeners for the named event type', function () {
                var spy1 = sinon.sandbox.spy();
                var spy2 = sinon.sandbox.spy();
                AT.addEventListener(AT.Events.SharepointSaved, spy1);
                AT.addEventListener(AT.Events.SharepointSaved, spy2);

                AT._triggerEvent(AT.Events.SharepointSaved, {});

                expect(spy1.calledOnce).to.be(true);
                expect(spy2.calledOnce).to.be(true);
            });

        });

        describe('_autoSend()', function () {

            beforeEach(function () {
                sendStub = sinon.sandbox.stub(window.AT, 'send');
                sendStub.returns(null);
            });

            it('should call the send function', function () {
                AT._autoSend();

                expect(sendStub.calledOnce).to.be(true);
            });

            it('should call the send function with anything set in window.advocate_things_data when it is not defined', function () {
                AT._autoSend();

                // Args: data, isInit, callback
                var expected = [undefined, true, undefined];
                expect(sendStub.args[0]).to.eql(expected); // data
            });

            it('should call the send function with anything set in window.advocate_things_data', function () {
                window.advocate_things_data = {
                    foo: 'bar'
                };
                AT._autoSend();

                // Args: data, isInit, callback
                var expected = [window.advocate_things_data, true, undefined];
                expect(sendStub.args[0]).to.eql(expected); // data

                window.advocate_things_data = undefined; // reset
            });

            it('should call the send function with a callback if one is provided', function () {
                var spy = sinon.sandbox.spy();
                AT._autoSend(spy);

                var expected = [undefined, true, spy];
                expect(sendStub.args[0]).to.eql(expected);
            });

        });

        describe('_init()', function () {
            beforeEach(function () {
                _getApiKeyStub = sinon.sandbox.stub(window.AT, '_getApiKey');
                _getApiKeyStub.returns(apiKey);

                _autoSendStub = sinon.sandbox.stub(window.AT, '_autoSend');
                _autoSendStub.returns(null);

                _initEventListenersStub = sinon.sandbox.stub(window.AT, '_initEventListeners');
                _initEventListenersStub.returns({});

                _initStorageStub = sinon.sandbox.stub(window.AT, '_initStorage');
                _initStorageStub.returns(null);
            });

            it('should immediately return null if no API key is present', function () {
                // Arrange
                _getApiKeyStub.returns(null);

                // Assert
                expect(AT._init()).to.be(null);
            });

            it('should initialise event listeners', function () {
                AT._init();

                expect(_initEventListenersStub.calledOnce).to.be(true);
            });

            it('should initialiase storage', function () {
                AT._init();

                expect(_initStorageStub.calledOnce).to.be(true);
            });

            it('should autosend', function () {
                AT._init();

                expect(_autoSendStub.calledOnce).to.be(true);
            });
        });

    });


    describe('external functions', function () {

        describe('addEventListener()', function () {

            beforeEach(function () {
                _getApiKeyStub = sinon.sandbox.stub(window.AT, '_getApiKey');
                _getApiKeyStub.returns(apiKey);
            });

            it('should return immediately if there is no api key', function () {
                // Arrange
                _getApiKeyStub.returns(null);

                // Assert
                expect(AT.addEventListener()).to.be(null);
            });

            it('should return immediately if the event listener object has not been initialised or invalid type given', function () {
                expect(AT.addEventListener('foo', null)).to.be(null);
            });

            it('should add an event listener to the correct type', function () {
                var spy = sinon.sandbox.spy();

                _autoSendStub = sinon.sandbox.stub(window.AT, '_autoSend');
                _autoSendStub.returns(null);
                AT._init(); // initialises listeners
                AT.addEventListener(AT.Events.SharepointSaved, spy);

                AT._triggerEvent(AT.Events.SharepointSaved);

                expect(spy.calledOnce).to.be(true);
            });

        });

        describe('send()', function () {

            beforeEach(function () {
                _getApiKeyStub = sinon.sandbox.stub(window.AT, '_getApiKey');
                _getApiKeyStub.returns(apiKey);

                sendSharepointStub = sinon.sandbox.stub(window.AT, 'sendSharepoint');
                sendTouchpointStub = sinon.sandbox.stub(window.AT, 'sendTouchpoint');

                sendTouchpointStub.yieldsAsync(null);
                sendSharepointStub.yieldsAsync(null);
            });

            it('should return null immediately if there is no api key', function () {
                _getApiKeyStub.returns(null);

                AT.send();
            });

            it('should send a sharepoint and a touchpoint if data._at.sharepointName exists', function (done) {
                var data = {
                    _at: {
                        sharepointName: 'foo'
                    }
                };

                AT.send(data, function (err, res) {
                    expect(sendSharepointStub.calledOnce).to.be(true);
                    expect(sendTouchpointStub.calledOnce).to.be(true);
                    done();
                });
            });

            it('should send a touchpoint and a sharepoint if data._at.touchpointName exists', function (done) {
                var data = {
                    _at: {
                        touchpointName: 'foo'
                    }
                };

                AT.send(data, function () {
                    expect(sendSharepointStub.calledOnce).to.be(true);
                    expect(sendTouchpointStub.calledOnce).to.be(true);
                    done();
                });
            });

            it('should send both a sharepoint and a touchpoint if no names exist', function (done) {
                var data = {
                    _at: {}
                };

                AT.send(data, function (err, res) {
                    expect(sendSharepointStub.calledOnce).to.be(true);
                    expect(sendTouchpointStub.calledOnce).to.be(true);
                    done();
                });
            });

            it('should send both a sharepoint and a touchpoint if no _at object exists', function (done) {
                var data = {};

                AT.send(data, function () {
                    expect(sendSharepointStub.calledOnce).to.be(true);
                    expect(sendTouchpointStub.calledOnce).to.be(true);
                    done();
                });
            });

            it('should send both a sharepoint and a touchpoint if both sharepoint and touchpoint names exist', function (done) {
                var data = {
                    _at: {
                        sharepointName: 'foo',
                        touchpointName: 'bar'
                    }
                };

                AT.send(data, function () {
                    expect(sendSharepointStub.calledOnce).to.be(true);
                    expect(sendTouchpointStub.calledOnce).to.be(true);
                    done();
                });
            });

            it('should call sendSharepoint with callback as the last arg if isInit is not set', function (done) {
                var spy = sinon.sandbox.spy();
                var data = {};

                sendTouchpointStub.yields(spy); // too callback in sendSharepoint

                AT.send(data, spy);

                expect(sendSharepointStub.args[0]).to.eql([null, data, false, spy]);

                done();
            });

            it('should call sendSharepoint with callback as the last arg if isInit is set', function (done) {
                var spy = sinon.sandbox.spy();
                var data = {};

                sendTouchpointStub.yields(spy); // too callback in sendSharepoint

                AT.send(data, true, spy);

                expect(sendSharepointStub.args[0]).to.eql([null, data, true, spy]);

                done();
            });

            it('should call sendSharepoint with callback as the last arg if isInit is explicitly set to false', function (done) {
                var spy = sinon.sandbox.spy();
                var data = {};

                sendTouchpointStub.yields(spy); // too callback in sendSharepoint

                AT.send(data, false, spy);

                expect(sendSharepointStub.args[0]).to.eql([null, data, false, spy]);

                done();
            });

        });

        describe('sendSharepoint()', function () {

            beforeEach(function () {
                _getApiKeyStub = sinon.sandbox.stub(window.AT, '_getApiKey');
                _getApiKeyStub.returns(apiKey);

                _prepareDataStub = sinon.sandbox.stub(window.AT, '_prepareData');
                _prepareDataStub.returns({
                    _at: {},
                    _client: {}
                });

                _appendTokenToUrlSpy = sinon.sandbox.spy(window.AT, '_appendTokenToUrl');

                this.xhr = sinon.useFakeXMLHttpRequest();

                this.server = sinon.fakeServer.create();
                this.server.respondImmediately = true;
                this.server.autoRespond = true;

                _autoSendStub = sinon.sandbox.stub(window.AT, '_autoSend');
                _autoSendStub.returns(null);
                AT._init();
            });

            afterEach(function () {
                this.xhr.restore();
                this.server.restore();
            });

            it('should return immediately if there is no api key', function () {
                // Arrange
                _getApiKeyStub.returns(null);

                // Assert
                expect(AT.sendSharepoint()).to.be(null);
            });

            it('should prepare any passed data for sending to a collector', function () {
                // Note that this test appears to require this.xhr = sinon... in the beforeEach to run.
                var code = 200;
                var headers = { "Content-Type": "application/json" };
                var data = '[{"foo":"bar", "token":"foo"}]'; // token ensures we don't get recursion
                var response = [
                    code,
                    headers,
                    data
                ];

                this.server.respondWith('POST', spcUrl, response);
                AT.sendSharepoint('foo', {});

                expect(_prepareDataStub.calledOnce).to.be(true);
            });

            it('should set _at.sharepointName to the specified value (if given)', function () {
                var requests = [];
                this.xhr.onCreate = function (req) { requests.push(req); };

                var sharepointName = 'foo';
                _prepareDataStub.returns({
                    _at: {}
                });

                AT.sendSharepoint(sharepointName, {});

                var body = JSON.parse(requests[0].requestBody);
                expect(body._at.sharepointName).to.equal(sharepointName);
            });

            it('should set the correct headers, method and payload for the XHR', function () {
                var requests = [];
                this.xhr.onCreate = function (req) { requests.push(req); };

                var method = 'POST';
                var headers = {
                    'Content-Type': 'application/json;charset=utf-8'
                };
                var sharepointName = 'foo';

                AT.sendSharepoint(sharepointName, {});

                expect(requests[0].url).to.equal(spcUrl);
                expect(requests[0].method).to.equal(method);
                expect(requests[0].requestHeaders).to.eql(headers);
            });

            // FIXME: callback does not actually run on IE.
            (!skipie7) && it('should callback with an error if an error response is received', function () {
                // Arrange
                var code = 400;
                var headers = '{"Content-Type":"text/plain; charset=utf-8"}';
                var data = 'something went wrong :(';
                var response = [
                    code,
                    headers,
                    data
                ];
                this.server.respondWith('POST', spcUrl, response);

                // Act
                AT.sendSharepoint('foo', {}, function (err, res) {
                    // Assert
                    expect(res).to.be(undefined);
                    expect(err).to.not.be(null);
                });
            });

            (!skipie7) && it('should return immediately if an error response is received and no callback is provided', function () {
                // Arrange
                var code = 400;
                var headers = '{"Content-Type":"text/plain; charset=utf-8"}';
                var data = 'something went wrong :(';
                var response = [
                    code,
                    headers,
                    data
                ];
                this.server.respondWith('POST', spcUrl, response);
                _getTokenOrAliasStub = sinon.sandbox.spy(window.AT, '_getTokenOrAlias');

                // Act
                AT.sendSharepoint('foo', {});

                expect(_getTokenOrAliasStub.called).to.be(false);
            });

            xit('should callback with an error if invalid data is returned', function () {
                // E.g. JSON.parse(xhr.responseText) fails.
            });

            (!skipie7) && it('should callback with no error and an array of data objects', function () {
                // Arrange
                var code = 200;
                var headers = '{"Content-Type":"application/json; charset=utf-8"}';
                // This test fails if token=foo due to it being set to the same in
                // test "prepare any passed data for sending to a collector".
                var data = JSON.stringify([{"token":"bar"},{"baz":"qux"}]);
                var response = [
                    code,
                    headers,
                    data
                ];
                this.server.respondWith('POST', spcUrl, response);
                var spy = sinon.sandbox.spy();

                // Act
                AT.sendSharepoint('foo', {}, spy);

                expect(spy.calledOnce).to.be(true);
                expect(spy.args[0][0]).to.be(null); //err
                expect(spy.args[0][1]).to.eql(JSON.parse(data));
            });

            (!skipie7) && it('should trigger a SharepointSaved event when the sharepoint has successfully saved', function () {
                _triggerEventStub = sinon.sandbox.stub(window.AT, '_triggerEvent');

                var code = 200;
                var headers = '{"Content-Type":"application/json; charset=utf-8"}';
                var data = JSON.stringify([{"foo":"bar"},{"baz":"qux"}]);
                var response = [
                    code,
                    headers,
                    data
                ];
                this.server.respondWith('POST', spcUrl, response);
                AT.sendSharepoint('foo', {});

                expect(_triggerEventStub.calledOnce).to.be(true);
            });

            (!skipie7) && it('should set the global shareToken variable to the received share token when no alias is present', function () {
                var shareToken = 'foobarbaz';
                var code = 200;
                var headers = '{"Content-Type":"application/json; charset=utf-8"}';
                var data = JSON.stringify([{"token":shareToken},{"token":"qux"}]);
                var response = [
                    code,
                    headers,
                    data
                ];
                this.server.respondWith('POST', spcUrl, response);

                AT.sendSharepoint('foo', {});

                expect(AT.shareToken).to.equal(shareToken);
            });

            (!skipie7) && it('should set the global shareToken variable to the received share alias when one is present', function () {
                var shareToken = 'foobarbaz';
                var shareAlias = 'fancyalias';
                var code = 200;
                var headers = '{"Content-Type":"application/json; charset=utf-8"}';
                var data = JSON.stringify([{"token":shareToken, "alias": shareAlias},{"token":"qux"}]);
                var response = [
                    code,
                    headers,
                    data
                ];
                this.server.respondWith('POST', spcUrl, response);

                AT.sendSharepoint('foo', {});

                expect(AT.shareToken).to.equal(shareAlias);
            });

            (!skipie7) && it('should set the global queryParamName variable to the received queryParamName', function () {
                var queryParamName = 'qpm';
                var code = 200;
                var headers = '{"Content-Type":"application/json; charset=utf-8"}';
                var data = JSON.stringify([{"queryParamName":queryParamName},{"token":"qux"}]);
                var response = [
                    code,
                    headers,
                    data
                ];
                this.server.respondWith('POST', spcUrl, response);

                AT.sendSharepoint('foo', {});

                expect(AT.queryParamName).to.equal(queryParamName);
            });

            (!skipie7) && it('should append the received token to the url if the new token is different to the old one', function () {
                var queryParamName = 'qpm';
                var token = 'foo';
                var code = 200;
                var headers = '{"Content-Type":"application/json; charset=utf-8"}';
                var data = JSON.stringify([{"queryParamName":queryParamName,"token":token}]);
                var response = [
                    code,
                    headers,
                    data
                ];
                this.server.respondWith('POST', spcUrl, response);
                AT.shareToken = 'notfoo';

                AT.sendSharepoint('foo', {});

                expect(_appendTokenToUrlSpy.calledOnce).to.be(true);
                expect(_appendTokenToUrlSpy.args[0][0]).to.equal(token);
                expect(_appendTokenToUrlSpy.args[0][1]).to.equal(queryParamName);
            });

            // Recursive function call in this scenario.
            (!skipie7) && xit('should not append the received token to the url if the new token is the same as the old one', function () {
                var queryParamName = 'qpm';
                var token = 'foo';
                var code = 200;
                var headers = '{"Content-Type":"application/json; charset=utf-8"}';
                var data = JSON.stringify([{"queryParamName":queryParamName,"token":token}]);
                var response = [
                    code,
                    headers,
                    data
                ];
                this.server.respondWith('POST', spcUrl, response);
                AT.shareToken = token;

                AT.sendSharepoint('foo', {});

                expect(_appendTokenToUrlSpy.called).to.be(false);
            });

            (!skipie7) && it('should append the received token regardless of if it is different to the old one if called as init', function () {
                var queryParamName = 'qpm';
                var token = 'foo';
                var code = 200;
                var headers = '{"Content-Type":"application/json; charset=utf-8"}';
                var data = JSON.stringify([{"queryParamName":queryParamName,"token":token}]);
                var response = [
                    code,
                    headers,
                    data
                ];
                this.server.respondWith('POST', spcUrl, response);
                AT.shareToken = token;

                AT.sendSharepoint('foo', {}, null, true);

                expect(_appendTokenToUrlSpy.calledOnce).to.be(true);
                expect(_appendTokenToUrlSpy.args[0][0]).to.equal(token);
                expect(_appendTokenToUrlSpy.args[0][1]).to.equal(queryParamName);
            });

        });

        describe('sendTouchpoint()', function () {

            beforeEach(function () {
                _getApiKeyStub = sinon.sandbox.stub(window.AT, '_getApiKey');
                _getApiKeyStub.returns(apiKey);

                _storeTouchpointDataStub = sinon.sandbox.stub(window.AT, '_storeTouchpointData');
                _storeTouchpointDataStub.returns(null);

                _triggerEventStub = sinon.sandbox.stub(window.AT, '_triggerEvent');
                _triggerEventStub.returns(null);

                this.xhr = sinon.useFakeXMLHttpRequest();

                this.server = sinon.fakeServer.create();
                this.server.respondImmediately = true;
                this.server.autoRespond = true;
            });

            afterEach(function () {
                this.xhr.restore();
                this.server.restore();
            });

            it('should return immediately if there is no api key', function () {
                // Arrange
                _getApiKeyStub.returns(null);

                // Assert
                expect(AT.sendTouchpoint()).to.be(null);
            });

            it('should prepare any passed data for sending to a collector', function () {
                var minResp = {
                    _at: {}
                };
                _prepareDataStub = sinon.sandbox.stub(window.AT, '_prepareData');
                _prepareDataStub.returns({_at: {}});
                AT.sendTouchpoint('foo', {});

                expect(_prepareDataStub.calledOnce).to.be(true);
            });

            it('should set _at.touchpointName to the specified value (if given)', function () {
                var requests = [];
                this.xhr.onCreate = function (req) { requests.push(req); };

                var touchpointName = 'foo';
                AT.sendTouchpoint(touchpointName, {});

                var body = JSON.parse(requests[0].requestBody);
                expect(body._at.touchpointName).to.equal(touchpointName);
            });

            it('should set the correct headers, method and payload for the XHR', function () {
                var requests = [];
                this.xhr.onCreate = function (req) { requests.push(req); };

                var method = 'POST';
                var headers = {
                    'Content-Type': 'application/json;charset=utf-8'
                };
                var touchpointName = 'foo';

                AT.sendTouchpoint(touchpointName, {});

                expect(requests[0].url).to.equal(tpcUrl);
                expect(requests[0].method).to.equal(method);
                expect(requests[0].requestHeaders).to.eql(headers);
            });

            // FIXME: callback does not actually run on IE.
            (!skipie7) && xit('should callback with an error if an error response is received', function (done) {
                // Arrange
                var code = 400;
                var headers = '{"Content-Type":"text/plain; charset=utf-8"}';
                var data = 'something went wrong :(';
                var body = JSON.stringify({"foo":"bar"});
                var response = [
                    code,
                    headers,
                    data,
                    body
                ];
                this.server.respondWith('POST', tpcUrl, response);
                // Act
                AT.sendTouchpoint('foo', {}, function (err, res) {
                    // Assert
                    expect(res).to.be(undefined);
                    expect(err).to.not.be(null);
                    expect(err).to.be.an('error');

                    // Getting: SyntaxError: Fake server request processing threw exception:
                    // Unable to parse JSON string
                    // (http://localhost:9876/base/dist/sdk.js?3ef9e13c95fdb05fa7f15fd55807d3a9434f22d6:1091)
                    // Should be (and is...) returning before then.

                    done();
                });
            });

            (!skipie7) && it('should return immediately if an error response is received and no callback is provided', function () {
                // Arrange
                var code = 400;
                var headers = '{"Content-Type":"text/plain; charset=utf-8"}';
                var data = 'something went wrong :(';
                var response = [
                    code,
                    headers,
                    data
                ];
                this.server.respondWith('POST', tpcUrl, response);
                //_storeTouchpointDataStub = sinon.sandbox.spy(window.AT, '_storeTouchpointData');

                // Act
                AT.sendTouchpoint('foo', {});

                expect(_storeTouchpointDataStub.called).to.be(false);
            });

            xit('should callback with an error if invalid data is returned', function () {
                // E.g. JSON.parse(xhr.responseText) fails.
            });

            (!skipie7) && xit('should callback with no error and an object', function (done) {
                // Arrange
                var code = 200;
                var headers = '{"Content-Type":"application/json; charset=utf-8"}';
                var data = JSON.stringify({"token":"foo"},{"baz":"qux"});
                var response = [
                    code,
                    headers,
                    data
                ];
                this.server.respondWith('POST', tpcUrl, response);
                var spy = sinon.sandbox.spy();

                // Act
                AT.sendTouchpoint('foo', {}, spy);

                // Failing as above
                expect(spy.calledOnce).to.be(true);
                expect(spy.args[0][0]).to.be(null); //err
                expect(spy.args[0][1]).to.eql(JSON.parse(data));
            });

            // More tests here (see sendSharepoint tests).
            // Major issue with the above failing tests is that xhr.responseText is not being populated
            // and thus JSON.parse(undefined) or JSON.parse("") is failing.

        });

    });

});
