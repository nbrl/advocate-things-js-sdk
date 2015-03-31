;(function (context) {
    var utils = {};
    (function () {
        /* inject */
        /* endinject */
    }).call(utils);

    // Don't hard code anything
    var queryParamName = 'DA';
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
            // url: 'http://127.0.0.1:3000'
            url: 'http://localhost:3001/campaign/token/sharepoint/data'
        },
        Touchpoint: {
            name: 'Touchpoint',
            // url: 'http://127.0.0.1:3001'
            url: 'http://localhost:3000/campaign/token/touchpoint/data'
        },
        Unknown: {
            name: 'Unknown'
        }
    };

    // Initialised variables
    var clientToken = null;
    var listeners = {};
    var store = null;
    var currentReferredPerson = null;
    var currentSharepointToken = null;

    // PRIVATE FUNCTIONS

    function getClientToken() {
        console.info('getClientToken()');
        var scriptElement = document.getElementById(scriptTagId);

        if (!scriptElement) {
            console.warn('No ' + scriptTagId + ' element.');
            return false;
        }

        var scriptUrl = scriptElement.src;
        if (scriptUrl.indexOf('?key=') !== -1) {
            clientToken = scriptUrl.split('?').pop().split('=').pop();
            return true;
        }

        console.warn('No client token defined in ' + scriptTagId + ' element.');
        return false;
    }

    function getSharepointTokens() {
        var tokens = [];

        if (!store.hasItem(storageName)) {
            return [];
        }

        var storeData = JSON.parse(store.getItem(storageName));
        if (!storeData[clientToken]) {
            return [];
        }

        storeData[clientToken].forEach(function (entry) {
            tokens.push(entry.token);
        });

        return tokens;
    }

    function initEventListeners() {
        console.info('initEventListeners()');
        Object.keys(events).forEach(function (evt) {
            listeners[events[evt]] = [];
        });
    }

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

    // Change to use a new storage item per key, or just one storage item for
    // Advocate Things, keyed on client ID. The former sounds cleaner, but the
    // latter is easier to traverse.
    function storeTouchpointData(d) {
        console.info('storeTouchpointData()');

        if (!d.token) {
            return;
        }

        if (!store.hasItem(storageName)) {
            store.setItem(storageName, JSON.stringify({}), Infinity);
        }

        var currentStoreData = JSON.parse(store.getItem(storageName));

        if (!currentStoreData[clientToken]) {
            currentStoreData[clientToken] = [];
        }

        var duplicateData = false;
        for (var i=0; i<currentStoreData[clientToken].length; i++) {
            if (currentStoreData[clientToken][i].token === d.token) {
                duplicateData = true;
                break;
            }
        }

        if (!duplicateData) {
            currentStoreData[clientToken].push(d);
            store.setItem(storageName, JSON.stringify(currentStoreData), Infinity);
        }
    }

    function tidyDataObject(data) {
        console.info('tidyDataObject()');
        console.log(data);

        var d = JSON.parse(JSON.stringify(data || {}));
        if (!('_at' in d)) {
            d._at = {};
        }

        d._at.clientToken = clientToken;
        d._at.fingerprint = new utils.Fingerprint().get().toString();
        d._at.url = document.location.href;

        d._client = {};
        Object.keys(d).forEach(function (key) {
            if (!(key === '_at' || key === '_client')) {
                d._client[key] = d[key];
                delete d[key];
            }
        });

        return d;
    }

    function triggerEvent(eventName, data) {
        console.info('triggerEvent(' + eventName + ')');
        listeners[eventName].forEach(function (listenerFunc) {
            listenerFunc.call(data, data);
        });
    }

    // TODO: clean up multiple DA= query params
    function urlAppendToken(token) {
        console.info('urlAppendToken()');
        if (!token) {
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

    function init() {
        console.info('init()');

        if (!getClientToken()) {
            return;
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

    function addEventListener(type, listener) {
        if (!clientToken) {
            return;
        }
        console.info('addEventListener()');
        listeners[type].push(listener);
    }

    // TODO: change this to not use sendXInit(). Touchpoint is ok, but
    // sendSharepointInit will blindly set the query param, whereas from a
    // manual send, we don't necessarily want to. Potentially, we need a third
    // sendSharepoint type function.
    function send(data, cb) {
        if (!clientToken) {
            return;
        }

        var d = tidyDataObject(data);
        if (d && d._at) {
            if (d._at.sharepointName) {
                // sharepoint
                sendSharepointInit(d);
            } else if (d._at.touchpointName) {
                // touchpoint
                sendTouchpointInit(d);
            } else {
                // both
                sendTouchpointInit(d, function () {
                    sendSharepointInit(d);
                });
            }
        }
    }

    function sendSharepointInit(d, cb) {
        console.info('sendSharepointInit()');
        var xhr = new XMLHttpRequest();
        var async = true;

        var ds = JSON.stringify(d);

        xhr.onload = function () {
            if (/^20[0-9]{1}/.test(xhr.status)) {
                var res = JSON.parse(xhr.responseText);

                currentSharepointToken = res[0].token;

                // Trigger event
                triggerEvent(events.SharepointSaved, res);

                // Append token to URL (blindly in this instance)
                urlAppendToken(currentSharepointToken);

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

    function sendTouchpoint(name, data, cb) {
        if (!clientToken) {
            return;
        }
        console.info('sendTouchpoint()');
        var d = tidyDataObject(data);
        if (name) {
            d._at.touchpoint_name = name;
        }

        // Passthrough for touchpoints :)
        sendTouchpointInit(d, cb);
    }

    function sendSharepoint(name, data, cb) {
        if (!clientToken) {
            return;
        }
        console.info('sendSharepoint()');
        var d = tidyDataObject(data);

        if (name) {
            d._at.sharepoint_name = name;
        }

        var xhr = new XMLHttpRequest();
        var async = true;

        var ds = JSON.stringify(d);

        xhr.onload = function () {
            if (/^20[0-9]{1}/.test(xhr.status)) {
                var res = JSON.parse(xhr.responseText);

                var oldToken = currentSharepointToken;
                currentSharepointToken = res[0].token;

                // Trigger event
                triggerEvent(events.SharepointSaved, res);

                // Append token to URL (conditionally this time)
                if (currentSharepointToken === oldToken) {
                    // Request new token
                    sendSharepointInit(data); // pre-named data object
                } else {
                    urlAppendToken(currentSharepointToken);
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

    context.AT = {
        // Public methods
        init: init,
        addEventListener: addEventListener,
        sendSharepoint: sendSharepoint,
        sendTouchpoint: sendTouchpoint,
        // Exposed variables
        Events: events,
        referredPerson: currentReferredPerson,
        sharepointToken: currentSharepointToken
    };
})(this);
