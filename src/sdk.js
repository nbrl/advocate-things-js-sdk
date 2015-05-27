;(function(context) {

    var AT = {};
    var scriptId = 'advocate-things-script';

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


    /**
     * Public function definitions
     */



    context.AT = AT;

})(this);
