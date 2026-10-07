/**
 * Optional Firebase App Check (reCAPTCHA v3).
 * Set FIREBASE_APPCHECK_SITE_KEY in firebase-config.js after enabling App Check in Console.
 */
(function (global) {
    'use strict';

    function initAppCheck() {
        const siteKey = global.FIREBASE_APPCHECK_SITE_KEY;
        if (!siteKey || typeof siteKey !== 'string' || !siteKey.trim()) {
            return false;
        }
        if (typeof firebase === 'undefined' || !firebase.appCheck) {
            console.warn('App Check SDK not loaded');
            return false;
        }
        if (!global.FIREBASE_LOADED || !global.firebaseApp) {
            return false;
        }
        try {
            // self-monitor / debug tokens: second arg true uses debug provider in some versions;
            // compat activate(siteKey, isTokenAutoRefreshEnabled)
            firebase.appCheck().activate(siteKey.trim(), true);
            console.info('Firebase App Check activated');
            return true;
        } catch (err) {
            console.warn('App Check activation failed:', err);
            return false;
        }
    }

    global.AntesalaAppCheck = { initAppCheck };
})(window);
