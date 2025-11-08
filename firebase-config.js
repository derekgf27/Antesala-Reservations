// Firebase Configuration
// To enable cloud sync, you need to:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project (or use existing)
// 3. Enable Firestore Database (start in test mode)
// 4. Copy your config from Project Settings > General > Your apps > Firebase SDK snippet
// 5. Replace the values below with your Firebase config
// 6. Set FIREBASE_ENABLED to true

const firebaseConfig = {
    apiKey: "AIzaSyCnZZ9VerU9xWAyZmlyRaKnV6HTg6gt1Uo",
    authDomain: "antesalareservations.firebaseapp.com",
    projectId: "antesalareservations",
    storageBucket: "antesalareservations.firebasestorage.app",
    messagingSenderId: "23401845027",
    appId: "1:23401845027:web:f570b3c9ae14029f543c96"
};

// Set to true once you've configured Firebase above
const FIREBASE_ENABLED = true;

// Initialize Firebase if enabled
let firebaseApp = null;
let firestore = null;

if (FIREBASE_ENABLED && firebaseConfig.apiKey !== 'YOUR_API_KEY' && typeof firebase !== 'undefined') {
    try {
        firebaseApp = firebase.initializeApp(firebaseConfig);
        firestore = firebase.firestore();
        window.FIREBASE_LOADED = true;
        window.firebaseApp = firebaseApp;
        window.firestore = firestore;
        console.log('Firebase initialized successfully');
    } catch (error) {
        console.error('Firebase initialization error:', error);
        window.FIREBASE_LOADED = false;
    }
} else {
    window.FIREBASE_LOADED = false;
    if (!FIREBASE_ENABLED) {
        console.log('Firebase not enabled. Using localStorage for data storage.');
    } else if (typeof firebase === 'undefined') {
        console.log('Firebase SDK not loaded. Using localStorage for data storage.');
    }
}

