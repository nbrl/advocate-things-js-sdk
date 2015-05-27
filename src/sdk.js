;(function(context) {

    // Variables
    var AT = {};
    var listeners = {};

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

    AT.sendSharepoint = function (name, data, cb) {
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

            // Trigger saved event
            AT._triggerEvent(AT.Events.SharepointSaved, res);

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
