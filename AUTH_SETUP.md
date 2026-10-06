# Google Sign-In Setup (Antesala)

Staff sign in once with Google per device. Firebase keeps them signed in — no password to remember for this app.

## 1. Enable Google Sign-In

1. Open [Firebase Console](https://console.firebase.google.com/) → project **antesalareservations**
2. **Authentication** → **Get started** (if first time)
3. **Sign-in method** → **Google** → Enable → set a support email → Save

## 2. Authorize your website domain

1. **Authentication** → **Settings** → **Authorized domains**
2. Add every domain where the app is hosted, for example:
   - `localhost` (already there for local testing)
   - your GitHub Pages / Vercel / custom domain

## 3. Allow only staff emails (recommended)

1. Open `firebase-config.js`
2. Add staff Gmail addresses to `ALLOWED_STAFF_EMAILS`:

```javascript
const ALLOWED_STAFF_EMAILS = [
    'tu-correo@gmail.com',
    'otro.staff@gmail.com',
];
```

If this list is empty, any Google account that signs in can use the app (not recommended once live).

## 4. Deploy Firestore rules (required)

New rules require a signed-in user. Deploy them or paste into Firebase Console → Firestore → Rules:

- File in repo: `firestore.rules`
- Or Console → publish the same content

Until rules are deployed, old open rules may still apply. After deploy, unsigned visitors cannot read/write data.

## 5. Test

1. Hard-refresh the app
2. Click **Continuar con Google**
3. Pick a staff account
4. You should land on the panel
5. Close the tab, reopen — you should stay signed in
6. Use **Cerrar sesión** in the sidebar to sign out

## Troubleshooting

| Issue | Fix |
|--------|-----|
| `auth/unauthorized-domain` | Add the site domain under Authorized domains |
| `auth/operation-not-allowed` | Enable Google under Sign-in method |
| Popup blocked | Allow popups, or the app will try redirect sign-in |
| “Correo no autorizado” | Add that Gmail to `ALLOWED_STAFF_EMAILS` |
| Permission denied in console | Deploy the new `firestore.rules` |
