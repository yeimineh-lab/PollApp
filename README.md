# Simple Poll App – User Client

This project is a simple full-stack application with a Node.js backend and a structured client built using Web Components.

The goal of this assignment was to build a client in a structured way that interacts with an existing User API.

---

## Project Structure

```text
simple-poll-app/
│
├── server/
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── config/
│   │   ├── storage/
│   │   ├── app.js
│   │   └── index.js
│   │
│   ├── public/
│   │   ├── index.html
│   │   ├── app.mjs
│   │   ├── app.css
│   │   ├── data/
│   │   │   ├── api.mjs
│   │   │   └── userStore.mjs
│   │   └── ui/
│   │       ├── user-create.mjs
│   │       ├── user-edit.mjs
│   │       └── user-delete.mjs
│   │
│   └── data/
│       ├── users.json
│       └── polls.json
│
└── README.md

Architecture

The client is structured with separation of concerns.

UI Layer

Custom Web Components:

user-create

user-edit

user-delete

Each component only handles DOM and user interaction.

Data Layer

api.mjs contains the only fetch() call used in the client.

All API requests go through: request(path, options)

This ensures:

Only relative URLs are used

Only one fetch gateway exists

Centralized error handling

Logic Layer

userStore.mjs works as a small state manager using the observer pattern (EventTarget).

The UI listens to "change" events and re-renders automatically.

This avoids duplication of data structures and keeps the state in one place.

Requirements Checklist

✔ Only relative URLs used
✔ Only one fetch() in the client
✔ No duplicated data object structures
✔ Separation of UI, Logic, and Data
✔ Custom Web Components for creating, editing and deleting users
✔ Client communicates with API successfully

How to Run
cd server
npm install
npm run dev


Server runs at:

http://localhost:3000

