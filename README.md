
# Maid Attendance Tracker (PWA)

Offline-first React app to track daily attendance and wages for household staff. Works great on phones. Data is stored in the browser's **localStorage**.

## Features
- Add staff with **name** and **daily wage (₹)**
- Mark **present/absent** per day, with **Mark all present** and **Clear all**
- **Report & Wages**: pick a date range per person, see days present and total wages
- **English/Hindi** toggle
- **PWA**: install to home screen, works offline (service worker + manifest)

## Tech
- React + Vite
- Service Worker + Web App Manifest (PWA)

## Local Dev
```bash
npm install
npm run dev
```
Open the shown URL on your device. Add to home screen to install.

## Build
```bash
npm run build
```

## Deploy to Vercel
1. Create a public GitHub repo named **maid-attendance** under your account.
2. Push this project to GitHub (commands below).
3. On Vercel, **Add New Project → Import Git Repository** and pick this repo.
4. Build settings (auto-detected):
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Open the deployed URL on your phone → **Add to Home Screen**.

## Git Commands (first push)
```bash
git init
git add .
git commit -m "Initial commit: Maid Attendance PWA"
git branch -M main
git remote add origin https://github.com/priyanshu2304/maid-attendance.git
git push -u origin main
```

## Notes
- Data is per-device. If you want to sync data across devices later, we can add optional export/import or a small backend.
- If you change icons or theme color, update `manifest.webmanifest` and `/icons`.
