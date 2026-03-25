# Middleware

## Purpose

The purpose of the middleware layer in this project is to handle functionality that is shared across multiple routes.

This mainly includes:

- Authentication
- Basic request checks
- Error handling

Using middleware helps keep the route handlers simpler, so they can focus on handling requests and returning responses instead of repeating the same logic.

---

## Implemented Middleware

### optionalAuth

This middleware checks if a request contains a Bearer token, but it does not require it.

- If a valid token is provided:
  - The user is identified
  - `req.auth` is set with `{ token, userId }`
- If no token is provided:
  - The request continues as a guest

This is useful in PollApp because some endpoints allow both guests and logged-in users, such as:

- Viewing polls
- Voting

---

### requireAuth

This middleware ensures that the user is authenticated.

- If no token is provided:
  - Returns `401 Unauthorized`
- If the token is invalid:
  - Returns `401 Unauthorized`
- If valid:
  - Adds user information to `req.auth`

This is used for endpoints that should only be accessible to logged-in users, such as user-related actions.

---

### requireJson

This middleware checks that the request has the correct `Content-Type`.

- If the request is not `application/json`:
  - Returns an error

This helps prevent issues where the server receives data in an unexpected format.

---

### errorHandler

This is a centralized error handling middleware.

- Catches errors from routes and services
- Returns a consistent JSON response

---

### notFound

This middleware handles requests to routes that do not exist.

- Returns a `404 Not Found` response

---

## Design Decisions

The middleware is separated from routes to keep the project structured and easier to understand.

- Routes handle HTTP requests and responses
- Middleware handles shared logic like authentication and request checks
- Services handle business logic, such as validating poll data or user input

This separation makes the code easier to read and maintain.

---

## Challenges

One challenge was supporting both guests and authenticated users in the same endpoints.

In PollApp, users can vote and view polls without logging in, while some actions require authentication. This was handled by using `optionalAuth`, which allows both cases to work in the same route.

Another challenge was handling Bearer tokens consistently. Instead of repeating the same logic in multiple places, a shared approach was used to extract and validate tokens.

---

## Conclusion

The middleware layer helps keep the application organized by separating shared logic from route handling.

It reduces duplication and ensures that requests are handled in a consistent way across the application.