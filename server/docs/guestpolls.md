# Guest Polls – Implementation Summary

## Overview
We implemented a guest-friendly polling system where users can:
- Browse public polls
- Vote without logging in
- Create polls as guests
- Optionally create an account for extended features

---

## Features Implemented

### 1. Guest Voting
- Guests can vote without authentication
- Each guest is assigned a `guestId` stored in `localStorage`
- Prevents multiple votes from same browser using:
  - `guestId` (backend)
  - `localStorage` flag (frontend)

---

### 2. Public Polls
- Polls are marked as `public`
- Visible to all users (guest + logged-in)
- Results include:
  - Vote counts
  - Percentages
  - User/guest vote state

---

### 3. Poll Creation
- Guests can create polls without login
- Required:
  - Title
  - Minimum 2 options
- Optional account system:
  - Logged-in users can create account-linked polls

---

### 4. Account System
- Signup / Login / Logout implemented
- Auth stored via token
- Account users get:
  - Profile management
  - Ownership of polls
  - Ability to delete own polls

---

### 5. UI Improvements
- Moved auth into **top-right dropdown (Account menu)**
- Added:
  - Login / Signup tabs
  - Profile + Logout view
- Introduced navigation:
  - Home (intro)
  - Public Polls
  - Create Poll

---

### 6. Home View (New)
- No polls shown on load
- Instead:
  - Intro to app
  - Explanation of:
    - How polls work
    - Guest vs account usage
    - Voting behavior

---

## Errors & Fixes

### Duplicate Voting Issue
**Problem:**
Guests could vote multiple times.

**Solution:**
- Introduced `guestId`
- Stored vote state in `localStorage`
- Backend validates votes per guest

---

### UI Misalignment (Account Menu)
**Problem:**
Dropdown and button not aligned / too centered

**Solution:**
- Switched to `position: absolute`
- Adjusted:
  - `right` offset
  - removed incorrect `translateX`
- Fine-tuned spacing for desktop & mobile

---

### Button Alignment (Profile / Logout)
**Problem:**
Buttons visually misaligned

**Solution:**
- Used flexbox with:
  - `justify-content: center`
  - consistent width + padding

---

### Polls Loading on Start
**Problem:**
Polls showed immediately → cluttered UX

**Solution:**
- Introduced view system (`home`, `polls`, `create`)
- Polls only load when entering **Public Polls**

---

## Structure (Frontend)

- `index.html`
  - Views: `home`, `polls`, `create`, `profile`
- `app.mjs`
  - View switching
  - Poll rendering
  - Auth handling
- `app.css`
  - Layout, dropdown, responsive UI

---

## Structure (Backend)

- `polls.routes.mjs`
- `polls.service.mjs`
- `optionalAuth.mjs`

Handles:
- Poll CRUD
- Voting logic
- Guest vs user handling

---


