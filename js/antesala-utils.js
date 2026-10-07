/**
 * Shared HTML/text helpers for Antesala Reservaciones.
 * Loaded before script.js (no bundler).
 */
(function (global) {
    'use strict';

    function escapeHtml(str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function staffEmail() {
        const user = global.firebaseAuthUser || global.firebaseAuth?.currentUser;
        return String(user?.email || '').trim().toLowerCase() || 'unknown';
    }

    global.AntesalaUtils = {
        escapeHtml,
        staffEmail
    };
})(window);
