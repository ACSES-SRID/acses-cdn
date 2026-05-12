# ACSES CDN & API Server

API server and static file CDN for the ACSES department website.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment config and fill in values
cp .env.example .env

# 3. Generate a JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Paste the output into JWT_SECRET in your .env file

# 4. Create the first admin user
npm run seed

# 5. If migrating from the old codebase, hash existing plain-text passwords
npm run migrate:passwords

# 6. Start the server
npm start
```

The server runs on `http://localhost:3002` by default.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret key for signing JWT tokens |
| `CORS_ORIGIN` | Production | Comma-separated frontend URLs (e.g. `https://acses.vercel.app`) |
| `PORT` | No | Server port (default: `3002`) |

## Project Structure

```
acses-cdn/
├── server.js              Entry point
├── config/
│   └── db.js              MongoDB connection singleton
├── middleware/
│   ├── auth.js            JWT verification (requireAuth)
│   └── validate.js        ObjectId validation (validateId)
├── routes/
│   ├── index.js           Route registry
│   ├── auth.js            POST /login → JWT token
│   ├── announcements.js   CRUD
│   ├── events.js          CRUD + pagination
│   ├── gallery.js         CRUD + pagination
│   ├── home.js            GET + PUT (single document)
│   ├── leadership.js      CRUD
│   ├── resources.js       CRUD (grouped GET by type)
│   ├── store.js           CRUD + pagination + price coercion
│   ├── student-projects.js CRUD + pagination + approval status
│   └── users.js           CRUD (bcrypt hashing, no passwords in GET)
├── scripts/
│   ├── seed.js            Create first admin user
│   └── migrate-passwords.js Hash existing plain-text passwords
└── public/
    └── gallery/           Static images
```

## API Endpoints

All endpoints are under `/api`. GET routes are public. POST/PUT/DELETE routes require a JWT token in `Authorization: Bearer <token>`.

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | No | Login, returns JWT token |

### Content Management

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/events` | No | List events (paginated) |
| POST | `/api/events` | Yes | Create event |
| PUT | `/api/events/:id` | Yes | Update event |
| DELETE | `/api/events/:id` | Yes | Delete event |
| GET | `/api/announcements` | No | List announcements |
| POST | `/api/announcements` | Yes | Create announcement |
| PUT | `/api/announcements/:id` | Yes | Update announcement |
| DELETE | `/api/announcements/:id` | Yes | Delete announcement |
| GET | `/api/leadership` | No | List leadership members |
| POST | `/api/leadership` | Yes | Add leadership member |
| PUT | `/api/leadership/:id` | Yes | Update member |
| DELETE | `/api/leadership/:id` | Yes | Delete member |
| GET | `/api/resources` | No | List resources (grouped by type) |
| POST | `/api/resources` | Yes | Add resource |
| PUT | `/api/resources/:id` | Yes | Update resource |
| DELETE | `/api/resources/:id` | Yes | Delete resource |
| GET | `/api/store` | No | List products (paginated) |
| POST | `/api/store` | Yes | Add product |
| PUT | `/api/store/:id` | Yes | Update product |
| DELETE | `/api/store/:id` | Yes | Delete product |
| GET | `/api/gallery` | No | List gallery items (paginated) |
| POST | `/api/gallery` | Yes | Add gallery item |
| PUT | `/api/gallery/:id` | Yes | Update gallery item |
| DELETE | `/api/gallery/:id` | Yes | Delete gallery item |
| GET | `/api/student-projects` | No | List approved projects (paginated) |
| GET | `/api/student-projects/all` | Yes | List all projects (admin) |
| POST | `/api/student-projects` | No | Submit project (pending approval) |
| PUT | `/api/student-projects/:id` | Yes | Update/approve project |
| DELETE | `/api/student-projects/:id` | Yes | Delete project |
| GET | `/api/home` | No | Get home page content |
| PUT | `/api/home` | Yes | Update home page content |
| GET | `/api/users` | Yes | List admin users |
| POST | `/api/users` | Yes | Create admin user |
| PUT | `/api/users/:id` | Yes | Update admin user |
| DELETE | `/api/users/:id` | Yes | Delete admin user |

### Pagination

Routes that support pagination accept optional query parameters:

```
GET /api/events?page=1&limit=20
```

Response format:

```json
{
  "items": [...],
  "total": 45,
  "page": 1,
  "limit": 20
}
```

### Other

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the server |
| `npm run seed` | Create the first admin user |
| `npm run migrate:passwords` | Hash existing plain-text passwords |

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (native driver)
- **Auth**: JWT (jsonwebtoken) + bcrypt
- **Security**: helmet, express-rate-limit, CORS
