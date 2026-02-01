# Simple Poll App

## Project Description
Simple Poll App is a small full-stack application for creating polls, collecting votes, and viewing results.

The project is intentionally kept simple and focuses on **API design**, **incremental development**, **separation of concerns**, and **responsible user handling**, rather than building a full production system.

This repository represents an early but functional stage of the application.

---

## Purpose and Goal
The purpose of this project is to demonstrate:

- REST-like API design
- Clear separation between client, API, authentication, and storage
- Incremental development using horizontal slices
- User account handling with explicit consent
- Data minimization and privacy-aware design
- API documentation and testing
- Proper use of Git and project structure

The goal is to show **how the system is designed, structured, and reasoned about**, not to build a complete commercial product.

---

## Feature Map

### Poll Features
- Create a poll with a question and multiple options
- List available polls
- Vote on a poll
- View poll results

Polls are persisted using JSON storage (no database).

---

## User Accounts (Assignment Focus)

### Data Minimization (GDPR)
The application stores the minimum required to support user accounts:

- `id` (UUID)
- `username` (public handle)
- `passwordHash` (bcrypt hash, never plain text)
- `createdAt`
- Consent records:
  - Terms of Service acceptedAt + version
  - Privacy Policy acceptedAt + version

The application **does not** collect:
- Real name
- Email address
- Location data
- Analytics identifiers

---

### Account Endpoints

- **POST `/api/v1/users`**  
  Creates a user account.  
  Requires explicit consent: `tosAccepted: true`.

- **POST `/api/v1/auth/login`**  
  Authenticates a user and returns a bearer token.

- **GET `/api/v1/auth/me`**  
  Returns the currently authenticated user.

- **DELETE `/api/v1/users/me`**  
  Deletes the user’s personal data and withdraws consent.

---

### Personal Data vs Public Contributions
When a user deletes their account:

- All **personal account data** is removed from storage
- **Public contributions** (polls) remain available
- Poll ownership is anonymized:
  - `ownerId` is set to `null`
  - `ownerUsername` is replaced with `"deleted-user"`

This preserves application integrity while respecting user privacy.

---

## Consent Handling
- Users must actively accept the Terms of Service and Privacy Policy to create an account
- Consent timestamps and document versions are stored
- Users can withdraw consent at any time by deleting their account
- Deleting an account invalidates the authentication token immediately

---

## Architecture Notes
The project follows separation of concerns:

- **Routes** define HTTP endpoints
- **Auth middleware** handles authentication and authorization
- **Storage layer** abstracts persistence (JSON files)
- **Client** is a simple HTML interface consuming the API

Authentication is token-based and intentionally simple to support learning goals.

---

## Development Approach – Horizontal Slices
The project was developed using a horizontal slice approach, where each step results in a runnable system.

Initial poll endpoints were implemented as stubs and later extended with persistence and user ownership as part of the user assignment.

---

## API Documentation
The API is documented using **OpenAPI 3.0**.

The OpenAPI specification describes:
- Available endpoints
- Request and response formats
- Example payloads
- HTTP status codes

---

## API Testing
API requests are tested using **Bruno**.

The Bruno collection includes requests for:
- Poll operations
- User creation
- Authentication
- Account deletion

---

## Project Structure

simple-poll-app/
├── client/
│ └── index.html
├── server/
│ ├── src/
│ │ ├── routes/
│ │ ├── auth/
│ │ ├── storage/
│ │ └── docs/
│ ├── data/
│ └── bruno/
├── TERMS.md
├── PRIVACY.md
├── README.md


---

## How to Run

### Server
```bash
cd server
node src/index.js

Client

Open in browser:

http://localhost:3000/index.html

Legal Documents

Terms of Service: http://localhost:3000/TERMS.md

Privacy Policy: http://localhost:3000/PRIVACY.md

Reflection

This project was developed as part of an assignment focused on user handling, privacy, and API architecture.

Key takeaways:

Explicit consent handling influences both API and client design

Separating personal data from public contributions is critical

Designing deletion flows early prevents architectural issues later

Even simple authentication schemes require careful reasoning

The project provides a solid foundation for future expansion while remaining intentionally minimal and understandable.



