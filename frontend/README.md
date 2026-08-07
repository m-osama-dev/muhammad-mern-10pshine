# Inkwell — Frontend

React + Vite + Tailwind CSS v4. JWT auth against the backend API.

## Structure

```text
src/
  services/     - api.js (axios client + auth calls)
  context/      - AuthContext (user/token state)
  pages/        - Signup, Login, Profile
  App.jsx       - routes + protected route + dark mode
  main.jsx      - entry point
  index.css     - Tailwind v4 import + theme tokens
test/           - Jest + React Testing Library
```

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

## Testing

```bash
npm test
```

## Notes

PR 1 covers auth screens (Signup, Login, Profile).
Notes dashboard and editor come in PR 2.
