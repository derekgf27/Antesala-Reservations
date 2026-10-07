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

## 3. Allow only staff emails (required)

Staff access is enforced in **two places** — keep them in sync:

### A. App UI (`firebase-config.js`)

```javascript
const ALLOWED_STAFF_EMAILS = [
    'kaleferr@gmail.com',
    'derekgf27@gmail.com',
];
```

### B. Firestore rules (`firestore.rules`)

```
request.auth.token.email.lower() in [
  'kaleferr@gmail.com',
  'derekgf27@gmail.com'
]
```

The UI blocks unauthorized Google accounts from using the app. The rules block them from reading/writing the database even if they bypass the UI.

When adding a new staff member: update **both** files, push the app, and **re-publish Firestore rules**.

## 4. Deploy Firestore rules (required)

See `DEPLOY_RULES.md`. Until rules are published, older open/less-strict rules may still apply.

## 5. Test

1. Hard-refresh the app
2. Click **Continuar con Google**
3. Pick a staff account
4. You should land on the panel
5. Close the tab, reopen — you should stay signed in
6. Use **Cerrar sesión** in the sidebar to sign out
7. (Optional) Try a non-staff Google account — UI should reject; Firestore should deny if they somehow get a token

## Troubleshooting

| Issue | Fix |
|--------|-----|
| `auth/unauthorized-domain` | Add the site domain under Authorized domains |
| `auth/operation-not-allowed` | Enable Google under Sign-in method |
| Popup blocked | Allow popups, or the app will try redirect sign-in |
| “Correo no autorizado” | Add that Gmail to `ALLOWED_STAFF_EMAILS` **and** `firestore.rules`, then republish rules |
| Permission denied in console | Deploy/publish the latest `firestore.rules` |
