 ;(function (context) {
    // Variables
    var AT = {};
    var listeners = {};
    var store = null;
    AT.shareToken = null;
    AT.queryParamName = null;

    // Constants
    var DEFAULT_QUERY_PARAM_NAME = 'AT';
    var SCRIPT_ID = 'advocate-things-script';
    var STORAGE_NAME = 'advocate-things';
    var POINTS = {
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
     * Wrapping up imports under `AT._utils` keeps them from polluting the
     * global namespace. JSON2 is an exception but will only augment
     * globally if it is missing.
     * Global polyfills: JSON2
     * Helper libraries: cookieStorage, localStorage
     * Bower libraries: Cookie, Fingerprint, History
     */
    AT._utils = {};
    (function () {
        /* inject:utils */
        /* endinject:utils */
    }).call(AT._utils);


    /**
     * Internal function definitions
     */

    /**
     * Appends the current sharepoint token or alias to the URL as a query
     * parameter. This solves the case of sharing by copy/paste of a URL.
     * TODO: Clean up multiple occurences of DA= query params.
     * @param {string} token - The sharepoint token to insert into the URL.
     * @param {string} qpName - The name to use for the query parameter.
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

    /**
     * Get the API key for the current page.
     * @returns {string} - the API key if it exists, else null.
     */
    AT._getApiKey = function () {
        var elScript = document.getElementById(SCRIPT_ID);

        if (!elScript) {
            return null;
        }

        var scriptUrl = elScript.src;

        var re = /key=([a-zA-Z0-9]+)(&|$)/;
        if (re.test(scriptUrl)) {
            return re.exec(scriptUrl)[1];
        }

        return null;
    };

    /**
     * Retrieves the query parameter name from some Sharepoint data.
     * @param {object} sharepointData - a single sharepoint data object (usually
     *                                  res[0] from an XHR).
     * @return {string} - the share alias or share token which should be used.
     */
    AT._getQueryParamName = function (sharepointData) {
        if (!sharepointData) {
            return DEFAULT_QUERY_PARAM_NAME;
        }

        if (Object.prototype.toString.call(sharepointData) === '[object Object]' &&
            sharepointData.queryParamName) {
            return sharepointData.queryParamName;
        }

        if (Object.prototype.toString.call(sharepointData) === '[object Array]' &&
            sharepointData.length > 0) {
            if (sharepointData[0] &&
                Object.prototype.toString.call(sharepointData[0]) === '[object Object]' &&
                sharepointData[0].queryParamName) {
                return sharepointData[0].queryParamName;
            }
        }

        return DEFAULT_QUERY_PARAM_NAME;
    };

    /**
     * Gets an array of strings containing any sharepoint tokens for this client
     * and browser combination in local/cookie storage.
     * @returns {array} - Array of strings of sharepoint tokens from storage.
     */
    AT._getSharepointTokens = function () {
        var tokens = [];

        if (!store.hasItem(STORAGE_NAME)) {
            return tokens;
        }

        var storeData = JSON.parse(store.getItem(STORAGE_NAME));

        var apiKey = AT._getApiKey();

        if (!storeData[apiKey]) {
            return tokens;
        }

        for (var entry in storeData[apiKey]) {
            if (storeData[apiKey].hasOwnProperty(entry)) {
                var token = storeData[apiKey][entry].token;
                tokens.push(token);
            }
        }

        return tokens;
    };

    /**
     * Retrieves either the alias or token from some Sharepoint data with alias
     * taking precedence.
     * @param {object} sharepointData - a single sharepoint data object (usually
     *                                  res[0] from an XHR).
     * @return {string} - the share alias or share token which should be used.
     */
    AT._getTokenOrAlias = function (sharepointData) {
        if (!sharepointData) {
            return null;
        }

        return sharepointData.alias || sharepointData.token || null;
    };

    /**
     * Initialises the event listener object with empty arrays to contain
     * any event listener functions.
     * @return {object} - keyed on AT.Events.*, each containing an array of
     *                    functions to run on the associated event.
     */
    AT._initEventListeners = function () {
        var listeners = {};

        for (var evt in AT.Events) {
            if (AT.Events.hasOwnProperty(evt)) {
                listeners[AT.Events[evt]] = [];
            }
        }

        return listeners;
    };

    /**
     * Determines which type of browser storage to use. Will try local storage
     * then fallback to cookie storage if it is not available.
     * @return {object} - a uniform interface to access local storage (if
     *                    available) or cookie storage.
     */
    AT._initStorage = function () {
        if (window.localStorage) {
            // Test localStorage to see if we can use it
            var test = 'test';
            try {
                AT._utils.lclStorage.setItem(test, test);
                AT._utils.lclStorage.removeItem(test);

                return AT._utils.lclStorage;
            } catch (e) {
                AT._log('warn', 'Failed to initialise localStorage, falling back to cookies');
            }
        }

        return AT._utils.cookieStorage; // fall back to cookie storage
    };

    /**
     * Wrapper for logging to the console, ultimately so that output can be
     * toggled with a config object.
     */
     AT._log = function (type, msg) {
         // IE7 does not have window.console, avoid erroring.
         window.console && console[type](msg);
     };

    /**
     * Duplicates any passed data object (bad manners to manipulate other
     * people's variables). Adds useful metadata to _at data object.
     * @param {object} data - Data object to extend and tidy.
     * @returns {object} tidy - Duplicated and augmented version of `data`.
     */
    AT._prepareData = function (data) {
        var requiredProps = [ '_at', '_client' ];
        var tidy; // Will contain tidied data.

        // Ensure data is a real object. Initialise if not.
        if (!data || Object.prototype.toString.call(data) !== '[object Object]') {
            tidy = {};
        } else {
            tidy = JSON.parse(JSON.stringify(data || {})); // clone data
        }

        for (var propId in requiredProps) {
            if (requiredProps.hasOwnProperty(propId)) {
                if (!tidy[requiredProps[propId]] || Object.prototype.toString.call(tidy[requiredProps[propId]]) !== '[object Object]') {
                    tidy[requiredProps[propId]] = {};
                }
            }
        }

        tidy._at.apiKey = AT._getApiKey();
        tidy._at.fingerprint = new AT._utils.Fingerprint().get().toString();
        tidy._at.url = window.location.href;

        for (var key in tidy) {
            if (tidy.hasOwnProperty(key)) {
                if (!(key === '_at' || key === '_client')) { // TODO: change to use requiredProps?
                    tidy._client[key] = tidy[key];
                    delete tidy[key];
                }
            }
        }

        return tidy;
    };

    /**
     * Stores touchpoint data in the available storage, keyed under the current
     * client token.
     * TODO: Handle scenario when storage fails (try/catch) on e.g. reaching
     *       storage size limit. Consider what to do in this case (purge old?).
     * TODO: Consider using a new storage item per client token to make storage
     *       cleaner. Would however make traversal etc. more complex.
     * TODO: Consider implications of the token == token check when using
     *       aliases.
     * @param {object} d - A touchpoint data object with keys of token
     *                     (sharepoint) and metadata.
     */
    AT._storeTouchpointData = function (data) {
        // Structure:
        // storage
        //   -> advocate-things JSON.stringified({}
        //      -> apiKey []
        //         -> data {})
        if (!data || Object.prototype.toString.call(data) !== '[object Object]' || !data.token) {
            return null;
        }

        if (!store.hasItem(STORAGE_NAME)) {
            store.setItem(STORAGE_NAME, JSON.stringify({}), Infinity);
        }

        var currentlyStoredData = JSON.parse(store.getItem(STORAGE_NAME)); // TODO: try/catch
        var apiKey = AT._getApiKey();

        if (!currentlyStoredData[apiKey]) {
            currentlyStoredData[apiKey] = [];
        }

        var duplicateData = false;

        for (var i=0,len=currentlyStoredData[apiKey].length; i<len; i++) {
            if (currentlyStoredData[apiKey][i].token === data.token) {
                duplicateData = true; // was typo - test!
                break;
            }
        }

        if (!duplicateData) {
            currentlyStoredData[apiKey].push(data);
            store.setItem(STORAGE_NAME, JSON.stringify(currentlyStoredData), Infinity);
        }
    };

    /**
     * Generic function to call all event listeners for a given event type.
     * @param {string} eventName - Name of the event being triggered. See
     *                             AT.Events.
     * @param {object} data - Data to call event with - allows contextual
     *                        reactions to events.
     */
    AT._triggerEvent = function (eventType, data) {
        for (var l=0, len=listeners[eventType].length; l<len; l++) {
            listeners[eventType][l].call(data, data);
        }
    };

    /**
     * Public function definitions
     */

    /**
     * Allow developers to respond to certain 'events'. Adds passed listener
     * functions to the corresponding event name key. Leads to an array of
     * functions (or []) for any event that will be called in order on that
     * event firing.
     * @param {string} type - Type of event to hook into (see `AT.Events`).
     * @param {function} listener - A function describing what should happen
     *                              when an event of `type` is triggered.
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

    /**
     * Generic send function for sending of touchpoints and/or sharepoints.
     * Allows users to add the *point name directly to the _at object and call
     * send with the data object. If no such parameter is included, send tries
     * to send the data as a touchpoint and a sharepoint.
     * @param {object} data - Object containing data to send.
     * @param {boolean} [isInit] - Internal flag to determine whether this is
     *                             being called on script init, or at any other
     *                             time so logic may be changed in handling of
     *                             XHRs.
     * @param {function} cb - Callback function, called with (err, res).
     */
    AT.send = function (data, isInit, cb) {
        if (!AT._getApiKey()) {
            return null;
        }

        if (typeof isInit === 'function') {
            cb = isInit;
            isInit = false;
        }

        // if (data && data._at) {
        //     if (data._at.touchpointName) {
        //         return AT.sendTouchpoint(null, data, cb);
        //     }
        //     if (data._at.sharepointName) {
        //         return AT.sendSharepoint(null, data, isInit, cb);
        //     }
        // }

        return AT.sendTouchpoint(null, data, function () {
            return AT.sendSharepoint(null, data, isInit, cb);
        });
    };

    /**
     * Send a touchpoint with the given name if it is provided, else it is
     * established via the URL. If this is called from _init(), the isInit flag
     * is set to (slightly) change how the XHR is handled.
     * @param {string} name - Name of the triggered touchpoint.
     * @param {object} data - Parsed JSON data object containing _at and
     *                        _client.
     * @param {boolean} [isInit] - Internal flag to determine whether this is
     *                             being called on script init, or at any other
     *                             time so logic may be changed in handling of
     *                             XHRs.
     * @param {function} cb - Callback function, called with (err, res).
     */
    AT.sendSharepoint = function (name, data, isInit, cb) {
        if (!AT._getApiKey()) {
            return null;
        }

        if (typeof isInit === 'function') {
            cb = isInit;
            isInit = false;
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

                return;
            }

            // Handle good responses.
            var res = JSON.parse(xhr.responseText); // TODO: try/catch here

            // Make details available in AT
            var oldShareToken = AT.shareToken;
            AT.shareToken = AT._getTokenOrAlias(res && res[0]);
            AT.queryParamName = AT._getQueryParamName(res && res[0]);

            // Trigger saved event
            AT._triggerEvent(AT.Events.SharepointSaved, res);

            if ((oldShareToken !== AT.shareToken) || isInit) {
                AT._appendTokenToUrl(AT.shareToken, AT.queryParamName);
            } else {
                AT.sendSharepoint(name, data, true, cb);
            }

            if (cb) {
                return cb(null, res);
            }
        };

        xhr.open('POST', POINTS.Sharepoint.url, isAsync);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
        xhr.send(dataString);
    };

    /**
     * Send a touchpoint with the given name if it is provided, else it is
     * established via the URL.
     * @param {string} name - Name of the triggered touchpoint.
     * @param {object} data - Object containing data to send.
     * @param {function} cb - Callback function, called with (err, res).
     */
    AT.sendTouchpoint = function (name, data, cb) {
        if (!AT._getApiKey()) {
            return null;
        }

        var dataPrep = AT._prepareData(data);

        if (name) {
            dataPrep._at.touchpointName = name;
        }

        dataPrep._at.shareTokens = AT._getSharepointTokens();

        var dataString = JSON.stringify(dataPrep);

        var xhr = new XMLHttpRequest();
        var isAsync = true;

        xhr.onload = function () {
            // Handle error responses.
            if (!/^20[0-9]{1}/.test(xhr.status)) {
                if (cb) {
                    return cb(new Error(xhr.statusText));
                }

                return;
            }

            // Handle good responses.
            var res = JSON.parse(xhr.responseText); // TODO: try/catch here

            AT._storeTouchpointData(res);

            var meta = res.metadata;

            // Trigger saved event
            AT._triggerEvent(AT.Events.TouchpointSaved, meta);

            if (res.token) {
                // TODO: consider triggering this event downstream as well
                AT._triggerEvent(AT.Events.ReferredPerson, meta);
            }

            if (cb) {
                return cb(null, res);
            }
        };

        xhr.open('POST', POINTS.Touchpoint.url, isAsync);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
        xhr.send(dataString);
    };

     var API = {
         CreateToken: {
             url: 'https://sharepoint-data-collector.herokuapp.com/share-token/',
             method: 'POST',
             async: true
         },
         UpdateToken: {
             url: 'https://sharepoint-data-collector.herokuapp.com/share-token/',
             method: 'PUT',
             async: true
         },
         LockToken: {
             url: 'https://sharepoint-data-collector.herokuapp.com/share-token/',
             method: 'POST',
             async: true
         },
         ConsumeToken: {
             url: 'https://sharepoint-data-collector.herokuapp.com/share-token/',
             method: 'POST',
             async: true
         }
     };

     /**
      * Obtain a new share token. Optionally initialise the token metadata.
      * @param {object} data - Data to initialise with.
      * @param {function} [cb] - Callback function with (err, tokens).
      */
     AT.createToken = function (data, cb) {
         var token;

         var dataPrep = AT._prepareData(data);

         var dataString = JSON.stringify(dataPrep);

         var xhr = new XMLHttpRequest();

         xhr.onload = function () {
             if (!/^20[0-9]{1}/.test(xhr.status)) {
                 if (cb) {
                     return cb(new Error(xhr.statusText));
                 }

                 return;
             }

             var tokens = JSON.parse(xhr.responseText);

             if (cb) {
                 return cb(null, tokens);
             }

             return;
         };

         var call = API.CreateToken;
         xhr.open(call.method, call.url, call.async);
         xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
         xhr.send(dataString);
     };

     /**
      * Update the metadata associated with the provided token.
      * @param {string} token - The token for which the metadata should be
      *                         updated.
      * @param {object} data -
      * @param {function} [cb] - Callback function with (err, token).
      */
     AT.updateToken = function (token, data, cb) {
         if (!token) {
             if (cb) {
                 return cb(new Error('[updateToken] You must specify a token to update.'));
             }

             return;
         }

         var xhr = new XMLHttpRequest();

         var dataPrep = AT._prepareData(data);

         var dataString = JSON.stringify(dataPrep);

         xhr.onload = function () {
             if (!/^20[0-9]{1}/.test(xhr.status)) {
                 if (cb) {
                     return cb(new Error(xhr.statusText));
                 }

                 return;
             }

             var token = JSON.parse(xhr.responseText);

             if (cb) {
                 return cb(null, token.token);
             }

             return;
         };

         var call = API.UpdateToken;
         xhr.open(call.method, call.url + token, call.async);
         xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
         xhr.send(dataString);
     };

     /**
      * Allows locking of a token, after which the metadata can no longer be
      * updated.
      * @param {string} token - The token which should be locked.
      * @param {function} [cb] -
      */
     AT.lockToken = function (token, cb) {
         if (!token) {
             if (cb) {
                 return cb(new Error('[lockToken] You must specify a token to lock.'));
             }

             return;
         }

         var xhr = new XMLHttpRequest();

         xhr.onload = function () {
             if (!/^20[0-9]{1}/.test(xhr.status)) {
                 if (cb) {
                     return cb(new Error(xhr.statusText));
                 }

                 return;
             }

             var token = JSON.parse(xhr.responseText);

             if (cb) {
                 return cb(null, token.token);
             }

             return;
         };

         var call = API.LockToken;
         xhr.open(call.method, call.url + token + '/locked/', call.async);
         xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
         xhr.send(JSON.stringify({}));
     };

     /**
      * Consumes a share token. This locks in the metadata for this token. Use
      * to signify that a share has/is about to happen (e.g. clicking share
      * button).
      * @param {string} token -
      * @param {object} data -
      * @param {function} [cb] -
      */
     AT.consumeToken = function (token, data, cb) {
         if (!token) {
             if (cb) {
                 return cb(new Error('[consumeToken] You must specify a token to lock.'));
             }

             return;
         }

         var xhr = new XMLHttpRequest();

         xhr.onload = function () {
             if (!/^20[0-9]{1}/.test(xhr.status)) {
                 if (cb) {
                     return cb(new Error(xhr.statusText));
                 }

                 return;
             }

             var token = JSON.parse(xhr.responseText);

             if (cb) {
                 return cb(null, token.token);
             }

             return;
         };

         var call = API.ConsumeToken;
         xhr.open(call.method, call.url + token, call.async);
         xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
         xhr.send(JSON.stringify({}));
     };

    /**
     * Initialisation function
     */

    /**
     * Automatically sends window.advocate_things_data as a touchpoint or
     * sharepoint (if specified, else both).
     * @param {function} cb - Callback function.
     */
    AT._autoSend = function (cb) {
        var data = window.advocate_things_data;

        AT.send(data, true, cb);
    };

    /**
     * Initialises the components of the SDK. Called automatically when the
     * script loads.
     * @param {function} cb - Callback function.
     */
    AT._init = function (cb) {
        if (!AT._getApiKey()) {
            return null;
        }

        listeners = AT._initEventListeners();
        store = AT._initStorage();

        AT._autoSend(cb); // this will become conditional on config object
    };
    // AT._init(); // Run immediately

    // Make AT available in the current context (usually `window`).
    context.AT = AT;

})(this);
