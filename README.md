## PollApp

A simple REST-based poll application built with **Node.js** and **Express**, using **ES Modules (ESM only)**.

---

## Features

Users can:

- Create an account  
- Log in and log out  
- Create polls  
- View polls  
- Vote on polls  
- Delete their own account  

---

## Tech Stack

- Node.js (ESM only — no CommonJS)
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
│   │   ├── auth/
│   │   ├── middleware/
│   │   ├── domain/
│   │   └── config/
│   │
│   ├── public/
│   ├── data/
│   ├── docs/
│   │   └── openapi.yaml
│   │
│   ├── package.json
│   └── package-lock.json
│
├── README.md
└── .gitignore
How to Run Locally
cd server
npm install
npm start

Server runs at:

http://localhost:3000
API

Base URL:

http://localhost:3000/api/v1

Health check:

GET /health
Live Demo
https://pollapp-1.onrender.com
API Documentation

OpenAPI specification:

server/docs/openapi.yaml
Architecture

The application follows a layered architecture:

Routes

Handles HTTP requests/responses

No business logic

Services

Core business logic

Validation and rules

Storage

Data persistence (PostgreSQL / JSON)

Middleware

Authentication

Error handling

Domain

Custom error classes (AppError, etc.)

Progressive Web App (PWA)

The frontend is implemented as a PWA.

Features:

Installable application

Offline support

Fast loading with caching

Service Worker

The service worker caches:

HTML

CSS

JavaScript

Manifest

Icons

Strategy:

Cache-first for static assets

Network-first for navigation

Offline fallback page

Offline Mode

When offline:

Cached files are served

offline.html is shown for navigation requests

Internationalization (I18n)

Supports:

English

Norwegian

Features:

Auto-detects browser language

Dynamic UI translations

Server respects Accept-Language

Accessibility & Quality

Tested using Lighthouse:

Performance: 100

Accessibility: 100

Best Practices: 100

SEO: 90