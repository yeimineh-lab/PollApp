16.03.2026

UI / Theme
- Changed the UI theme from blue to dark.
- Added dark color variables in `:root` in app.css.
- Updated background to dark gradient.
- Styled cards, buttons, and inputs to match dark theme.

Layout
- Fixed container width so content stays centered.
- Added responsive grid layout.
- Improved spacing and alignment.

Poll UI
- Redesigned poll cards.
- Added vote bars showing percentage and total votes.
- Highlighted selected option for the user.
- Disabled vote button after voting.

Navigation
- Added top navigation (Polls, Create poll, Profile, Logout).
- Active tab highlighting.

Forms
- Styled login and signup forms.
- Added validation messages.
- Improved input focus and hover styles.

Poll management
- Added delete button for poll owners.
- Show owner badge on polls created by the user.

Frontend logic
- Fixed poll loading logic to avoid needing page refresh.
- Load polls after login/signup.
- Prevent multiple poll fetch calls.

General
- Improved button states (disabled, hover, active).
- Added consistent spacing and border radius.