# PWA, i18n and Accessibility

## Overview

The application includes support for Progressive Web App (PWA), internationalization (i18n), and accessibility improvements.

These features improve usability, performance, and overall user experience.

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
- remain usable offline for basic functionality

---

## Internationalization (i18n)

The application supports multiple languages:

- English
- Norwegian

Translations are handled in the `i18n` folder on the client.

The language is selected automatically based on the browser settings (e.g. `navigator.language`).

The UI text is updated dynamically depending on the selected language.

The server uses the `Accept-Language` header to return translated error messages.  
This ensures that both client-side and server-side error messages are localized based on the browser’s language settings.

---

## Accessibility

Accessibility improvements have been implemented to improve usability for a wider range of users.

This includes:
- using semantic HTML where possible
- providing clear and readable UI structure
- ensuring elements can be used without complex interactions

The application has been tested with Lighthouse and achieves an accessibility score of 100.

---

## Design Choices

The goal was to keep these features simple and practical.

For PWA:
- only essential assets are cached
- no complex offline synchronization is implemented

For i18n:
- a lightweight custom solution is used instead of a full library

For accessibility:
- focus was placed on usability and clarity rather than advanced ARIA usage

---

## Challenges

One challenge was ensuring that cached files were properly updated when the application changed.

Another challenge was keeping translations consistent across both client-side and server-side logic.

---

## Conclusion

The application includes support for:

- offline usage through PWA
- multiple languages with dynamic localization
- improved accessibility with a high Lighthouse score

These features improve the overall user experience while keeping the implementation simple and maintainable.