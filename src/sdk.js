;(function (context) {

    /*
     * Injection of third-party modules
     * Wrapping up imports under `utils` to keep them in this project. JSON2 is
     * an exception but will only augment globally if it is missing.
     * Global polyfills: JSON2, Object.keys, Array.forEach
     * Helper libraries: cookieStorage, localStorage
     * Bower libraries: Cookie, Fingerprint, History
     */
    var utils = {};
    (function () {
        /* inject */
        /* endinject */
    }).call(utils);

    // Don't hard code anything
    var scriptTagId = 'advocate-things-script';
    var storageName = 'advocate-things';

    var events = {
        TouchpointSaved: 'TouchpointSaved',
        SharepointSaved: 'SharepointSaved',
        ReferredPerson: 'ReferredPerson'
    };

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

    // Variables initialised by init()
    var apiKey = null;
    var listeners = {};
    var store = null;
    var currentReferredPerson = null; // TODO: implement this!
    var currentSharepointToken = null;

    // PRIVATE FUNCTIONS

    /**
     * Get the API key for the current page. Sets the `apiKey` global.
     * @returns {boolean} - true if key exists and is saved, else false.
     */
    function getClientToken() {
        console.info('getClientToken()');
        var scriptElement = document.getElementById(scriptTagId);

        if (!scriptElement) {
            console.warn('No ' + scriptTagId + ' element.');
            return false;
        }

        var scriptUrl = scriptElement.src;
        if (scriptUrl.indexOf('?key=') !== -1) {
            apiKey = scriptUrl.split('?').pop().split('=').pop();
            return true;
        }

        console.warn('No client token defined in ' + scriptTagId + ' element.');
        return false;
    }

    /**
     * Gets an array of strings containing any sharepoint tokens for this client
     * and browser combination in localStorage/cookies.
     * @returns {array} - Array of strings of sharepoint tokens from storage.
     */
    function getSharepointTokens() {
        var tokens = [];

        if (!store.hasItem(storageName)) {
            return [];
        }

        var storeData = JSON.parse(store.getItem(storageName));
        if (!storeData[apiKey]) {
            return [];
        }

        storeData[apiKey].forEach(function (entry) {
            tokens.push(entry.token);
        });

        return tokens;
    }

    /**
     * Helper function to retrieve either the alias or token from some Sharepoint
     * data with alias taking precedence.
     * @param {object} sharepointData - a single sharepoint data object (usually res[0])
     * @return {string} - the share token to use
     */
    function getTokenOrAlias(sharepointData) {
	if (sharepointData) {
            return sharepointData.alias || sharepointData.token || null;
	}

	return null;
    }

    function getQueryParamName(sharepointData) {
	if (sharepointData) {
	    return sharepointData.queryParamName || null;
	}

	return null;
    }

    /**
     * Initialises the event listener array with empty arrays to contain
     * any event listener functions.
     */
    function initEventListeners() {
        console.info('initEventListeners()');
        Object.keys(events).forEach(function (evt) {
            listeners[events[evt]] = [];
        });
    }

    /**
     * Initialises storage as cookie storage, then, if available, is replaced by
     * local storage.
     */
    function initStorage() {
        console.info('initStorage()');
        store = utils.cookieStorage;
        if (typeof localStorage === 'object') {
            var test = 'test';
            try {
                utils.lclStorage.setItem(test, test);
                utils.lclStorage.removeItem(test);
                store = utils.lclStorage;
            } catch (e) {
                console.warn(e);
            }
        }
    }

    /**
     * Stores touchpoint data in the available storage, keyed under the current
     * client token.
     * TODO: Handle scenario when storage fails (try/catch) on e.g. reaching
     *       storage size limit. Consider what to do in this case (purge old?).
     * TODO: Consider using a new storage item per client token to make storage
     *       cleaner. Would however make traversal etc. more complex.
     * @param {object} d - A touchpoint data object with keys of token
     *                     (sharepoint) and metadata.
     */
    function storeTouchpointData(d) {
        console.info('storeTouchpointData()');

        if (!d.token) {
            return;
        }

        if (!store.hasItem(storageName)) {
            store.setItem(storageName, JSON.stringify({}), Infinity);
        }

        var currentStoreData = JSON.parse(store.getItem(storageName));

        if (!currentStoreData[apiKey]) {
            currentStoreData[apiKey] = [];
        }

        var duplicateData = false;
        for (var i=0, len=currentStoreData[apiKey].length; i<len; i++) {
            if (currentStoreData[apiKey][i].token === d.token) {
                duplicateData = true;
                break;
            }
        }

        if (!duplicateData) {
            currentStoreData[apiKey].push(d);
            store.setItem(storageName, JSON.stringify(currentStoreData), Infinity);
        }
    }

    /**
     * Duplicates any passed data object (bad manners to manipulate other
     * people's variables. Adds useful metadata to _at data object.
     * @param {object} data - Full data object containing _at and other keys.
     * @returns {object} d - Duplicated and augmented equivalent of `data`.
     */
    function tidyDataObject(data) {
        console.info('tidyDataObject()');
        console.log(data);

        var d = JSON.parse(JSON.stringify(data || {}));
        if (!('_at' in d)) {
            d._at = {};
        }

        d._at.apiKey = apiKey;
        d._at.fingerprint = new utils.Fingerprint().get().toString();
        d._at.url = document.location.href;

	// Don't re-tidy
	if (!('_client' in d)) {
            d._client = {};
            Object.keys(d).forEach(function (key) {
		if (!(key === '_at' || key === '_client')) {
                    d._client[key] = d[key];
                    delete d[key];
		}
            });
	}

        return d;
    }

    /**
     * Generic function to call all event listeners for a given event type.
     * @param {string} eventName - Name of the event being triggered. See
     *                             AT.Events.
     * @param {object} data - Data to call event with - allows contextual
     *                        reactions to events.
     */
    function triggerEvent(eventName, data) {
        console.info('triggerEvent(' + eventName + ')');
        listeners[eventName].forEach(function (listenerFunc) {
            listenerFunc.call(data, data);
        });
    }

    /**
     * Appends the current sharepoint token to the URL as a query parameter.
     * This solves the case of sharing by copy/paste of a URL.
     * TODO: Clean up multiple occurences of DA= query params.
     * @param {string} token - The sharepoint token to insert into the URL.
     */
    function urlAppendToken(token, queryParamName) {
        console.info('urlAppendToken()');
        if (!token || !queryParamName) {
            return;
        }

        var url = window.location.href;

        var re = new RegExp('([?&]' + queryParamName + '=)([^&#]*)', 'g');

        var hash = '';
        var split = ''; // temp var for obtaining both sides of split.
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

        if (params.match(re)) {
            // Replace
            params = params.replace(re, '$1' + token);
        } else {
            // Append
            var separator = '?';
            if (params) {
                separator = '&';
            }
            params += separator + queryParamName + '=' + token;
        }

        // We can rebuild it, we have the technology
        /* jshint ignore:start */
        var newParams = (hash)
                      ? params + '#' + hash
                      : params;
        /* jshint ignore:end */

        // Rewrite the URL.
        History.replaceState(null, null, newParams);
    }

    // PUBLIC FUNCTIONS

    /**
     * Initialise the SDK, called automatically on script load. Automatically
     * sends a touchpoint or sharepoint (if specified, else both) on script
     * load using data in `window.advocate_things_data`.
     */
    function init() {
        console.info('init()');

        if (!getClientToken()) {
            return false;
        }

        initStorage();
        initEventListeners();

        var d = tidyDataObject(window.advocate_things_data);
        if (d && d._at) {
            if (d._at.sharepointName) {
                // sharepoint
                sendSharepointInit(d);
            } else if (d._at.touchpointName) {
                // touchpoint
                sendTouchpointInit(d);
            } else {
                // both
                sendTouchpointInit((d), function () {
                    d = tidyDataObject(window.advocate_things_data);
                    sendSharepointInit(d);
                });
            }
        }
    }
    init();

    /**
     * Allow developers to respond to certain 'events'. Adds passed listener
     * functions to the corresponding event name key. Leads to an array of
     * functions (or []) for any event that will be called in order on that
     * event firing.
     * @param {string} type - Type of event to hook into (see AT.Events).
     * @param {function} listener - A function describing what should happen
     *                              when an event of {type} is triggered.
     */
    function addEventListener(type, listener) {
        if (!apiKey) {
            return;
        }
        console.info('addEventListener()');
        listeners[type].push(listener);
    }

    /**
     * Generic send function for sending of touchpoints and/or sharepoints.
     * Allows users to add the *point name directly to the _at object and call
     * send with the data object. If no such parameter is included, send tries
     * to send the data as a touchpoint and a sharepoint.
     * @param {object} data - Parsed JSON data object containing _at and
     *                        _client.
     * @param {function} cb - Callback function, called with (err, res).
     */
    function send(data, cb) {
        if (!apiKey) {
            return;
        }

        var d = tidyDataObject(data);
        if (d && d._at) {
            if (d._at.sharepointName) {
                // sharepoint
                sendSharepoint(d, cb); // FIXME: this is wrong (check method sig)
            } else if (d._at.touchpointName) {
                // touchpoint
                sendTouchpoint(d, cb); // FIXME: this is wrong
            } else {
                // both
                sendTouchpoint(d, function () {
                    sendSharepoint(d, cb); // FIXME: this is wrong
                });
            }
        }
    }

    /**
     * Send a sharepoint from init(). This differs to normal sharepoint sending
     * as the URL is always given a query parameter from the response.
     * @param {object} d - Parsed JSON data object containing _at and _client.
     * @param {function} cb - Callback function, called with (err, res).
     */
    function sendSharepointInit(d, cb) {
        console.info('sendSharepointInit()');
        var xhr = new XMLHttpRequest();
        var async = true;

        var ds = JSON.stringify(d);

        xhr.onload = function () {
            if (/^20[0-9]{1}/.test(xhr.status)) {
                var res = JSON.parse(xhr.responseText);

                var queryParamName = getQueryParamName(res && res[0]);
                currentSharepointToken = getTokenOrAlias(res && res[0]);

                // Trigger event
                triggerEvent(events.SharepointSaved, res);

                // Try to append token to URL
                urlAppendToken(currentSharepointToken, queryParamName);

                // Callback
                if (cb) {
                    cb(null, res);
                }
            } else {
                if (cb) {
                    cb(xhr.statusText);
                }
            }
        };

        xhr.open('POST', points.Sharepoint.url, async);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
        xhr.send(ds);
    }

    /**
     * Send a touchpoint from init(). This is used as part of the standard
     * sendTouchpoint() call (differs to sharepoints in this respect).
     * @param {object} d - Parsed JSON data object containing _at and _client.
     * @param {function} cb - Callback function, called with (err, res).
     */
    function sendTouchpointInit(d, cb) {
        console.info('sendTouchpointInit()');
        var xhr = new XMLHttpRequest();
        var async = true;

        d._at.shareTokens = getSharepointTokens();
        var ds = JSON.stringify(d);

        xhr.onload = function () {
            if (/^20[0-9]{1}/.test(xhr.status)) {
                var res = JSON.parse(xhr.responseText);

                storeTouchpointData(res);
                var meta = JSON.parse(res.metadata);

                // Trigger events
                triggerEvent(events.TouchpointSaved, meta);

                if (res.token && res.token !== "") {
                    // TODO: consider triggering this event downstream as well
                    triggerEvent(events.ReferredPerson, meta);
                }

                // Callback
                if (cb) {
                    cb(null, meta);
                }
            } else {
                if (cb) {
                    cb(xhr.statusText);
                }
            }
        };

        xhr.open('POST', points.Touchpoint.url, async);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
        xhr.send(ds);
    }

    /**
     * Manually send a touchpoint with the given name. The name is added to the
     * _at object before sending using exactly the same call as used in init().
     * @param {string} name - Name of the triggered touchpoint.
     * @param {object} data - Parsed JSON data object containing _at and
     *                        _client.
     * @param {function} cb - Callback function, called with (err, res).
     */
    function sendTouchpoint(name, data, cb) {
        if (!apiKey) {
            return;
        }
        console.info('sendTouchpoint()');
        var d = tidyDataObject(data);
        if (name) {
            d._at.touchpointName = name;
        }

        // Passthrough for touchpoints :)
        sendTouchpointInit(d, cb);
    }

    /**
     * Manually send a sharepoint with the given name. The name is added to the
     * _at object before sending. Sending sharepoints outside of init() use a
     * different call as the URL token is only updated when the token recevied
     * back from the XHR is the same as the current one. When this occurs, a new
     * token is requested.
     * @param {string} name - Name of the triggered touchpoint.
     * @param {object} data - Parsed JSON data object containing _at and
     *                        _client.
     * @param {function} cb - Callback function, called with (err, res).
     */
    function sendSharepoint(name, data, cb) {
        if (!apiKey) {
            return;
        }
        console.info('sendSharepoint()');
        var d = tidyDataObject(data);

        if (name) {
            d._at.sharepointName = name;
        }

        var xhr = new XMLHttpRequest();
        var async = true;

        var ds = JSON.stringify(d);

        xhr.onload = function () {
            if (/^20[0-9]{1}/.test(xhr.status)) {
                var res = JSON.parse(xhr.responseText);

                var oldToken = currentSharepointToken;
                var queryParamName = getQueryParamName(res && res[0]);
                currentSharepointToken = getTokenOrAlias(res && res[0]);

                // Trigger event
                triggerEvent(events.SharepointSaved, res);

                // Conditionally append token to URL
                if (currentSharepointToken === oldToken) {
                    // Request new token
                    sendSharepointInit(data); // pre-named data object
                } else {
                    // Try to append token to URL
                    urlAppendToken(currentSharepointToken, queryParamName);
                }

                // Callback
                if (cb) {
                    cb(null, res);
                }
            } else {
                if (cb) {
                    cb(xhr.statusText);
                }
            }
        };

        xhr.open('POST', points.Sharepoint.url, async);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
        xhr.send(ds);
    }

    /**
     * Expose the goodies under AT global variable.
     */
    context.AT = {
        // Public methods
        init: init,
        addEventListener: addEventListener,
        sendSharepoint: sendSharepoint,
        sendTouchpoint: sendTouchpoint,
        send: send,
        // Exposed variables
        Events: events,
        referredPerson: currentReferredPerson,
        sharepointToken: currentSharepointToken
    };
})(this);
