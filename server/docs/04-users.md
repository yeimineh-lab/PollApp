# Users and Privacy

## Overview

The application supports both registered users and guest users.

Registered users can create accounts and log in, while guests can use parts of the system without registering.

---

## User Accounts

Users can:

- Create an account
- Log in and log out
- Update their profile
- Delete their own account

User data is stored in the `users` table.

Passwords are stored as hashed values, not plain text.

---

## Authentication

Authentication is handled using session tokens.

When a user logs in:
- A token is created
- The token is stored in the `sessions` table
- The client stores the token and sends it with requests

Example header:

Authorization: Bearer <token>

The server uses middleware to verify the token and identify the user.

---

## Session Handling

To keep users logged in, the client checks authentication on startup.

This is done by calling an endpoint (for example `/auth/me`) to retrieve the current user.

If the token is valid:
- the user stays logged in

If not:
- the user is treated as logged out

---

## Guest Users

Guest users are supported without requiring an account.

Guests can:
- create polls
- vote
- delete their own polls

Guest actions are tracked using a `guestId`, which is stored on the client.

This allows guest users to interact with the system in a similar way to registered users.

---

## Privacy and Data Minimization

Only necessary data is stored:

- username
- password hash
- consent data

Consent is stored as a JSON field when the user account is created.

No additional personal data is collected.

---

## User Control

Users have control over their own data.

They can:
- update their profile
- delete their account

When a user is deleted:
- related sessions are removed
- related polls and votes are removed through database relations

---

## Design Decisions

One important decision was to support both guests and registered users in the same system.

This required:
- separate handling of `user_id` and `guest_id`
- flexible database design

Another decision was to use session tokens stored in the database instead of keeping everything only in memory.

---

## Challenges

A challenge was handling authentication while still allowing guest access.

This was solved using:
- optionalAuth for mixed access
- requireAuth for protected routes

Another challenge was ensuring users can only modify or delete their own data.

This is handled by checking ownership in the service layer.

---

## Conclusion

The user system supports:

- secure authentication using sessions
- guest access without registration
- basic privacy handling and consent

It matches the requirements of the application while keeping the implementation simple.