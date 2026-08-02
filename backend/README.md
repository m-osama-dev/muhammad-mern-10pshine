# Backend - Notes App API

Plain Node.js + Express + MongoDB (Mongoose) + JWT + Pino.

## Structure
```
src/
  config/       - db connection, logger
  controllers/  - auth + notes logic
  middleware/   - auth guard, error handler, 404, async wrapper
  models/       - User, Note
  routes/       - express routers
  app.js
  server.js
test/           - mocha/chai tests (in-memory mongo)
```

## Setup
```bash
npm install
cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
npm run dev
```

## Testing
```bash
npm test
```
Uses `mongodb-memory-server`, so no real database is needed to run the tests.

## API

| Method | Endpoint          | Access  | Description        |
|--------|-------------------|---------|---------------------|
| POST   | /api/auth/signup  | Public  | Register            |
| POST   | /api/auth/login   | Public  | Log in              |
| POST   | /api/auth/logout  | Private | Log out             |
| GET    | /api/auth/me      | Private | Current user        |
| GET    | /api/notes        | Private | List notes          |
| GET    | /api/notes/:id    | Private | Get one note        |
| POST   | /api/notes        | Private | Create note         |
| PUT    | /api/notes/:id    | Private | Update note         |
| DELETE | /api/notes/:id    | Private | Delete note         |

Protected routes need `Authorization: Bearer <token>`.
