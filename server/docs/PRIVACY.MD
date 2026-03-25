# Privacy

The app stores only the data needed for login, creating polls and voting.

## Registered users

For users with an account, the system stores:

- username
- password 
- consent info
- session token

Passwords are not stored as plain text.

## Guest users

Guests do not create an account, but the app still uses a `guestId` stored in the browser.

This is used to:

- link polls to the same guest
- allow deleting own polls
- limit voting to once per poll

This means guest access is tied to the browser, not a real user account.

## Browser storage

The app uses `localStorage` to store:

- login token (`pollapp_token`)
- guest id
- some vote-related data

## Consent

When a user signs up, the app stores that they accepted Terms and Privacy, with timestamp and version.

## Deletion

Users can delete their account. Related polls, votes and sessions are also removed.

## Limitations

If browser data is cleared, guest users lose access to their polls since ownership is based on browser storage.