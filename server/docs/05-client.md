# PWA, i18n and Accessibility

## Overview

The application includes support for Progressive Web App (PWA), internationalization (i18n), and basic accessibility improvements.

These features improve usability, performance, and user experience.

---

## Progressive Web App (PWA)

The client is implemented as a PWA.

This includes:
- a manifest file
- a service worker
- support for offline usage

The service worker caches important static resources such as:
- HTML
- JavaScript
- CSS
- icons

A cache-first strategy is used for static assets, while navigation requests use a network-first approach.

API responses are not cached to avoid outdated data.

This allows the application to:
- load faster after the first visit
- still work offline for basic navigation

---

## Internationalization (i18n)

The application supports multiple languages:

- English
- Norwegian

Translations are stored in the `i18n` folder on the client.

The language is selected based on the browser settings (e.g. `navigator.language`).

The UI updates dynamically depending on the selected language.

The server also respects language settings through request headers.

---

## Accessibility

Basic accessibility improvements are implemented.

This includes:
- simple and readable UI
- semantic HTML where possible
- clear interaction patterns

The application has been tested using Lighthouse to evaluate accessibility and performance.

---

## Design Choices

The goal was to keep these features simple and practical.

For PWA:
- only essential files are cached
- no advanced offline sync is implemented

For i18n:
- a lightweight custom solution is used instead of a library

For accessibility:
- focus is on usability rather than advanced ARIA usage

---

## Challenges

One challenge was ensuring cached files are updated when the app changes.

Another challenge was keeping translations consistent across different parts of the UI.

---

## Conclusion

The application includes:

- offline support through PWA
- multi-language support
- basic accessibility improvements

These features improve the user experience without adding unnecessary complexity.