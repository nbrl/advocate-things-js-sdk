;(function(context) {

    // Variables
    var AT = {};
    var listeners = {};
    AT.shareToken = null;
    AT.queryParamName = null;

    // Constants
    var scriptId = 'advocate-things-script';
    var storageName = 'advocate-things';
    var points = {
        Sharepoint: {
            name: 'Sharepoint',
            url: 'https://sharepoint-data-collector.herokuapp.com/sharepoint/data'
        },
        Touchpoint: {
            name: 'Touchpoint',
            url: 'https://touchpoint-data-collector.herokuapp.com/touchpoint/data'
        },
        Unknown: {
            name: 'Unknown'
        }
    };

    AT.Events = {
        SharepointSaved: 'SharepointSaved',
        TouchpointSaved: 'TouchpointSaved',
        ReferredPerson: 'ReferredPerson'
    };


    /**
     * Injection of polyfils and third-party libraries
     */

    var utils = {};
    (function () {
        /* inject */
        /* endinject */
    }).call(utils);


    /**
     * Internal function definitions
     */

    AT._appendTokenToUrl = function (token, qpName) {
        if (!token || !qpName) {
            return null;
        }

        var url = window.location.href;

        var qpRe = new RegExp('([?&]' + qpName + '=)([^&#]*)', 'g');

        var hash = '';
        var split = '';

        if (url.indexOf('#') !== -1) {
            split = url.split('#');
            hash = split[1];
            url = split[0];
        }

        var params = '';
        if (url.indexOf('?') !== -1) {
            split = url.split('?');
            params = '?' + split[1];
            if (params[params.length - 1] === '/') {
                params = params.slice(0, -1);
            }
        }

        if (params.match(qpRe)) {
            // Replace
            params = params.replace(qpRe, '$1' + token);
        } else {
            // Append
            var separator = '?';
            if (params) {
                separator = '&';
            }
            params += separator + qpName + '=' + token;
        }

        // We can rebuild it, we have the technology
        var newParams = (hash)
            ? params + '#' + hash
            : params;

        // Rewrite the URL
        History.replaceState(null, null, newParams);
    };

    AT._getApiKey = function () {
        var elScript = document.getElementById(scriptId);

        if (!elScript) {
            return null;
        }

        var scriptUrl = elScript.src;
        if (scriptUrl.indexOf('?key') !== -1) {
            return scriptUrl.split('?').pop().split('=').pop();
        }

        return null;
    };

    AT._getTokenOrAlias = function (sharepointData) {
        if (!sharepointData) {
            return null;
        }

        return sharepointData.alias || sharepointData.token || null;
    };

    AT._initEventListeners = function () {
        var listeners = {};

        for (evt in AT.Events) {
            listeners[AT.Events[evt]] = [];
        }

        return listeners;
    };

    AT._prepareData = function (data) {
        var requiredProps = [ '_at', '_client' ];
        var tidy; // Will contain tidied data.

        // Ensure data is a real object. Initialise if not.
        if (!data || Object.prototype.toString.call(data) !== '[object Object]') {
            tidy = {};
        } else {
            tidy = JSON.parse(JSON.stringify(data || {})); // clone data
        }

        for (propId in requiredProps) {
            if (!tidy[requiredProps[propId]] || Object.prototype.toString.call(tidy[requiredProps[propId]]) !== '[object Object]') {
                tidy[requiredProps[propId]] = {};
            }
        }

        tidy._at.apiKey = AT._getApiKey();
        tidy._at.fingerprint = 'foo';
        tidy._at.url = window.location.href;

        for (key in tidy) {
            if (!(key === '_at' || key === '_client')) { // TODO: change to use requiredProps?
                tidy._client[key] = tidy[key];
                delete tidy[key];
            }
        }

        return tidy;
    };

    AT._triggerEvent = function (eventType, data) {
        for (var l=0; l<listeners[eventType].length; l++) {
            listeners[eventType][l].call(data, data);
        }
    };

    AT._init = function (cb) {
        listeners = AT._initEventListeners();

        if (cb) {
            cb(null);
        }
    };
    AT._init(); // Run immediately


    /**
     * Public function definitions
     */

    AT.addEventListener = function (type, listener) {
        if (!AT._getApiKey()) {
            return null;
        }

        if (!listeners[type]) {
            return null;
        }

        listeners[type].push(listener);
    };

    AT.sendSharepoint = function (name, data, cb, isInit) {
        if (!AT._getApiKey()) {
            return null;
        }

        var dataPrep = AT._prepareData(data);

        if (name) {
            dataPrep._at.sharepointName = name;
        }

        var dataString = JSON.stringify(dataPrep);

        var xhr = new XMLHttpRequest();
        var isAsync = true;

        xhr.onload = function () {
            // Handle error responses.
            if (!/^20[0-9]{1}/.test(xhr.status)) {
                if (cb) {
                    return cb(new Error(xhr.statusText));
                }
            }

            // Handle good responses.
            var res = JSON.parse(xhr.responseText); // TODO: try/catch here

            // Make details available in AT
            var oldShareToken = AT.shareToken;
            AT.shareToken = AT._getTokenOrAlias(res[0]);
            AT.queryParamName = res[0].queryParamName;

            // Trigger saved event
            AT._triggerEvent(AT.Events.SharepointSaved, res);

            if ((oldShareToken !== AT.shareToken) || isInit) {
                AT._appendTokenToUrl(AT.shareToken, AT.queryParamName);
            } else {
                sendSharepoint(name, data, cb, true);
            }
            if (cb) {
                return cb(null, res);
            }
        };

        xhr.open('POST', points.Sharepoint.url, isAsync);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
        xhr.send(dataString);
    };


    context.AT = AT;

})(this);
