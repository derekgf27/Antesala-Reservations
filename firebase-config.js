// Firebase Configuration
// 1. Enable Google Sign-In in Firebase Console → Authentication → Sign-in method
// 2. Add your hosting domain under Authentication → Settings → Authorized domains
// 3. Add staff Gmail addresses to ALLOWED_STAFF_EMAILS below
// 4. Keep the same emails in firestore.rules isStaff() and publish rules

const firebaseConfig = {
    apiKey: "AIzaSyAdTEPaNnvNYeAQxqUXodTWgbIQAWScAHg",
    authDomain: "antesalareservations.firebaseapp.com",
    projectId: "antesalareservations",
    storageBucket: "antesalareservations.firebasestorage.app",
    messagingSenderId: "23401845027",
    appId: "1:23401845027:web:f570b3c9ae14029f543c96",
    measurementId: "G-L9XYZPPB15"
};

const FIREBASE_ENABLED = true;

/**
 * Staff Google accounts allowed to use the app (lowercase).
 * Example: 'antesala.ponce@gmail.com'
 * If empty, ANY Google account that can sign in is allowed (not recommended for production).
 */
const ALLOWED_STAFF_EMAILS = [
    'kaleferr@gmail.com',
    'derekgf27@gmail.com',
];

/**
 * Optional Firebase App Check reCAPTCHA v3 site key.
 * Leave empty until you enable App Check in Firebase Console (see SECURITY_HARDENING.md).
 * Example: '6Lc........................................'
 */
const FIREBASE_APPCHECK_SITE_KEY = '';
window.FIREBASE_APPCHECK_SITE_KEY = FIREBASE_APPCHECK_SITE_KEY;

// Initialize Firebase if enabled
let firebaseApp = null;
let firestore = null;
let firebaseAuth = null;

window.FIREBASE_LOADED = false;
window.FIREBASE_AUTH_READY = false;
window.firebaseAuthUser = null;

function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
}

function isStaffEmailAllowed(email) {
    const normalized = normalizeEmail(email);
    if (!normalized) return false;
    if (!Array.isArray(ALLOWED_STAFF_EMAILS) || ALLOWED_STAFF_EMAILS.length === 0) {
        return true; // open to any signed-in Google user until allowlist is filled
    }
    return ALLOWED_STAFF_EMAILS.map(normalizeEmail).includes(normalized);
}

window.isStaffEmailAllowed = isStaffEmailAllowed;
window.ALLOWED_STAFF_EMAILS = ALLOWED_STAFF_EMAILS;

if (FIREBASE_ENABLED && firebaseConfig.apiKey !== 'YOUR_API_KEY' && typeof firebase !== 'undefined') {
    try {
        firebaseApp = firebase.initializeApp(firebaseConfig);
        firestore = firebase.firestore();
        firebaseAuth = firebase.auth();
        // Stay signed in across browser restarts (default is LOCAL; set explicitly)
        firebaseAuth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch((err) => {
            console.warn('Could not set auth persistence:', err);
        });

        window.FIREBASE_LOADED = true;
        window.firebaseApp = firebaseApp;
        window.firestore = firestore;
        window.firebaseAuth = firebaseAuth;
        if (window.AntesalaAppCheck && typeof window.AntesalaAppCheck.initAppCheck === 'function') {
            window.AntesalaAppCheck.initAppCheck();
        }
        console.info('Firebase initialized successfully');
    } catch (error) {
        console.error('Firebase initialization error:', error);
        window.FIREBASE_LOADED = false;
    }
} else {
    window.FIREBASE_LOADED = false;
}
