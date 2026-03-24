# PWA, i18n and Accessibility

## Overview

The application includes support for Progressive Web App (PWA), basic internationalization (i18n), and accessibility improvements.

These features improve usability and overall user experience.

---

## Progressive Web App (PWA)

The frontend is implemented as a PWA.

This includes:
- a manifest file
- a service worker
- offline support

The service worker caches important resources such as:
- HTML
- JavaScript
- CSS
- icons

A cache-first strategy is used for static files, while navigation requests use a network-first approach.

This allows the application to:
- load faster after the first visit
- work offline for basic functionality

---

## Internationalization (i18n)

The application supports multiple languages:

- English
- Norwegian

Translations are handled in the `i18n` folder on the client.

The language is selected based on the browser settings, for example through `navigator.language`.

The UI text is updated dynamically depending on the selected language.

The server can also use the `Accept-Language` header to return translated messages.

---

## Accessibility

Basic accessibility improvements have been implemented.

This includes:
- using semantic HTML where possible
- keeping the UI simple and readable
- ensuring elements are usable without complex interactions

The application has been tested with Lighthouse to check accessibility and performance.

---

## Design Choices

The goal was to keep these features simple and practical.

For PWA:
- only essential assets are cached
- no complex offline sync is implemented

For i18n:
- a lightweight approach is used instead of a full library

For accessibility:
- focus was on usability rather than advanced ARIA features

---

## Challenges

One challenge was making sure cached files were updated correctly when the application changed.

Another challenge was keeping translations consistent across the UI.

---

## Conclusion

The application includes basic support for:

- offline usage through PWA
- multiple languages
- improved accessibility

These features improve the overall user experience without adding too much complexity.