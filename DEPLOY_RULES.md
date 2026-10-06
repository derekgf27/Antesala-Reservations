# Deploy Firestore Security Rules

Follow these steps to deploy the security rules:

## Quick Steps (Firebase Console)

1. **Open Firebase Console**
   - Go to: https://console.firebase.google.com/
   - Select project: **antesalareservations**

2. **Navigate to Firestore Rules**
   - Click "Firestore Database" in left sidebar
   - Click the "Rules" tab at the top

3. **Copy Rules from File**
   - Open `firestore.rules` file in this project
   - Copy ALL the contents (Ctrl+A, Ctrl+C)

4. **Paste and Publish**
   - In Firebase Console, select all existing rules (Ctrl+A)
   - Paste the new rules (Ctrl+V)
   - Click the **"Publish"** button

## What These Rules Do

- Allow the app to read, create, update, and delete reservations
- Validate that creates/updates include `id` and `eventDate`
- Prevent changing a reservation's `id` on update
- Allow shared `menuConfig` read/write
- Block access to any other collections

**Note:** These rules allow public access (no authentication). That matches this single-staff app setup.

After publishing, test creating, editing, and deleting a reservation to confirm sync still works.
