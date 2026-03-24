# Client

## Overview

The client is built using plain JavaScript modules and runs in the browser.

All frontend code is located in the `public` folder and is served by the server.

The client communicates with the backend through the REST API.

---

## Structure

The client is split into modules:

- `app.mjs` → main logic and UI updates
- `data/api.mjs` → handles all API requests
- `data/userStore.mjs` → stores login state and token
- `ui/` → UI components
- `i18n/` → translations

This keeps the code organized instead of having everything in one file.

---

## API Communication

All API requests go through `api.mjs`.

The client uses relative URLs:

- `/api/v1/polls`
- `/api/v1/polls/:id/vote`

This makes the application work both locally and when deployed.

If the user is logged in, a token is included in requests:

Authorization: Bearer <token>

---

## Authentication Flow

When the app starts, it checks if the user is already logged in.

This is done by sending a request (for example to `/auth/me`) using the stored token.

If the token is valid:
- the user stays logged in

If not:
- the token is cleared and the user is treated as logged out

---

## State Handling

User state is handled in `userStore.mjs`.

It stores:
- the current user
- the authentication token

This is used by the UI to update what is shown.

---

## UI Behavior

The main UI logic is handled in `app.mjs`.

The UI updates based on:
- login state
- available polls
- user actions (create, vote, delete)

Examples:
- guests can create polls and vote
- logged-in users can access additional content
- delete buttons are only shown for the poll owner

---

## Design Choices

The client is implemented without a frontend framework.

This keeps the project simple and makes it easier to understand how the frontend connects to the backend.

Another decision was to centralize all API calls in one file instead of calling `fetch` in multiple places.

---

### Why most logic is kept in app.mjs

Most of the client logic is placed in a single file (`app.mjs`).

This was a conscious decision during development. The application is relatively small, and keeping the logic in one place made it easier to:

- follow the flow of the application
- debug issues
- quickly connect UI actions with API calls

The client is still structured using modules (API layer, user store, UI components), so responsibilities are not fully mixed.

Splitting `app.mjs` further into smaller files (for example separating polls, authentication, and view handling) would be possible, but was not prioritized since the current structure was stable and working correctly.

The focus was on functionality and correctness rather than additional abstraction.

---

## Challenges

One challenge was keeping the UI updated after actions like:
- creating polls
- voting
- deleting polls

This was handled by reloading data and updating the UI after each action.

Another challenge was handling login state correctly across reloads.

---

## Conclusion

The client is simple but structured.

It:
- communicates with the backend API
- supports both guests and logged-in users
- updates dynamically based on state

It fits the scope of the project without unnecessary complexity.