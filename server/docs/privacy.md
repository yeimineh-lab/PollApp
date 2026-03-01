Privacy Policy
Data We Collect

This application collects the following user data:

Username

Hashed password

Timestamp of account creation

Consent timestamps for Terms of Service and Privacy Policy

No plain-text passwords are stored.

How Data Is Stored

User data is stored in a PostgreSQL database hosted on Render.

Passwords are securely hashed using bcrypt before being stored.
Authentication tokens are generated server-side and stored in memory only.

The application does not use third-party tracking tools.

Data Security

Passwords are hashed using bcrypt.

Database connections use SSL.

Only necessary user information is stored.

Tokens are not persisted in the database.

User Rights

Users can:

Create an account

Update their username or password

Delete their account

When a user deletes their account:

Their user record is removed from the database.

Ownership of related polls is anonymized.

Hosting & Infrastructure

Backend: Node.js (Express)

Database: PostgreSQL

Hosting provider: Render