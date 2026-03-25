# Users and Privacy

## Overview

The application supports both registered users and guest users.

Registered users can create accounts and log in, while guests can use parts of the system without registering.

---

## User Accounts

Registered users can:

- create an account
- log in and log out
- update their profile
- delete their own account

User data is stored in the `users` table.

Passwords are never stored in plain text. They are hashed before being saved.

---

## Authentication

Authentication is handled using session tokens.

When a user logs in:

- a token is created
- the token is stored in the `sessions` table
- the client stores the token in `localStorage`
- the token is sent in the `Authorization` header

Example header:

Authorization: Bearer <token>

The server uses middleware to validate the token and identify the user.

---

## Guest Users

Guest users are supported without creating an account.

Guests can:

- create public polls
- vote on public polls
- delete their own polls

Guest actions are linked to a `guestId` stored in the browser (`localStorage`).

This means guest ownership is browser-based. A guest poll is only recognized as belonging to the same guest as long as the same browser storage is available.

---

## Consent and Stored Data

The application stores only the data needed to make the system work.

For registered users this includes:

- username
- password hash
- consent data
- session token

For guest usage the application may store in the browser:

- `guestId`
- `pollapp_token` for logged-in users
- vote markers for guest voting

Consent is stored as JSON when an account is created. It includes acceptance timestamps and version numbers for Terms and Privacy.

---

## User Control

Users can:

- update their profile
- delete their own account

When a registered user is deleted:

- related sessions are removed
- related polls are removed
- related votes are removed

This is handled through database relations and cascade delete rules.

---

## Design Decisions

One important decision was to support both guests and registered users in the same system.

This required:

- separate handling of `user_id` and `guest_id`
- flexible ownership checks in the service layer

Another decision was to store session tokens in the database instead of only keeping them in memory. This made it possible to support login across requests in a simple way.

---

## Challenges

A challenge was combining guest access with authenticated access without creating two completely different systems.

This was solved by using:

- `optionalAuth` for routes that allow both guests and users
- `requireAuth` for protected routes

Another challenge was making sure users can only delete or change data they own. This is handled through ownership checks in the service layer.

---

## Conclusion

The user system supports:

- secure login with hashed passwords and session tokens
- guest access without registration
- consent tracking
- basic privacy-aware data handling

The solution is simple, but it matches the actual behavior of the application.