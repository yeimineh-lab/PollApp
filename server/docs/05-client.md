# Client

## Overview

The client is built with plain JavaScript modules and runs in the browser.

All frontend code is located in the `public` folder and is served by the server.

The client communicates with the backend through the REST API.

---

## Structure

The client is split into modules:

- `app.mjs` -> main logic and UI updates
- `data/api.mjs` -> handles API requests
- `data/userStore.mjs` -> stores login state and token
- `ui/` -> UI components
- `i18n/` -> translations

This keeps the code easier to follow without introducing a frontend framework.

---

## API Communication

All API requests go through `api.mjs`.

The client uses relative URLs such as:

- `/api/v1/polls`
- `/api/v1/polls/:id/vote`

If the user is logged in, the token is sent in requests using:

Authorization: Bearer <token>

---

## Authentication and Browser Storage

Authentication state is handled in `userStore.mjs`.

The client stores the login token in `localStorage` so the user can remain logged in after page reload.

The client also stores a `guestId` in `localStorage`. This is used to identify guest-related actions in the current browser, such as voting or interacting with polls.

Because of this, guest behavior is tied to the browser and not to an account.

---

## State Handling

User state includes:

- current user
- authentication token
- loading state
- error state

Poll data is fetched from the API when needed instead of being stored in a persistent in-memory cache.

---

## UI Behavior

The main UI logic is handled in `app.mjs`.

The UI changes based on:

- login state
- poll visibility
- ownership
- user actions such as create, vote, and delete

Examples:

- guests only see public polls
- logged-in users can also access community polls
- delete buttons are only shown for the owner
- guests cannot vote on community polls

---

## Design Choices

The client is implemented without a frontend framework.

This keeps the project simple and makes it easier to show how the frontend connects directly to the REST API.

Another design choice was to keep most UI logic in `app.mjs`, while separating API logic, user state, and UI components into different modules.

---

## Challenges

One challenge was keeping the UI updated after actions like:

- creating polls
- voting
- deleting polls
- logging in and out

This was handled by reloading data and updating the UI after each action.

Another challenge was handling both guest state and authenticated state in a consistent way.

---

## Conclusion

The client is simple, but structured.

It:

- communicates with the backend API
- supports both guests and registered users
- uses browser storage for authentication and guest behavior
- updates dynamically based on application state