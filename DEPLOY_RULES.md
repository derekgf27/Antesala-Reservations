# 🔒 Deploy Firestore Security Rules - URGENT

Your Firestore database is expiring in **2 days**. Follow these steps to deploy the security rules:

## Quick Steps (Firebase Console - Recommended)

1. **Open Firebase Console**
   - Go to: https://console.firebase.google.com/
   - Select project: **antesalareservations**

2. **Navigate to Firestore Rules**
   - Click "Firestore Database" in left sidebar
   - Click the "Rules" tab at the top

3. **Copy Rules from File**
   - Open `firestore.rules` file in this project
   - Copy ALL the contents (Ctrl+A, Ctrl+C)

4. **Paste and Deploy**
   - In Firebase Console, select all existing rules (Ctrl+A)
   - Paste the new rules (Ctrl+V)
   - Click the **"Publish"** button

5. **Verify**
   - You should see a success message
   - The rules should now show the new validation rules

## What These Rules Do

✅ **Allow your app to function normally**
- Read all reservations
- Create new reservations
- Update existing reservations  
- Delete reservations

✅ **Protect your database**
- Validates data structure (requires `id` and `eventDate`)
- Prevents ID changes during updates
- Blocks access to other collections

⚠️ **Note:** These rules allow public access (no authentication required). This is fine for a single-user app, but if you want to add authentication later for multi-user support, we can update the rules.

## Troubleshooting

**If you get an error when deploying:**
- Make sure you copied the ENTIRE contents of `firestore.rules`
- Check that the rules start with `rules_version = '2';`
- Verify you're in the correct Firebase project

**After deploying, test your app:**
- Create a new reservation
- Edit an existing reservation
- Delete a reservation
- Check that sync works across devices

If everything works, you're all set! 🎉

