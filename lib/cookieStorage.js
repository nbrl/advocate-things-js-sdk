/**
 * Wrapper for cookies so cookies and local storage can use the same interface.
 * `cookie` is defined by github.com/js-coder/cookie.js
 */
var cookieStorage = {
    getItem: function (key) {
        if (!key) {
            return null;
        }
        return cookie.get(key);
    },
    setItem: function (key, value) {
        if (!key) {
            return false;
        }
        return cookie.set(key, value);
    },
    removeItem: function (key) {
        if (!key) {
            return false;
        }
        return cookie.remove(key);
    },
    hasItem: function (key) {
        if (!key) {
            return false;
        }
        return !!cookie.get(key);
    }
};

this.cookieStorage = cookieStorage;
