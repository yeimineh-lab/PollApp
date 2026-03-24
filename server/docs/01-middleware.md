# Middleware

## Purpose

The purpose of the middleware layer in this project is to handle cross-cutting concerns such as:

- Authentication
- Request validation
- Error handling

This allows the route handlers to stay simple and focused only on handling requests and returning responses.

---

## Implemented Middleware

### optionalAuth

This middleware checks if a request includes a valid Bearer token, but does not require it.

- If a valid token is present:
  - The user is identified
  - `req.auth` is populated with `{ token, userId }`
- If no token is present:
  - The request continues as a guest

This is used for endpoints where both guests and authenticated users are allowed, such as:

- Listing polls
- Voting
- Creating polls

---

### requireAuth

This middleware ensures that the user is authenticated.

- If no token is provided:
  - Returns `401 Unauthorized`
- If the token is invalid:
  - Returns `401 Unauthorized`
- If valid:
  - Adds `req.auth` with user information

This is used for endpoints that should only be accessible to logged-in users.

---

### requireJson

This middleware ensures that the request has the correct `Content-Type`.

- If the request is not `application/json`:
  - Returns an error
- Prevents invalid or malformed requests

---

### errorHandler

Centralized error handling middleware.

- Catches errors thrown in routes and services
- Sends a consistent JSON response
- Prevents server crashes

---

### notFound

Handles requests to unknown routes.

- Returns a `404 Not Found` response
- Ensures consistent API behavior

---

## Design Decisions

The middleware layer is separated from routes to improve structure and maintainability.

- Routes handle HTTP logic only
- Middleware handles shared concerns
- Services handle business logic

This separation makes the application easier to extend and debug.

---

## Challenges

One challenge was handling both guests and authenticated users in the same endpoints.

This was solved by introducing `optionalAuth`, which allows the system to:

- Support guest users without login
- Still attach user data when available

Another improvement was removing duplicated logic for extracting Bearer tokens by introducing a shared utility function.

---

## Conclusion

The middleware system ensures:

- Clear separation of concerns
- Reusable logic
- Consistent request handling

It plays a key role in making the application structured and maintainable.