# PollApp

A simple REST-based poll application built with **Node.js** and **Express** using **ESM modules**.

---

## ✨ Features

Users can:

- Create an account
- Log in and log out
- Create polls
- List polls
- Delete their own account

---

## 🛠 Tech Stack

- Node.js (ESM only)
- Express
- JSON file storage (custom `jsonStore`)
- REST-style API
- OpenAPI 3 specification

---

## 📁 Project Structure

```text
server/
├── src/
│   ├── app.mjs              # Express configuration
│   ├── server.mjs           # Server entry point
│   ├── routes/              # Route handlers (no business logic)
│   ├── services/            # Business logic
│   ├── storage/             # JSON storage layer
│   ├── auth/                # Session handling
│   ├── middleware/          # errorHandler, notFound, requireAuth
│   ├── domain/              # AppError subclasses
│   └── config/              # Path configuration
│
├── data/                    # JSON data files
├── public/                  # Frontend files
├── docs/                    # Documentation
│   └── openapi.yaml

---

## 🚀 How to Run Locally

```bash
cd server
npm install
npm start

Server runs at:

http://localhost:3000
🩺 Health Check
http://localhost:3000/health
🔗 API Base
http://localhost:3000/api/v1

The API is documented using OpenAPI 3.

OpenAPI file:

server/docs/openapi.yaml
🏗 Architecture

ESM-only backend (no CommonJS)

Clear separation of concerns

Layers

Routes → HTTP layer only

Services → Business logic

Storage → JSON persistence

Middleware → Error & auth handling

Domain → Custom error classes