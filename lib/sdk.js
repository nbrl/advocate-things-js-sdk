var AT = (function () {
    var sharepointCollectorURL = 'http://127.0.0.1:3000/';
    var touchpointCollectorURL = 'http://127.0.0.1:3001/';

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

    /**
     * The intent is to make a generic function to call all event listeners for
     * a given event type.
     * TODO: reconsider the structure of 'events' variable.
     */
    var triggerEvent = function (eventType, eventContext, data) {
        listeners[eventContext + eventType].forEach(function (listenerFunc) {
            listenerFunc.call(this, data);
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

            if (cb) {
                if (/^20[0-9]{1}/.test(xhr.status)) {
                    triggerEvent('Saved', pointType.name, res);
                    cb(null, res);
                } else {
                    cb(xhr.statusText);
                }
            }
        };

        xhr.open('POST', url, async);
        xhr.setRequestHeader("Content-Type", "application/json");
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

        // If we don't know the type, assume both.
        if (pointType === 'Unknown') {
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

    return {
        init: init,
        Events: events,
        send: send,
        sendTouchpoint: sendTouchpoint,
        sendSharepoint: sendSharepoint,
        addEventListener: addEventListener
    };
})();
