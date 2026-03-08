# PollApp

A simple REST-based poll application built with **Node.js** and **Express**, using **ESM modules only**.

---

##  Features

Users can:

- Create an account
- Log in and log out
- Create polls
- List polls
- Delete their own account

---

##  Tech Stack

- Node.js (ESM only, no CommonJS)
- Express
- JSON file storage (custom `jsonStore`)
- REST-style API
- OpenAPI 3 specification

---

##  Project Structure

```text
server/
├── src/
│   ├── app.mjs              # Express configuration
│   ├── server.mjs           # Server entry point
│   ├── routes/              # Route handlers (no business logic)
│   ├── services/            # Business logic layer
│   ├── storage/             # JSON storage layer
│   ├── auth/                # Session handling
│   ├── middleware/          # errorHandler, notFound, requireAuth
│   ├── domain/              # AppError subclasses
│   └── config/              # Path configuration
│
├── data/                    # JSON data files
├── public/                  # Frontend files
├── docs/
│   └── openapi.yaml         # OpenAPI 3 documentation

How to Run Locally

Clone the repository and run:

cd server
npm install
npm start

The server runs at:

http://localhost:3000

Health Check
GET http://localhost:3000/health

API Base URL
http://localhost:3000/api/v1

Live URL: https://pollapp-1.onrender.com

API Documentation

The API is documented using OpenAPI 3.

OpenAPI file:

server/docs/openapi.yaml

Architecture

This project follows a clear separation of concerns:

ESM-only Backend

Uses ES modules (import / export)

No CommonJS (require)

Layered Structure

Routes
→ HTTP layer only (no domain/business logic)

Services
→ Business logic and validation

Storage
→ JSON-based persistence layer

Middleware
→ Authentication and centralized error handling

Domain
→ Custom error classes (e.g., AppError subclasses)


## Additional Features (Assignment Implementation)

The application was extended with the following features:

### Internationalization (I18n)

The frontend supports **English and Norwegian**.

- Language is detected automatically using `navigator.language`
- Translation files are located in:
  - `public/i18n/en.mjs`
  - `public/i18n/no.mjs`
- UI labels and validation messages change based on the browser language
- Server errors also respect the `Accept-Language` header

---

### Progressive Web App (PWA)

The application can be installed as a PWA.

Implemented using:

- `manifest.webmanifest`
- `service-worker.js`
- application icons

---

### Service Worker Caching

A service worker caches important files such as:

- `index.html`
- `app.css`
- `app.mjs`
- `manifest.webmanifest`
- icons

This improves loading performance and allows the application to function without network access.

---

### Offline Mode

If the network is unavailable:

- cached files are served
- an offline fallback page (`offline.html`) is displayed

---

### Accessibility

Accessibility was tested using **Lighthouse**.

Results:

- Accessibility: **93**
- Best Practices: **100**
- SEO: **90**

This meets the assignment requirement of **minimum 90 accessibility score**.