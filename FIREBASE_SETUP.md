# Firebase Setup Guide - Cross-Device Sync

This guide will help you set up Firebase Firestore to sync your reservations across all your devices (phone, computer, etc.).

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard:
   - Enter a project name (e.g., "Antesala Reservations")
   - Google Analytics is optional (you can skip it)
   - Click "Create project"

## Step 2: Enable Firestore Database

1. In your Firebase project, click on "Firestore Database" in the left sidebar
2. Click "Create database"
3. Select "Start in test mode" (for now - you can add security rules later)
4. Choose a location closest to you
5. Click "Enable"

## Step 3: Get Your Firebase Configuration

1. In Firebase Console, click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the `</>` (web) icon to add a web app
5. Register your app with a nickname (e.g., "Antesala Web App")
6. Copy the `firebaseConfig` object that appears

## Step 4: Configure Your App

1. Open `firebase-config.js` in your project
2. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

3. Set `FIREBASE_ENABLED` to `true`:

```javascript
const FIREBASE_ENABLED = true;
```

## Step 5: Set Up Firestore Security Rules (Important!)

**⚠️ URGENT:** Your Firestore database is currently in Test Mode and will expire in 30 days. You must deploy security rules before then!

### Option 1: Deploy via Firebase Console (Recommended - Easiest)

1. Open the `firestore.rules` file in this project
2. Copy all the contents
3. Go to [Firebase Console](https://console.firebase.google.com/)
4. Select your project: **antesalareservations**
5. Click on "Firestore Database" in the left sidebar
6. Click on the "Rules" tab
7. Replace the existing rules with the contents from `firestore.rules`
8. Click "Publish"

### Option 2: Deploy via Firebase CLI

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize (if not already): `firebase init firestore`
4. Deploy: `firebase deploy --only firestore:rules`

### What These Rules Do

The security rules in `firestore.rules`:
- ✅ Allow read access to all reservations (for syncing across devices)
- ✅ Allow create/update with validation (ensures data structure is correct)
- ✅ Prevent ID changes during updates (data integrity)
- ✅ Allow deletion of reservations
- ✅ Block access to any other collections
- ⚠️ **Note:** These rules allow public access. For enhanced security, consider adding authentication later.

## Step 6: Test the Setup

1. Open your app in a browser
2. Open the browser console (F12)
3. You should see: "Firebase initialized successfully"
4. Create a test reservation
5. Open the app on another device - the reservation should appear automatically!

## How It Works

- **When Firebase is enabled:** All reservations are stored in Firestore and sync in real-time across all devices
- **When Firebase is disabled:** The app uses localStorage (device-specific storage)
- **Real-time sync:** Changes on one device automatically appear on all other devices within seconds

## Troubleshooting

### "Firebase not enabled" message
- Make sure `FIREBASE_ENABLED = true` in `firebase-config.js`
- Check that all config values are correct

### "Firebase SDK not loaded" message
- Check your internet connection
- Make sure the Firebase CDN scripts are loading (check browser console)

### Reservations not syncing
- Check browser console for errors
- Verify Firestore rules allow read/write
- Make sure both devices have Firebase enabled and configured

### Data Migration

If you have existing reservations in localStorage and want to migrate them to Firebase:

1. Make sure Firebase is properly configured
2. The app will automatically save existing localStorage data to Firestore when you make any change
3. Or you can manually trigger a save by editing and saving any reservation

## Security Best Practices

For production use, consider:

1. **Add Authentication:** Require users to sign in
2. **Update Security Rules:** Only allow authenticated users to read/write
3. **Enable App Check:** Protect your app from abuse

Example secure rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reservations/{reservationId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your Firebase configuration
3. Check Firestore rules in Firebase Console
4. Ensure both devices are connected to the internet

