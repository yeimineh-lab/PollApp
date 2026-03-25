# Privacy

This application stores only the data needed to provide login, poll creation, and voting.

## Registered users

For registered users, the system stores:

- username
- password hash
- consent information
- session token

Passwords are hashed before storage and are not saved in plain text.

## Guest users

Guest users do not create an account, but the application still stores a browser-based `guestId`.

This is used to:

- identify guest-created polls
- allow guest poll deletion from the same browser
- limit guest voting to one vote per poll

## Browser storage

The client may store the following in `localStorage`:

- `pollapp_token`
- `simple_poll_guest_id`
- local vote-related markers

## Consent

When a registered user signs up, the application stores consent data for Terms of Service and Privacy Policy, including timestamp and version.

## Deletion

Registered users can delete their own account. Related sessions, polls, and votes are also removed through database relations.

## Limitation

Guest ownership is tied to the current browser storage. If browser data is cleared, the guest can no longer prove ownership of earlier guest-created polls.