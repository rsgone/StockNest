# StockNest

A household grocery/inventory tracker for two: log what's in the kitchen,
flag anything running low in red, and check the shopping list before your
next grocery trip. Both of you can update quantities from anywhere (not just
home wifi) because data lives in Firebase, not on one device.

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 19 |
| Build Tool | Vite 8 |
| Routing | React Router v7 |
| Backend / Database | Firebase Firestore (real-time) |
| Authentication | Firebase Anonymous Auth |
| Hosting | Firebase Hosting |
| Mobile (Android) | Capacitor 8 |
| Styling | Plain CSS (custom design system) |
| Linting | oxlint |

## Project Details

- **Languages:** JavaScript (JSX), CSS
- **Supported languages (UI):** English, हिंदी, తెలుగు, ગુજરાતી
- **Platforms:** Web (PWA-ready) · Android (via Capacitor)
- **Auth model:** Anonymous Firebase Auth — no accounts or passwords; a shared household code is the only secret
- **Data model:**
  ```
  households/{code}
    ├── members: { [uid]: { name, role, addedAt } }
    ├── items/{itemId}   ← quantity, unit, minThreshold, iconKey, updatedBy …
    └── history/{entryId} ← changeType, oldQty, newQty, updatedBy, updatedAt …
  ```
- **Units supported:** kg · g · L · ml · pcs
- **Icons:** 32 emoji icons across Food, Beverages, and Household categories
- **Key screens:** Home · Add Item · Item Detail · Shopping List · History · Settings · Household management

## How it works

- The **first person** to open the app enters their name and taps **Create
  New Household**, which generates a short code (e.g. `AB3D-9FKX`).
- The **second person** (your wife) opens the app on her own device, enters
  her name, and taps **Join with a Code**, using that code.
- From then on, both devices read/write the same Firestore data in
  real time — no accounts or passwords, just the household code.
- Each item stores its own unit (kg/g for weight, L/ml for volume, pcs for
  count), a minimum threshold, and turns red across the app once quantity
  drops to or below that threshold.
- The Settings screen shows the household code again any time you need to
  reshare it (e.g. new phone), and lets you rename yourself or leave/switch
  households.

---

## 1. Create a Firebase project (one-time, ~5 min)

1. Go to the [Firebase console](https://console.firebase.google.com/) and click **Add project**. Name it anything (e.g. `stocknest`).
2. Once created, click the **web icon (`</>`)** to register a web app. Give it a nickname, skip Hosting for now.
3. Firebase will show a `firebaseConfig` object with keys like `apiKey`, `authDomain`, etc. Keep this tab open.
4. In the left sidebar go to **Build → Authentication → Get started**. Under **Sign-in method**, enable **Anonymous**.
5. In the left sidebar go to **Build → Firestore Database → Create database**. Choose a region close to you and start in **production mode**.

## 2. Configure this app

Copy `.env.example` to `.env` and fill in the values from the `firebaseConfig` object in step 1.3:

```
cp .env.example .env
```

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## 3. Deploy the Firestore security rules

These rules make sure only people who know your household code can read/write your data.

```
npx firebase-tools login
npx firebase-tools use --add   # pick your project, alias it "default"
npx firebase-tools deploy --only firestore:rules
```

## 4. Run it locally

```
npm install
npm run dev
```

Open the printed `localhost` URL. This only works on your own machine/wifi.

## 5. Make it reachable from outside your home wifi

Firebase Hosting gives you a free public URL backed by the same Firestore
data, so both of you can open it from anywhere:

```
npm run build
npx firebase-tools deploy --only hosting
```

This prints a URL like `https://<your-project-id>.web.app` — bookmark that on
both phones. Re-run these two commands any time you want to publish a change.
