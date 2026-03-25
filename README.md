## PollApp

A REST-based poll application built with Node.js, Express, and PostgreSQL using ES Modules (ESM only).

---

## Features

The application supports both guest users and registered users.

### Guests can:
- Create polls
- Vote on polls
- Delete their own polls

### Registered users can:
- Create an account
- Log in and log out
- Create polls
- View both public and community polls
- Vote on polls
- Delete their own polls

### Poll types:
- Public polls → visible to everyone
- Community polls → visible only to logged-in users

---

## Tech Stack

- Node.js (ES Modules only)
- Express
- PostgreSQL (pg)
- REST API
- OpenAPI 3

---

## Project Structure

```text
PollApp/
├── server/
│   ├── src/
│   │   ├── app.mjs
│   │   ├── server.mjs
│   │   ├── routes/
│   │   ├── services/
│   │   ├── storage/
│   │   ├── middleware/
│   │   ├── config/
│   │   └── utils/
│   │
│   ├── public/
│   │   ├── data/
│   │   ├── ui/
│   │   ├── i18n/
│   │   └── icons/
│   │
│   ├── docs/
│   │   └── openapi.yaml
│   │
│   ├── scripts/
│   ├── package.json
│   └── package-lock.json
│
├── README.md
└── .gitignore 



## How to Run Locally

cd server
npm install
npm run dev

Server runs at:
http://localhost:3000

## API
Base URL:
http://localhost:3000/api/v1

Example endpoints
GET /polls
POST /polls
DELETE /polls/:id
POST /polls/:id/vote

## Notes

The application requires PostgreSQL and a valid `DATABASE_URL` in the server environment.

Guest functionality depends on browser storage. The app stores a guest identifier in `localStorage`, while logged-in users store their session token there.

## API Documentation
OpenAPI specification:
server/docs/openapi.yaml

## Architecture
The application follows a layered structure:

Routes
Handles HTTP requests and responses.

Services
Contains business logic and validation.

Storage
Handles database interaction (PostgreSQL).

Middleware
Handles authentication, validation, and error handling.

Progressive Web App (PWA)
The frontend is implemented as a PWA.

Features:
Installable
Offline support
Caching via Service Worker
Internationalization (i18n)

Supports:
English
Norwegian

Features:
Detects browser language
Translates UI and error messages

Accessibility
Tested with Lighthouse:

Accessibility: 90+
Performance: 90+