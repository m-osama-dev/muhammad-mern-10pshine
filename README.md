# cohort-9-mern-10290-muhammad
Cohort 9 — MERN (NodeJS+ReactJS) assignment for Muhammad Osama

# cohort-9-mern-10290-muhammad

Cohort 9 — MERN (NodeJS+ReactJS) assignment for Muhammad Osama

Full-stack Notes App with user authentication, per-user notes, application
logging, exception handling, and unit testing.

## Tech Stack

- **Backend:** Node.js + Express, MongoDB (Atlas), JWT auth, Pino logging, tested with Mocha/Chai
- **Frontend:** React (Vite), tested with Jest — *coming soon*
- **Code Quality:** SonarQube (self-hosted via Docker) — *to be configured*

## Folder Structure
 
## Getting Started

### Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
npm run dev
```

## Testing

```bash
cd backend
npm test
```

## Branching Strategy

- `main` — production-ready code
- `develop` — integration branch
- `feature/frontend/*`, `feature/backend/*` — new features
- `bugfix/frontend/*`, `bugfix/backend/*` — bug fixes

## Features (Backend)

- User signup, login, logout (JWT-based)
- Create, edit, delete notes — scoped per authenticated user
- Global error handling middleware + Pino logging throughout
- Mocha/Chai test coverage