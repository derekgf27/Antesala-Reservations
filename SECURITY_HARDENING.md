# Security hardening (App Check + API key)

After staff allowlist rules are live, tighten platform abuse protections.

## 1. Firebase App Check (recommended)

App Check reduces abuse of your Firebase project from non-app clients.

1. Firebase Console → **App Check** → register your **Web** app  
2. Provider: **reCAPTCHA v3** → create/get a site key  
3. Paste the site key into `firebase-config.js`:

```javascript
const FIREBASE_APPCHECK_SITE_KEY = 'your-recaptcha-v3-site-key';
```

4. In App Check, enforce for **Cloud Firestore** (and Auth if offered) once tokens work in production  
5. Hard-refresh the app and confirm login + save still work  

The SDK is already loaded (`firebase-app-check-compat.js`). If the site key is empty, App Check stays off.

## 2. Restrict the Browser API key (required)

In [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials** → your Browser key:

### Application restrictions
- **HTTP referrers**
- Add:
  - `https://your-vercel-domain.app/*`
  - `https://your-custom-domain/*`
  - `http://localhost/*` (local testing only)

### API restrictions
Restrict key to at least:
- Identity Toolkit API  
- Token Service API  
- Cloud Firestore API  
- (If using App Check) reCAPTCHA Enterprise / related APIs as Console suggests  

Save, wait a few minutes, hard-refresh, and retest Google Sign-In.

## 3. Keep allowlists in sync

When adding staff:
1. `firebase-config.js` → `ALLOWED_STAFF_EMAILS`  
2. `firestore.rules` → `isStaff()` email list  
3. Publish rules (see `DEPLOY_RULES.md`)  
