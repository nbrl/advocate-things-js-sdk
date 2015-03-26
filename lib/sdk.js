;(function (context) {
    // Required for injecting third party modules
    var utils = {};

    /**
     * Wrap up imports to keep them in this project. json2 is an exception, but
     * only augments globally if missing. Namespace imports to 'utils'.
     * utils.Fingerprint - fingerprinting library
     * utils.cookieStorage - cookie wrapper for generic access
     * utils.localStorage - localStorage wrapper for generic access
     * TODO: the below probably shouldn't ever be global for the instance where
     * a client has implelemented our tag and then uses e.g. JSON elsewhere
     * without realising, then removing our tag might break other functionality.
     * JSON (global) - JSON polyfill if needed
     * Object.prototype.keys (global) - polyfill if needed (IE 7-8)
     * Array.prototype.forEach (global) - polyfill if needed (IE 7-8)
     */
    (function () {
        /* inject */
        /* endinject */
    }).call(utils);

    var events = {
        TouchpointSaved: 'TouchpointSaved',
        SharepointSaved: 'SharepointSaved',
        ReferredPerson: 'ReferredPerson'
    };

    var listeners = {};
    Object.keys(events).forEach(function (evt) {
        listeners[events[evt]] = [];
    });

    var types = {
        Touchpoint: {
            name: 'Touchpoint',
            url: 'http://127.0.0.1:3001/'
        },
        Sharepoint: {
            name: 'Sharepoint',
            url: 'http://127.0.0.1:3000/'
        },
        Unknown: {
            name: 'Unknown'
        }
    };

    var storeName = 'advocate-things'; // our storage key

    /**
     * Determine best storage type to use in current browser.
     * Localstorage if available and not full, else cookies
     */
    var store = utils.cookieStorage; // by default.
    if (typeof localStorage === 'object') {
        // More checks with raw localStorage
        var test = 'test';
        try {
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            store = utils.lclStorage;
        } catch (e) {
            console.warn(e);
        }
    }

    /**
     * The intent is to make a generic function to call all event listeners for
     * a given event type.
     * @param {string} eventName - Name of the event being triggered.
     * @param {object} data - JSON object returned from AdvocateThings.
     * TODO: reconsider the structure of 'events' variable.
     */
    var triggerEvent = function (eventName, data) {
        listeners[eventName].forEach(function (listenerFunc) {
            listenerFunc.call(data, data); // TODO: what is 'this'
        });
    };

    /**
     * TODO: Handle multiple occurences of our param by cleaning up.
     */
    var appendKeyToUrl = function () {
        // TODO: make sure History gets namespaced under utils
        // TODO: make this keep existing params and hashes rather than
        // overwriting them.
        var key = 'da';
        var val = 'new';

        // Read current URL
        var url = window.location.href;

        // Regex matches a query param keyed on `key` up to a & or # character.
        var re = new RegExp('([?&]' + key + '=)([^&#]*)', 'g');

        // Is there a hash?
        var hash = '';
        if (url.indexOf('#') !== -1) {
            var split = url.split('#');
            hash = split[1];
            url = split[0];
        }

        // Are there already query params?
        var params = '';
        if (url.indexOf('?') !== -1) {
            var split = url.split('?');
            params = '?' + split[1];
        }

        // If our key already exists in the params, change it, else add it
        if (params.match(re)) {
            // Replace
            params = params.replace(re, '$1' + val);
        } else {
            // Append
            params += '?' + key + '=' + val;
        }

        // We can rebuild it, we have the technology :)
        var newParams = params + '#' + hash;

        History.replaceState(null, null, newParams);
    };

    var storeTouchpointData = function (parsed) {
        // Initialise storage
        if (!store.hasItem(storeName)) {
            store.setItem(storeName, JSON.stringify({}), Infinity);
        }

        // Append any returned data to store.
        var storeData = JSON.parse(store.getItem(storeName)); // Start with current data

        // Check if this client key exists
        var clientToken = getClientToken();
        if (!storeData[clientToken]) {
            storeData[clientToken] = [];
        }

        // For each returned packet, check if it's sharepoint token
        // exists under the current client_token key. If not, add it.
        parsed.forEach(function (newEntry) {
            if (storeData[clientToken].length === 0) {
                storeData[clientToken].push(newEntry);
            } else {
                var duplicate = false;
                for (var i = 0; i< storeData[clientToken].length; i++) {
                    if (storeData[clientToken][i].sharepoint_token === newEntry.sharepoint_token) {
                        duplicate = true;
                        break;
                    }
                }
                if (!duplicate) {
                    storeData[clientToken].push(newEntry);
                }
            }
        });

        store.setItem(storeName, JSON.stringify(storeData), Infinity);
    };

    var getSharepointTokensFromStorage = function () {
        var tokens = [];
        var clientToken = getClientToken();

        var storeData = JSON.parse(store.getItem(storeName));

        storeData[clientToken].forEach(function (data) {
            tokens.push(data.sharepoint_token);
        });

        return tokens;
    };

    /**
     * At this point we have the correctly processed data and a url, so just
     * send.
     * @param {object} data - Data object containing (potentially augmented) _at
     *                        object.
     * @param {string} url - The url to post the data to.
     * @param {function} cb - Callback function.
     */
    var doSend = function (data, pointType, cb) {
        // Send data to the endpoint
        var xhr = new XMLHttpRequest();
        var async = true;

        var url = pointType.url;

        // Add URL to data packet (varies per packet so here instead of send().
        data._at[pointType.name.toLowerCase() + '_url'] = document.location.href;

        // If this is a touchpoint, send sharepoint_tokens with request
        if (pointType.name === types.Touchpoint.name) {
            data._at.sharepoint_tokens = getSharepointTokensFromStorage();
        }

        xhr.onload = function () {
            var res = xhr.responseText;
            var parsed = JSON.parse(res);

            if (/^20[0-9]{1}/.test(xhr.status)) {
                // If this was a touchpoint, store the data returned in local storage
                if (pointType.name === types.Touchpoint.name) {
                    storeTouchpointData(parsed);
                }

                // Trigger 'Saved' event for current point type.
                // triggerEvent('Saved', pointType.name, parsed);
                triggerEvent(pointType.name + 'Saved', parsed.metadata);

                // If sharepoint_token exists in results, this is a referred
                // person.
                if (parsed.sharepoint_token) {
                    triggerEvent('ReferredPerson', parsed.metadata);
                }
                // if (res.sharepoint_id) triggerEvent(referredperson) ...
                if (cb) {
                    cb(null, parsed.metadata);
                }
            } else {
                if (cb) {
                    cb(xhr.statusText);
                }
            }
        };

        xhr.open('POST', url, async);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
        xhr.send(JSON.stringify(data));
    };

    /**
     * Work out where to send data, then call sending helper functions. If no
     * type can be inferred, assume it is both and treat it as such.
     * @param {object} data - Data object containing _at object.
     * @param {function} cb - Callback function.
     */
    var processDataPacket = function (data, cb) {
        // Decide what *point this is and send data appropriately.
        var pointType = getPointType(data);

        if (pointType.name === types.Unknown.name) {
            // If we don't know the type, assume both.
            doSend(JSON.parse(JSON.stringify(data)), types.Sharepoint, cb);
            doSend(JSON.parse(JSON.stringify(data)), types.Touchpoint, cb);
        } else {
            doSend(data, pointType, cb);
        }
    };

    /**
     * Checks if client token is set and fails if not. Checks for '_at' key in
     * data object, adding it if necessary. Augments _at object with useful
     * data.
     * @param {object} data - Data object containing _at object.
     * @param {function} cb - Callback function.
     * @returns {object} - Duplicate of the data object with '_at' key added if
     *                     necessary.
     */
    var initDataPacket = function (data, cb) {
        // Check if client token is provided. If not, stop.
        var clientToken = getClientToken();
        if (!clientToken) {
            if (cb) {
                return cb(new Error('No client token specified'));
            } else {
                return null;
            }
        }

        // Clone data packet
        var d = JSON.parse(JSON.stringify(data));
        if (!("_at" in d)) {
            d._at = {};
        }

        // Augment client-provided data TODO: check for existence of data._at
        // data._at = !("_at" in data) ? {} : data._at; // add this in case it does not exist
        d._at.clientToken = clientToken;

        // Add fingerprint
        d._at.fingerprint = new utils.Fingerprint().get().toString(); // Fingerprint at the top so is only done once per page load.

        // Move all client metadata under _client key.
        d._client = {};
        Object.keys(d).forEach(function (key) {
            if (!(key === '_at' || key === '_client')) {
                d._client[key] = d[key];
                delete d[key];
            }
        });

        return d;
    };

    /**
     * Thin interface to match the `sendXPoint()` functions, moving any generic
     * data logic into `processDataPacket()`.
     * @param {object} data - Data object containing _at object.
     * @param {function} cb - Callback function.
     */
    var send = function (data, cb) {
        var d = initDataPacket(data, cb);
        processDataPacket(d, cb);
    };

    /**
     * Specifically send a touchpoint without having to modify the _at object.
     * Overrides any existing *point parameters.
     * @param {string} name - Unique name for the touchpoint.
     * @param {object} data - Data object containing _at object.
     * @param {function} cb - Callback function.
     */
    var sendTouchpoint = function (name, data, cb) {
        var d = initDataPacket(data, cb);;
        delete d._at.touchpoint;
        delete d._at.sharepoint;
        d._at.touchpoint = name;
        processDataPacket(d, cb);
    };

    /**
     * Specifically send a sharepoint without having to modify the _at object.
     * Overrides any existing *point parameters.
     * @param {string} name - Unique name for the sharepoint.
     * @param {object} data - Data object containing _at object.
     * @param {function} cb - Callback function.
     */
    var sendSharepoint = function (name, data, cb) {
        var d = cloneDataPacket(data, cb);
        delete d._at.sharepoint;
        delete d._at.touchpoint;
        d._at.sharepoint = name;
        processDataPacket(d, cb);
    };

    var getPointType = function (data) {
        if (data && data._at) {
            // Our object exists, what is it?
            if (data._at.hasOwnProperty('touchpoint') ||
                data._at.hasOwnProperty('touchpoint_url')) {
                return types.Touchpoint;
            }

            if (data._at.hasOwnProperty('sharepoint') ||
                data._at.hasOwnProperty('sharepoint_url')) {
                return types.Sharepoint;
            }
        }

        return types.Unknown;
    };

    /**
     * Gets the client token (API key) for the current invocation.
     * TODO: Make this more sophisticated.
     */
    var getClientToken = function() {
        var scriptUrl = document.getElementById('advocate-things-script').src;
        if (scriptUrl.indexOf('?key=') !== -1) {
            return scriptUrl.split('?').pop().split('=').pop();
        } else {
            return false;
        }
    };

    /**
     * Initialisation code. If window.advocate_things_data exists, the send it
     * to the appropriate endpoint, or both if it cannot be determined.
     */
    var init = function () {
        // if (window.advocate_things_data) {
        //     send(window.advocate_things_data);
        // }
        appendKeyToUrl();
    };
    init();

    /**
     * Allow developers to respond to certain 'events'. Actually, simple runs
     * 'added' functions when we run the corresponding code.
     * @param {string} type - Type of event to hook into (see AT.Events).
     * @param {function} listener - A function describing what should happen
     *                              when an event of {type} is triggered.
     */
    var addEventListener = function (type, listener) {
        console.info('Added event listener for ' + type);
        listeners[type].push(listener);
    };

    context.AT = {
        init: init,
        Events: events,
        send: send,
        sendTouchpoint: sendTouchpoint,
        sendSharepoint: sendSharepoint,
        addEventListener: addEventListener
    };
})(this);
