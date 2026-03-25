# Client

## Overview

The client is built using plain JavaScript modules and runs directly in the browser.

All frontend code is located in the `server/public` folder and is served by the backend.

The client communicates with the backend through a REST API.

---

## Structure

The client is divided into smaller modules:

- `app.mjs` -> handles most of the UI logic and app flow  
- `data/api.mjs` -> responsible for API calls  
- `data/userStore.mjs` -> keeps track of login state and token  
- `ui/` -> contains UI-related code  
- `i18n/` -> handles translations  

This structure makes the code easier to follow without using a frontend framework.

---

## API Communication

All requests to the backend go through `api.mjs`.

The client uses relative paths like:

- `/api/v1/polls`
- `/api/v1/polls/:id/vote`

If a user is logged in, the request includes a token:

Authorization: Bearer <token>

---

## Authentication and Browser Storage

Authentication is handled in `userStore.mjs`.

The login token is stored in `localStorage` so the user stays logged in after refreshing the page.

A `guestId` is also stored in `localStorage`. This is used to identify guest users when they:

- create polls  
- vote  
- delete polls they own  

The client also stores values like `voted_poll_<id>` in `localStorage` to keep track of whether a guest has already voted.

Because of this, guest behavior is tied to the browser and not to a user account.

---

## State Handling

The client keeps track of:

- current user  
- authentication token  
- status (`idle`, `loading`, `error`)  
- error state  

Polls are fetched from the API when needed, but they are also stored in a short-lived in-memory cache.  
This cache only lasts for a limited time and helps avoid unnecessary requests.

---

## UI Behavior

Most of the UI logic is handled in `app.mjs`.

The UI changes depending on:

- whether the user is logged in  
- which polls are visible  
- who owns a poll  
- actions like creating, voting, or deleting  

Examples:

- guests only see public polls  
- logged-in users can also see community polls  
- delete buttons are only shown to the owner  
- guests cannot vote on community polls  

---

## Design Choices

The client is built without a frontend framework.

This was done to keep things simple and to make it clearer how the frontend interacts with the backend API.

Most of the UI logic is placed in `app.mjs`, while API calls and user state are handled in separate modules.

---

## Challenges

One challenge was keeping the UI in sync after actions like:

- creating polls  
- voting  
- deleting polls  
- logging in and out  

This was solved by re-fetching data and updating the UI after each action.

Another challenge was handling both guest users and logged-in users in a consistent way.

---

## Conclusion

The client is fairly simple, but still structured.

It:

- communicates with the backend API  
- supports both guests and registered users  
- uses browser storage for authentication and guest handling  
- updates the UI based on the current state  