# Persistence

## Overview

The application uses PostgreSQL to store all data.

Database logic is placed in `src/storage`, while business logic is handled in the service layer.

The database schema is initialized through `initDb()` in `src/storage/db.mjs`.

---

## Stored Data

The application uses four main tables:

- users
- sessions
- polls
- votes

### users
Stores registered users with:
- id
- username
- password hash
- consent data
- created_at

### sessions
Stores login sessions.

Each session contains:
- a token
- a user reference

This allows users to stay logged in across requests.

---

### polls
Stores polls created by both guests and registered users.

A poll can belong to:
- a user (`owner_id`)
- a guest (`guest_id` and `guest_username`)

Other fields include:
- title
- description (used to store options)
- is_public
- created_at

---

### votes
Stores votes for polls.

A vote can belong to:
- a user (`user_id`)
- a guest (`guest_id`)

Constraints are used to ensure:
- a vote belongs to either a user or a guest, not both
- each user or guest can only vote once per poll

---

## Design Choices

A key decision was to support both guests and registered users using the same tables.

Instead of creating separate systems, the database allows:
- either `user_id` or `guest_id` on polls and votes

This keeps the structure simple and avoids duplication.

Another decision was to centralize the schema in `initDb()` so all database setup is consistent.

---

## Challenges

One challenge was handling ownership and voting rules for both guests and users.

This was solved by:
- using separate fields (`user_id` and `guest_id`)
- adding constraints to prevent invalid data

Another challenge was making sure database setup scripts matched the actual schema used by the application.

This was solved by using the same `initDb()` function in all scripts.

---

## Conclusion

The persistence layer supports:

- user accounts and sessions
- guest and user polls
- voting with proper constraints

The structure is simple, consistent, and matches how the application works.