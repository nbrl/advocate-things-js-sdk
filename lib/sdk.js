var AT = (function () {
    var sharepointCollectorURL = 'http://127.0.0.1:3000/';
    var touchpointCollectorURL = 'http://127.0.0.1:3001/';

    var events = {
        TouchpointSaved: 'TouchpointSaved',
        SharepointSaved: 'SharepointSaved',
        ReferredPerson: 'ReferredPerson'
    };

    var points = {
        Touchpoint: 'Touchpoint',
        Sharepoint: 'Sharepoint',
        Unknown: 'Unknown'
    };

    /**
     * At this point we have the correctly processed data and a url, so just
     * send.
     * @param {object} data - Data object containing (potentially augmented) _at
     *                        object.
     * @param {string} url - The url to post the data to.
     * @param {function} cb - Callback function.
     */
    var doSend = function (data, url, cb) {
        // Send data to the endpoint
        var xhr = new XMLHttpRequest();

        xhr.onload = function () {
            var res = xhr.responseText;

            if (cb) {
                console.log('returning ' + JSON.stringify(res));
                cb(null, res);
            }
        };

        xhr.open('POST', url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify(data));
    };

    /**
     * Work out where to send data, then call sending helper functions. If no
     * type can be inferred, assume it is both and treat it as such.
     * @param {object} data - Data object containing _at object.
     * @param {function} cb - Callback function.
     */
    var send = function (data, cb) {
        switch(getPointType()) {
            case points.Touchpoint:
                doSend(data, touchpointCollectorURL, cb);
                break;
            case points.Sharepoint:
                doSend(data, sharepointCollectorURL, cb);
                break;
            default:
                doSend(data, touchpointCollectorURL, cb);
                doSend(data, sharepointCollectorURL, cb);
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

    var getPointType = function () {
        if (window.advocate_things_data && window.advocate_things_data._at) {
            // Our object exists, what is it?
            if (window.advocate_things_data._at.hasOwnProperty('touchpoint') ||
                window.advocate_things_data._at.hasOwnProperty('touchpoint_url')) {
                return points.Touchpoint;
            }

            if (window.advocate_things_data._at.hasOwnProperty('sharepoint') ||
                window.advocate_things_data._at.hasOwnProperty('sharepoint_url')) {
                return points.Sharepoint;
            }
        }

        return points.Unknown;
    };

    /**
     * Initialisation code. If window.advocate_things_data exists, the send it
     * to the appropriate endpoint, or both if it cannot be determined.
     */
    var init = function () {
        if (window.advocate_things_data) {
            send(window.advocate_things_data);
        }
    };
    init();

    // Define the function to add an event listener
    var addEventListener = function (type, listener) {
        console.log('addEventListener running');
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
