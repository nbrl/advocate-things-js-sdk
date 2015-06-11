var expect = require('expect.js');
var sinon = require('sinon');

var createTokenStub;
var registerTouchStub;

var historyReplaceStateStub;
var regexpSpy;

describe('_appendTokenToUrl()', function () {

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

    it('should have an _appendTokenToUrl function', function () {
	expect(AT._appendTokenToUrl).to.be.a('function');
    });

    it('should return immediately if an array is not passed', function () {
        regexpSpy = sinon.sandbox.spy(window, 'RegExp');
        AT._appendTokenToUrl(null);

        expect(regexpSpy.called).to.be(false);
    });

    it('should return immediately if an array is passed which does not contain a suitable token (abs=true)', function () {
        regexpSpy = sinon.sandbox.spy(window, 'RegExp');
        var tokens = [
            { nonsense: 'things' },                  // nonsense
            { token: 'foo', queryParamName: 'foo' }, // abs undefined
            { token: 'bar', abs: true }              // no queryParamName
        ];
        AT._appendTokenToUrl(tokens);

        expect(regexpSpy.called).to.be(false);
    });

    it('should append the token to the URL if a good token is provided', function () {
        historyReplaceStateStub = sinon.sandbox.stub(window.History, 'replaceState');
        var tokens = [
            { token: 'foo', queryParamName: 'bar', abs: true }
        ];
        AT._appendTokenToUrl(tokens);

        var title = historyReplaceStateStub.args[0][1];
        var params = historyReplaceStateStub.args[0][2];

        expect(historyReplaceStateStub.calledOnce).to.be(true);
        expect(title).to.be(null);
        expect(params).to.be('?bar=foo');
    });

    it('should append the token to the URL if a good token is provided when it is not the only token', function () {
	historyReplaceStateStub = sinon.sandbox.stub(window.History, 'replaceState');
        var tokens = [
            { token: '123', queryParamName: '456' },
            { token: 'foo', queryParamName: 'bar', abs: true },
            { token: 'abc', queryParamName: 'def' }
        ];
        AT._appendTokenToUrl(tokens);

        var title = historyReplaceStateStub.args[0][1];
        var params = historyReplaceStateStub.args[0][2];

        expect(historyReplaceStateStub.calledOnce).to.be(true);
        expect(title).to.be(null);
        expect(params).to.be('?bar=foo');
    });

    it('should append the first token to the URL if two good tokens are provided', function () {
	historyReplaceStateStub = sinon.sandbox.stub(window.History, 'replaceState');
        var tokens = [
            { token: 'foo', queryParamName: 'bar', abs: true },
            { token: 'abc', queryParamName: 'def', abs: true }
        ];
        AT._appendTokenToUrl(tokens);

        var title = historyReplaceStateStub.args[0][1];
        var params = historyReplaceStateStub.args[0][2];

        expect(historyReplaceStateStub.calledOnce).to.be(true);
        expect(title).to.be(null);
        expect(params).to.be('?bar=foo');
    });
});
