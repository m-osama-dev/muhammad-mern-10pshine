# cohort-9-mern-10290-muhammad

Cohort 9 — MERN (Node.js + React.js)  for Muhammad Osama

**Inkwell Notes App** — a full-stack notes application with user authentication,
per-user notes, rich text editing, application logging, exception handling,
unit testing, and static code analysis via SonarQube.

## Tech Stack

- **Backend:** Node.js + Express, MongoDB (Atlas), JWT auth, Pino logging, tested with Mocha/Chai + Supertest
- **Frontend:** React (Vite) + Tailwind CSS, rich text editing with React Quill, tested with Jest + React Testing Library
- **Code Quality:** SonarQube (self-hosted via Docker) — Quality Gate passed, 80%+ test coverage

## Features

### Backend
- User signup, login, logout (JWT-based authentication)
- Get and update logged-in user's profile
- Create, read, update, delete notes — scoped per authenticated user
- Global error handling middleware + Pino logging throughout
- CORS configured with explicit allowed origins
- Mocha/Chai test coverage (unit + integration tests with an in-memory test DB)

### Frontend
- Signup, login, and profile pages
- Dashboard listing all of a user's notes with delete confirmation
- Note editor with rich text formatting (React Quill)
- Dark mode toggle
- Jest + React Testing Library test coverage

### Code Quality
- SonarQube static analysis across both backend and frontend
- Test coverage tracked and enforced via Quality Gate (≥80%)
- Security, Reliability, and Maintainability ratings tracked per scan

## Project Structure

```
muhammad-mern-10pshine/
├── backend/
│   ├── src/
│   │   ├── config/         # DB connection, logger
│   │   ├── controllers/    # auth & note controllers
│   │   ├── middleware/     # auth, error handling
│   │   ├── models/         # User, Note schemas
│   │   ├── routes/         # auth & note routes
│   │   ├── utils/          # helpers (token generation, AppError)
│   │   ├── app.js
│   │   └── server.js
│   └── test/                # Mocha/Chai tests
├── frontend/
│   ├── src/
│   │   ├── components/      # NoteCard, ConfirmDialog
│   │   ├── context/         # AuthContext
│   │   ├── pages/           # Signup, Login, Profile, Dashboard, NoteEditor
│   │   ├── services/        # api.js, noteService.js
│   │   └── main.jsx
│   └── test/                 # Jest + RTL tests
├── sonar-project.properties
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB Atlas connection string (or local MongoDB instance)
- Docker (only if self-hosting SonarQube locally)

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env   # fill in the variables below
npm run dev
```

**Backend environment variables (`.env`):**
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1h
PORT=5000
NODE_ENV=development
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

**Frontend environment variables (`.env`):**
```
VITE_API_BASE_URL=http://localhost:5000/api
```

## Testing

### Backend (Mocha/Chai)
```bash
cd backend
npm test                 # run tests
npm run test:coverage    # run tests with coverage report
```

### Frontend (Jest)
```bash
cd frontend
npm test                 # run tests
npm run test:coverage    # run tests with coverage report
```

## Code Quality — SonarQube

This project uses a self-hosted SonarQube instance (via Docker) for static
analysis and quality gate enforcement.

To run a scan locally:

1. Start SonarQube and ensure it's running at `http://localhost:9000`
2. Generate coverage reports for both apps:
   ```bash
   cd backend && npm run test:coverage
   cd ../frontend && npm run test:coverage
   ```
3. From the repo root, run the scan:
   ```bash
   npx @sonar/scan -D"sonar.host.url=http://localhost:9000" -D"sonar.token=YOUR_TOKEN"
   ```
4. View results at `http://localhost:9000/dashboard?id=Inkwell-Notes-App`

Latest scan report is attached in the repo: `SonarQube SS Reports.pdf`

**Current status:** Quality Gate Passed · 80%+ coverage · Security: A · Maintainability: A

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/login` | Log in and receive a JWT |
| POST | `/api/auth/logout` | Log out (protected) |
| GET | `/api/auth/me` | Get logged-in user's profile (protected) |
| PUT | `/api/auth/me` | Update logged-in user's profile (protected) |

### Notes
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notes` | Get all notes for the logged-in user |
| GET | `/api/notes/:id` | Get a single note by ID |
| POST | `/api/notes` | Create a new note |
| PUT | `/api/notes/:id` | Update an existing note |
| DELETE | `/api/notes/:id` | Delete a note |

## Branching Strategy

- `main` — production-ready code
- `develop` — integration branch
- `feature/frontend/*`, `feature/backend/*` — new features
- `bugfix/frontend/*`, `bugfix/backend/*` — bug fixes
- `chore/*` — tooling/config changes (e.g. SonarQube setup)

## Author

Muhammad Osama