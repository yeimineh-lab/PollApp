# API Design

## Overview

The API is built as a JSON-based HTTP API for polls, voting, users, and authentication.

Base URL:

http://localhost:3000/api/v1

The API is versioned using `/api/v1` so that future versions can be introduced without breaking the current client.

---

## General Design

The API follows a resource-based structure where routes are grouped around:

- polls
- votes
- users
- authentication

The API uses standard HTTP methods:

- `GET` for reading data
- `POST` for creating resources or actions such as login and voting
- `PATCH` for partial updates
- `DELETE` for deletion

Requests and responses use JSON.

---

## Poll Endpoints

### GET /polls

Returns a list of polls.

This endpoint is available to both guests and authenticated users.

Authentication is optional. If a valid token is present, the request can include authenticated user context. If no token is present, the request is handled as a guest request.

This endpoint uses `optionalAuth`.

---

### GET /polls/:id/results

Returns the result for a specific poll.

This endpoint is available to both guests and authenticated users.

It also uses `optionalAuth`.

For guest access, a `guestId` can be included in the query.

---

### POST /polls

Creates a new poll.

This endpoint is available to both guests and authenticated users.

Behavior:
- If the request is authenticated, the poll is connected to the logged-in user
- If not authenticated, the poll can be connected to a guest through `guestId`

This endpoint uses `optionalAuth`.

---

### DELETE /polls/:id

Deletes a poll.

This endpoint is available to both guests and authenticated users.

Behavior:
- A logged-in user can delete their own poll
- A guest can delete a poll they created if the correct `guestId` is provided

This endpoint uses `optionalAuth`.

---

## Vote Endpoint

### POST /polls/:id/vote

Registers a vote for a specific poll.

This endpoint is available to both guests and authenticated users.

Behavior:
- If authenticated, the vote is stored with `userId`
- If used as a guest, the vote is stored with `guestId`

This endpoint uses `optionalAuth`.

---

## User Endpoints

### GET /users

Returns registered users.

This endpoint requires authentication.

It uses `requireAuth`.

---

### POST /users

Creates a new user account.

This endpoint is public.

It is used when registering a new account.

---

### PATCH /users/me

Updates the authenticated user's profile.

This endpoint requires authentication.

It uses `requireAuth`.

---

### DELETE /users/me

Deletes the authenticated user's own account.

This endpoint requires authentication.

It uses `requireAuth`.

---

## Authentication Endpoints

### POST /auth/login

Authenticates a user and returns login/session data.

This endpoint is public.

---

### GET /auth/me

Returns information about the currently authenticated user.

This endpoint requires authentication.

It uses `requireAuth`.

---

### POST /auth/logout

Logs out the currently authenticated user.

This endpoint requires authentication.

It uses `requireAuth`.

---

## Middleware in the API

The API uses middleware to separate shared concerns from route logic.

### optionalAuth

Used on routes where both guests and authenticated users are allowed.

If a valid Bearer token is present, the request gets user context through `req.auth`.
If not, the request continues as a guest request.

### requireAuth

Used on routes that require a logged-in user.

If the token is missing or invalid, the API returns `401 Unauthorized`.

### requireJson

Used to ensure that requests use the expected JSON format.

### errorHandler

Used for centralized error handling and consistent error responses.

### notFound

Handles unknown routes and returns a `404` response.

---

## Design Decisions

A key design decision in this project was supporting both guests and registered users in the same application.

Instead of creating separate poll and vote APIs for guests and users, the same endpoints are reused and the behavior depends on whether the request has authenticated user data or guest data.

This keeps the API smaller and avoids duplication.

Another design choice was to version the API under `/api/v1`, which makes future changes easier to manage.

---

## Challenges

One challenge was handling guest and authenticated behavior in the same endpoints.

This required:

- optional authentication middleware
- careful handling of `userId` versus `guestId`
- service logic that checks ownership and permissions correctly

Another challenge was keeping the routes simple while still supporting different application states.

---

## Conclusion

The API is designed to be simple, structured, and flexible.

It supports:
- guest interactions
- authenticated user interactions
- poll creation, voting, and deletion
- account and session handling

The route structure matches the layered backend architecture used in the rest of the project.