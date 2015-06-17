/**
 * Simple interface for localStorage to match cookies.
 */
var sesStorage = {
    hasItem: function (key) {
        return sessionStorage.hasOwnProperty(key);
    },
    getItem: function (key) {
        return sessionStorage.getItem(key);
    },
    setItem: function (key, value) {
        sessionStorage.setItem(key, value);
    },
    removeItem: function (key) {
        sessionStorage.removeItem(key);
    }
};

this.sesStorage = sesStorage;
