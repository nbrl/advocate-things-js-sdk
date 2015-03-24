;(function (context) {
    // Required for injecting third party modules
    var utils = {};

    /**
     * Wrap up imports to keep them in this project. json2 is an exception, but
     * only augments globally if missing. Namespace imports to 'utils'.
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

    // /**
    //  * Mozilla's cookies.js
    //  * TODO: include at build time rather than including here.
    //  */
    // var cookieStorage = {
    //     getItem: function (sKey) {
    //         if (!sKey) { return null; }
    //         return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
    //     },
    //     setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
    //         if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
    //         var sExpires = "";
    //         if (vEnd) {
    //             switch (vEnd.constructor) {
    //                 case Number:
    //                     sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
    //                     break;
    //                 case String:
    //                     sExpires = "; expires=" + vEnd;
    //                     break;
    //                 case Date:
    //                     sExpires = "; expires=" + vEnd.toUTCString();
    //                     break;
    //             }
    //         }
    //         document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
    //         return true;
    //     },
    //     removeItem: function (sKey, sPath, sDomain) {
    //         if (!this.hasItem(sKey)) { return false; }
    //         document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
    //         return true;
    //     },
    //     hasItem: function (sKey) {
    //         if (!sKey) { return false; }
    //         return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
    //     },
    //     keys: function () {
    //         var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
    //         for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
    //         return aKeys;
    //     }
    // };

    /**
     * Give localStorage the same interface as cookieStorage.
     */
    var lclStorage = {
        hasItem: function (key) {
            return localStorage.hasOwnProperty(key);
        },
        getItem: function (key) {
            return localStorage.getItem(key);
        },
        setItem: function (key, value) {
            localStorage.setItem(key, value);
        },
        removeItem: function (key) {
            localStorage.removeItem(key);
        }
    };

    /**
     * Determine best storage type to use in current browser.
     * Localstorage if available and not full, else cookies
     */
    var store = utils.cookieStorage; // by default.
    // if (typeof localStorage === 'object') {
    //     // More checks
    //     var test = 'test';
    //     try {
    //         localStorage.setItem(test, test);
    //         localStorage.removeItem(test);
    //         store = localStorage;
    //     } catch (e) {
    //         console.warn(e);
    //     }
    // }

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

        xhr.onload = function () {
            var res = xhr.responseText;
            var parsed = JSON.parse(res);

            if (cb) {
                if (/^20[0-9]{1}/.test(xhr.status)) {
                    // console.warn(JSON.parse(res).meta);
                    // console.warn(JSON.parse(res).sharepoint_token);

                    // Save any returned data to store.
                    store.setItem(storeName, JSON.stringify([parsed]), Infinity);

                    // Trigger 'Saved' event for current point type.
                    // triggerEvent('Saved', pointType.name, parsed);
                    triggerEvent(pointType.name + 'Saved', parsed);

                    // If sharepoint_token exists in results, this is a referred
                    // person.
                    if (parsed.sharepoint_token) {
                        triggerEvent('ReferredPerson', parsed);
                    }
                    // if (res.sharepoint_id) triggerEvent(referredperson) ...
                    cb(null, res);
                } else {
                    cb(xhr.statusText);
                }
            }
        };

        xhr.open('POST', url, async);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(data));
    };

    /**
     * Work out where to send data, then call sending helper functions. If no
     * type can be inferred, assume it is both and treat it as such.
     * @param {object} data - Data object containing _at object.
     * @param {function} cb - Callback function.
     */
    var send = function (rawData, cb) {
        // Clone data rather than using a reference. Doing it here as it is the
        // topmost function taking data directly from the frontend that does any
        // manipulation
        var data = JSON.parse(JSON.stringify(rawData));

        // Augment client-provided data
        data._at.clientToken = getClientToken();

        // Move all client metadata under _client key.
        data._client = {};
        Object.keys(data).forEach(function (key) {
            if (!(key === '_at' || key === '_client')) {
                data._client[key] = data[key];
                delete data[key];
            }
        });

        // Decide what *point this is and send data appropriately.
        var pointType = getPointType(data);

        // Add URL
        data._at[pointType.name.toLowerCase() + '_url'] = document.location.href;

        // Add fingerprint
        // data._at.fingerprint = new utils.Fingerprint().get(); // TODO: move outside of functions.

        if (pointType === types.Unknown) { // TODO: double check this works (obj ===)
            // If we don't know the type, assume both.
            doSend(data, types.Sharepoint, cb);
            doSend(data, types.Touchpoint, cb);
        } else {
            doSend(data, pointType, cb);
        }
    };

    /**
     * Specifically send a touchpoint without having to modify the _at object.
     * Overrides any existing *point parameters.
     * @param {string} name - Unique name for the touchpoint.
     * @param {object} data - Data object containing _at object.
     * @param {function} cb - Callback function.
     */
    var sendTouchpoint = function (name, data, cb) {
        var d = data;
        delete d._at.touchpoint;
        delete d._at.touchpoint_url;
        delete d._at.sharepoint;
        delete d._at.sharepoint_url;
        d._at.touchpoint = name;
        send(d, cb);
    };

    /**
     * Specifically send a sharepoint without having to modify the _at object.
     * Overrides any existing *point parameters.
     * @param {string} name - Unique name for the sharepoint.
     * @param {object} data - Data object containing _at object.
     * @param {function} cb - Callback function.
     */
    var sendSharepoint = function (name, data, cb) {
        var d = data;
        delete d._at.sharepoint;
        delete d._at.sharepoint_url;
        delete d._at.touchpoint;
        delete d._at.touchpoint_url;
        d._at.sharepoint = name;
        send(d, cb);
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
     */
    var getClientToken = function() {
        var scriptUrl = document.getElementById('advocate-things-script').src;
        return scriptUrl.split('?').pop().split('=').pop();
    };

    /**
     * Initialisation code. If window.advocate_things_data exists, the send it
     * to the appropriate endpoint, or both if it cannot be determined.
     */
    var init = function () {
        // if (window.advocate_things_data) {
        //     send(window.advocate_things_data);
        // }
        // console.warn(store.getItem(storeName));
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
