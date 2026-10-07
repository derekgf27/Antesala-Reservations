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

- Require a **verified Google account** whose email is on the staff allowlist
- Allowlist emails (must match `ALLOWED_STAFF_EMAILS` in `firebase-config.js`):
  - `kaleferr@gmail.com`
  - `derekgf27@gmail.com`
- Validate that creates/updates include `id` and `eventDate`
- Prevent changing a reservation's `id` on update
- Allow shared `menuConfig` read/write only for allowlisted staff
- Block access to any other collections

**Important:** After publishing, only the listed staff emails can read or write data. Add new staff in **both** `firestore.rules` and `firebase-config.js`, then republish rules.

After publishing, sign in with a staff Google account and test creating, editing, and deleting a reservation to confirm sync still works.
