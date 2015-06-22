var expect = require('expect.js');
var sinon = require('sinon');

describe('registerTouch()', function () {

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

    it('should have a registerTouch function', function () {
        expect(AT.registerTouch).to.be.a('function');
    });

    it('should correctly identify arguments (str, obj, fun)', function () {
        // Arrange
        var str = 'str123';
        var obj = { obj: 'obj' };
        var fun = sinon.sandbox.spy();
        _prepareDataSpy = sinon.sandbox.spy(window.AT, '_prepareData');

        // Act
        AT.registerTouch(str, obj, fun);
        this.requests[0].respond(400); // quickest route to finish

        // Assert
        expect(fun.calledOnce).to.be(true); // If this wasn't the case, typeof spy != function and would fail
        expect(_prepareDataSpy.args[0][0]).to.eql(obj);
        expect(JSON.parse(this.requests[0].requestBody)._at.touchpointName).to.equal(str);
    });

    it('should correctly identify arguments (obj, fun)', function () {
        // Arrange
        var obj = { obj: 'obj' };
        var fun = sinon.sandbox.spy();
        _prepareDataSpy = sinon.sandbox.spy(window.AT, '_prepareData');
        var token = 'abc123';
        _getShareTokensStub = sinon.sandbox.stub(window.AT, '_getShareTokens');
        _getShareTokensStub.returns([token]);

        // Act
        AT.registerTouch(obj, fun);
        this.requests[0].respond(400); // quickest route to finish

        // Assert
        expect(fun.calledOnce).to.be(true); // If this wasn't the case, typeof spy != function and would fail
        expect(_prepareDataSpy.args[0][0]).to.eql(obj);
        // No URL to check for tp name as it is worked out by the DB.
    });

    it('should correctly identify arguments (fun)', function () {
        // Arrange
        var fun = sinon.sandbox.spy();
        var origWindowAdvocateThingsData = window.advocate_things_data;
        window.advocate_things_data = { foo: 'bar' };
        _prepareDataSpy = sinon.sandbox.spy(window.AT, '_prepareData');
        var token = 'abc123';
        _getShareTokensStub = sinon.sandbox.stub(window.AT, '_getShareTokens');
        _getShareTokensStub.returns([token]);

        // Act
        AT.registerTouch(fun);
        this.requests[0].respond(400); // quickest route to finish

        // Assert
        expect(fun.calledOnce).to.be(true); // If this wasn't the case, typeof spy != function and would fail
        expect(_prepareDataSpy.args[0][0]).to.eql(window.advocate_things_data); // fallback data

        window.advocate_things_data = origWindowAdvocateThingsData;
    });

    it('should correctly identify arguments (str, fun)', function () {
        // Arrange
        var str = 'str123';
        var fun = sinon.sandbox.spy();
        var origWindowAdvocateThingsData = window.advocate_things_data;
        window.advocate_things_data = { foo: 'bar' };
        _prepareDataSpy = sinon.sandbox.spy(window.AT, '_prepareData');
        var token = 'abc123';
        _getShareTokensStub = sinon.sandbox.stub(window.AT, '_getShareTokens');
        _getShareTokensStub.returns([token]);

        // Act
        AT.registerTouch(str, fun);
        this.requests[0].respond(400); // quickest route to finish

        // Assert
        expect(fun.calledOnce).to.be(true); // If this wasn't the case, typeof spy != function and would fail
        expect(_prepareDataSpy.args[0][0]).to.eql(window.advocate_things_data); // fallback data
        expect(JSON.parse(this.requests[0].requestBody)._at.touchpointName).to.equal(str);

        window.advocate_things_data = origWindowAdvocateThingsData;
    });

    xit('should return an error if the XHR fails - with cb', function () {

    });

    xit('should return if the XHR fails - no cb', function () {

    });

    it('should use the specified data when it is provided', function () {
        // Arrange
        var origWindowAdvocateThingsData = window.advocate_thing_data;
        var _prepareDataSpy = sinon.sandbox.spy(window.AT, '_prepareData');
        window.advocate_things_data = {
            _at: {
                name: 'foo',
                userId: 'id3'
            }
        };
        var data = { some: 'data' };

        // Act
        AT.registerTouch('foo', data);

        // Assert
        expect(_prepareDataSpy.args[0][0]).to.eql(data);

        window.advocate_things_data = origWindowAdvocateThingsData;
    });

    it('should fallback to using window.advocate_things_data when no data is provided', function () {
        // Arrange
        var origWindowAdvocateThingsData = window.advocate_thing_data;
        var _prepareDataSpy = sinon.sandbox.spy(window.AT, '_prepareData');
        window.advocate_things_data = {
            _at: {
                name: 'foo',
                userId: 'id3'
            }
        };

        // Act
        AT.registerTouch('foo', null);

        // Assert
        expect(_prepareDataSpy.args[0][0]).to.eql(window.advocate_things_data);

        window.advocate_things_data = origWindowAdvocateThingsData;
    });
});
