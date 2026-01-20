# Simple Poll App

## Project Description
This project is a simple full-stack poll application.

Users can create polls with a question and multiple options, share them with others, collect votes, and view results.  
The project is intentionally kept simple and focuses on demonstrating a **clear development process**, **structured planning**, and **basic full-stack skills** rather than building a complex system.

---

## Purpose and Goal
The purpose of this project is to design and develop a simple full-stack application that demonstrates:

- Incremental development
- Clear prioritization of features
- Separation of client, server, and database
- Basic project management and Git workflow

The goal is to show *how* the application is built, not only *what* is built.

---

## Feature Map (Prioritized)

### Core Features (Must Have)
- User registration and login
- Create a poll with a question and multiple options
- Vote on a poll
- View poll results
- Persistent data storage using PostgreSQL

### Secondary Features (Should Have)
- Edit or close a poll (poll owner only)
- Prevent multiple votes per user
- Share polls via a unique URL

### Optional Features (Nice to Have)
- Progressive Web App (PWA) support
- Offline access to previously viewed polls
- Simple UI improvements

This prioritization ensures that essential functionality is implemented first before moving on to enhancements.

---

## Development Plan – Horizontal Slices

The project is developed using **horizontal slices**, where each version results in a complete and runnable application with limited functionality.

### v0.0.1 – Minimal Working Application
**Goal:** A running full-stack application with basic functionality.

- Express server setup
- REST-like API
- Create and view a single poll
- PostgreSQL database connection
- Simple client UI
- No authentication

### v0.1.0 – User Accounts
**Goal:** Introduce ownership and basic security.

- User registration and login
- Polls linked to a user
- One vote per user per poll

### v0.2.0 – Sharing and Management
**Goal:** Make the app usable for real users.

- Share polls via URL
- Close polls to stop voting
- View poll results clearly

### v0.3.0 – PWA and Offline Support
**Goal:** Improve user experience.

- Progressive Web App setup
- Cached static assets
- Offline viewing of previously visited polls

---

## Project Structure
simple-poll-app/
├── client/
├── server/
├── README.md


- `client/` contains the frontend
- `server/` contains the backend and API
- The structure is kept simple to support incremental development

---

## Project Management
GitHub Projects is used as the project management tool.

A Kanban board is set up with the following columns:
- Todo
- In Progress
- Done

Tasks are grouped by version (v0.0.1, v0.1.0, etc.) to reflect horizontal slices and development priorities.

---

## Git Workflow
The project follows a structured Git workflow:

- One task per commit
- Small, focused commits with clear messages
- Each commit represents a meaningful step in development

The initial commit contains multiple setup steps.  
Going forward, development follows smaller and more focused commits to align with good Git practices.

---

## Reflection
This project was revised based on feedback from the assignment review.

Improvements include:
- Introducing a prioritized feature map
- Using horizontal slices instead of isolated features
- Adding a clear project management structure
- Adopting better Git commit practices

These changes ensure the project is structured, realistic, and aligned with the assignment requirements.
