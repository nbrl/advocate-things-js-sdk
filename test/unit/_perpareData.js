var expect = require('expect.js');
var sinon = require('sinon');
var _ = require('lodash');

var apiKey = 'foo';

describe('_prepareData()', function () {

    beforeEach(function () {
	sinon.sandbox.create();

        this.xhr = sinon.useFakeXMLHttpRequest();
        var requests = this.requests = [];
        this.xhr.onCreate = function (xhr) {
            requests.push(xhr);
        };

        AT.init({
            apiKey: apiKey,
            autoSend: false
        });
    });

    afterEach(function () {
        sinon.sandbox.restore();

        this.xhr.restore();
    });

    function checkBasicProps (data, hasMeta) {
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

    it('should have a _prepareData function', function () {
        expect(AT._prepareData).to.be.a('function');
    });

    it('should return a minimally initialised object if called with non-[object Object]', function () {
        var args = [ null, undefined, 'string', [ 'array' ]];

        for (var i=0; i<args.length; i++) {
            checkBasicProps(AT._prepareData(args[i]));
        }
    });

    it('should return a minimally initialised object if called with an empty object', function () {
        checkBasicProps(AT._prepareData({}));
    });

    it('should return a minimally initialised object if the provided data has no _at but has meta', function () {
        var data = {
            foo: {
                bar: 'baz'
            }
        };

        var res = AT._prepareData(data);
        checkBasicProps(res, true);
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
        checkBasicProps(res, true);
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
        checkBasicProps(res);

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
        checkBasicProps(res, true);

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
        checkBasicProps(res, true);

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
        checkBasicProps(res, true);

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
        checkBasicProps(res, true);

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
