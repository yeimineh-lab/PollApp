## Log 17.03.2026

- Cleaned up project structure:
  - Removed unused `package.json` and `package-lock.json` in root
  - Kept only `server/` as the main app

- Fixed favicon:
  - Moved `favicon.ico` to correct location (`public/`)
  - Fixed path so `/favicon.ico` loads correctly
  - Resolved 404 error in browser

- Fixed manifest and icons:
  - Updated paths to `/icons/icon-192.png` and `/icons/icon-512.png`
  - Ensured PWA icons load correctly

- Service worker:
  - Improved caching strategy
  - Verified offline fallback (`offline.html`) works

- UI and frontend:
  - Updated HTML and `app.mjs`
  - Adjusted CSS without changing structure

- README:
  - Cleaned and improved structure
  - Made it more consistent and professional
  - Updated Lighthouse results

- OpenAPI:
  - Cleaned up and improved specification
  - Better descriptions and consistency

- General:
  - Fixed issues related to asset paths
  - Tested that the app runs locally without errors