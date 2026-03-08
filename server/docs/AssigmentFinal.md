# Assignment Final

In this assignment we added internationalization, PWA functionality, caching, offline support and improved accessibility in the application.

## Internationalization

We implemented support for two languages: **English and Norwegian**.

This was done by creating translation files:
- `en.mjs`
- `no.mjs`

We also created `index.mjs` which exports a `t()` function used to get the correct translation.  
The language is detected automatically using `navigator.language`.

UI text, labels and validation messages now change based on the browser language.  
Server error messages also return the correct language using the `Accept-Language` header.

---

## PWA

The application was made installable as a **Progressive Web App**.

We added:
- `manifest.webmanifest`
- application icons
- `service-worker.js`

The manifest contains the app name, start URL, display mode and icons so the application can be installed from the browser.

---

## Service Worker and Caching

A service worker was implemented to cache important files in the application.

Examples of cached files:
- `index.html`
- `app.css`
- `app.mjs`
- `offline.html`
- `manifest.webmanifest`
- icons

Caching was implemented using the **Cache API** so the application can still load resources even when the network is unavailable.

---

## Offline Mode

Offline support was implemented through the service worker.

If the application cannot reach the network:
- cached files are used
- if navigation fails, the user is shown `offline.html`

This gives a message that the application is currently offline.

---

## Accessibility

The application was tested using **Lighthouse**.

Accessibility score: **93**

We improved accessibility by using:
- semantic HTML
- proper form labels
- readable contrast
- clear validation messages

This meets the requirement of a minimum accessibility score of 90.

---

## Problems and Fixes

During development a few issues occurred.

**Service worker caching issues**

At first some files did not load correctly from the cache.

Solution:
- corrected cache paths
- ensured files were placed in the `public` folder
- restarted the service worker.

---

**Translation function error**

We got the error:


The requested module does not provide an export named 't'


Solution:
- fixed the export in `i18n/index.mjs`
- ensured `t()` was exported correctly.

---

**Manifest icon error**

Chrome reported an error loading icons from the manifest.

Solution:
- fixed the icon paths
- ensured icons were inside `/public/icons`.

---

After these fixes the application supports multiple languages, works as a PWA, supports caching and offline mode, and passes the accessibility requirement.