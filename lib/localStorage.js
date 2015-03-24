/**
 * Simple interface for localStorage to match cookies.
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

this.lclStorage = lclStorage;
