# Log - Poll System (Public / Community / Guest)

## Date
23.03.2026

---

## What we implemented

- Separation between:
  - Public polls (visible to everyone)
  - Community polls (only visible to logged-in users)

- Support for:
  - Guest users (via guestId stored in localStorage)
  - Registered users (via userId)

- Voting system:
  - Only one vote per user/guest per poll
  - Users cannot vote on their own polls

- Delete functionality:
  - Only the owner (user or guest) can delete a poll

---

## Database changes

- Added:
  - `guest_id` (TEXT)
  - `guest_username` (TEXT)
  - `is_public` (BOOLEAN)

- Updated:
  - `owner_id` → removed NOT NULL (to allow guest polls)
  - `votes.user_id` → removed NOT NULL (to allow guest voting)

---

## Issues encountered

### 1. Guests could not vote on polls created by users
- Cause: Incorrect access logic
- Fix: Allowed voting if `is_public = true`

---

### 2. 403 Forbidden errors on polls
- Cause: Backend only checked ownership
- Fix:
  - Public polls → accessible to everyone
  - Private polls → only accessible to owner

---

### 3. Guest lost ownership after refresh
- Cause: New guestId was generated
- Fix: Stored guestId in `localStorage`

---

### 4. Delete button disappeared
- Cause: guestId mismatch with database
- Fix:
  - Synced guestId with DB
  - In some cases updated manually in SQL

---

### 5. Users could not vote on public polls
- Cause: Incorrect voting logic
- Fix: Allowed users to vote if they are not the poll owner

---

## Result

- Guests:
  - Can view and vote on public polls
  - Can create and delete their own polls

- Registered users:
  - Can view both public and community polls
  - Can vote on others' polls
  - Cannot vote on their own polls

---

## Status

✅ Fully implemented  
✅ Core functionality working  
⚠️ Guest ownership depends on localStorage (expected behavior)