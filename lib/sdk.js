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
     * Work out where to send data, then call sending helper functions.
     * @param {object} data - Data object containing _at object.
     * @param {function} cb - Callback function.
     */
    var send = function (data, cb) {
        if (getPointType() === points.Touchpoint) {
            doSend(data, touchpointCollectorURL, cb);
        }

        if (getPointType() === points.Sharepoint) {
            doSend(data, sharepointCollectorURL, cb);
        }

        // var resp = {};
        // resp.touchpoint = doSend(data, touchpointCollectorURL, cb);
        // resp.sharepoint = doSend(data, sharepointCollectorURL, cb);
        // return resp;
    };

    // var sendTouchpoint = function (name, data, cb) {
    //     var d = data;
    //     d._at.touchpoint = name;
    //     send(d, touchpointCollectorURL, cb);
    // };

    // var sendSharepoint = function (name, data, cb) {
    //     var d = data;
    //     d._at.sharepoint = name;
    //     send(d, sharepointCollectorURL, cb);
    // };

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
     * Initialisation code
     */
    var init = function () {
        // if (window.advocate_things_data) {
        //     send(window.advocate_things_data);
        // }
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
        addEventListener: addEventListener
    };
})();
