# Changelog

All notable changes to the ACSES CDN & API server are documented in this file.

## [2.0.0] - 2026-05-11

Major restructuring and security overhaul. This is a breaking change from v1.x — the API now requires JWT authentication for all write operations and uses RESTful URL parameters for PUT/DELETE.

### 🔴 Security Fixes (Critical)

- **JWT authentication** added to all POST/PUT/DELETE routes via `middleware/auth.js`
  - Login via `POST /api/auth/login` returns a JWT token (8h expiry)
  - All write routes require `Authorization: Bearer <token>` header
  - Replaces the old disconnected `ADMIN_PASSWORD` env var approach
- **Password hashing** — all passwords are now bcrypt-hashed before storage in `routes/users.js`
  - `GET /api/users` no longer returns password fields (uses MongoDB projection)
  - Password updates are re-hashed automatically
  - Duplicate username check on user creation (returns 409)
- **Rate limiting** on `POST /api/auth/login` — max 10 attempts per 15 minutes per IP
- **Helmet** middleware added for secure HTTP headers (X-Content-Type-Options, X-Frame-Options, etc.)
- **Migration script** `scripts/migrate-passwords.js` hashes existing plain-text passwords in the database
  - Safe to run multiple times (detects already-hashed passwords by `$2` prefix)
- `ADMIN_PASSWORD` env var removed — replaced by per-user authentication against the `users` collection

### 🟡 API Correctness Fixes

- **RESTful URL parameters** — all PUT and DELETE routes changed from body-based IDs to URL params:
  - Before: `PUT /api/events` with `{ id, ...data }` in body
  - After: `PUT /api/events/:id` with only update data in body
  - Same change applied to DELETE routes: `DELETE /api/events/:id`
- **ObjectId validation** middleware (`middleware/validate.js`) on all `:id` routes
  - Returns 400 with clear error instead of crashing with an unhandled exception
- **`home.js` race condition fixed** — replaced `deleteMany()` + `insertOne()` with atomic `findOneAndReplace()` with `upsert: true`
- **Database consolidation** — `executives.js` (which used `db('acses')`) merged into `leadership.js` (uses `db('acses-website')`)
  - All routes now use the single `acses-website` database
- **`resources.js` optimised** — GET now uses 1 query + JavaScript grouping instead of 3 separate MongoDB queries
- **Consistent timestamps** — all POST handlers add `createdAt`, all PUT handlers add `updatedAt`
- **Error logging** — all catch blocks now `console.error()` the actual error before sending a generic response

### ✨ New Features

- **Pagination** on high-growth collections: events, gallery, store, student-projects
  - Format: `GET /api/events?page=1&limit=20` → `{ items, total, page, limit }`
  - Defaults: page 1, limit 50. Max limit: 100.
- **Student project approval flow**:
  - `POST /api/student-projects` is public (for the submit-project page) and sets `status: 'pending'`
  - `GET /api/student-projects` returns only approved projects
  - `GET /api/student-projects/all` (admin, auth required) returns all projects including pending
  - Admin can approve via `PUT /api/student-projects/:id` with `{ status: 'approved' }`
- **Health check** endpoint: `GET /health` → `{ status: 'ok' }`
- **Seed script** `scripts/seed.js` — creates the first admin user with a hashed password
- **Leadership ordering** — `order` field added for display sort control

### 🧹 Cleanup

- **Deleted `index.js`** (legacy image-only server on port 4000, never used by `npm start`)
- **Deleted `api/` folder** — replaced by `config/`, `middleware/`, `routes/` structure
- **`package.json` fixed**: `"main"` changed from `index.js` → `server.js`, version bumped to 2.0.0
- **`.gitignore` expanded** — covers OS files, editor configs, logs, all `.env` variants (except `.env.example`)
- **`.env.example` created** — documents all required environment variables
- **`README.md` rewritten** — full setup guide, API reference, folder structure, scripts reference
- **JSON body limit** set explicitly to `2mb` in `server.js`

### 📁 New Folder Structure

```
acses-cdn/
├── server.js                 Entry point (helmet, CORS, compression, routes, static)
├── config/
│   └── db.js                 MongoDB connection singleton (was api/mongodb.js)
├── middleware/
│   ├── auth.js               JWT verification middleware
│   └── validate.js           ObjectId validation middleware
├── routes/
│   ├── index.js              Route registry (was api/routes.js)
│   ├── auth.js               Login + JWT issuance + rate limiting
│   ├── announcements.js      CRUD
│   ├── events.js             CRUD + pagination
│   ├── gallery.js            CRUD + pagination
│   ├── home.js               Single-document GET + atomic PUT
│   ├── leadership.js         CRUD (absorbed executives.js)
│   ├── resources.js          CRUD (single-query grouped GET)
│   ├── store.js              CRUD + pagination + price coercion
│   ├── student-projects.js   CRUD + pagination + approval workflow
│   └── users.js              CRUD + bcrypt + password stripping
├── scripts/
│   ├── seed.js               Create first admin user
│   └── migrate-passwords.js  Hash existing plain-text passwords
└── public/gallery/           Static images (unchanged)
```

### 📦 Dependencies

| Package | Version | Status |
|---------|---------|--------|
| express | ^4.21.2 | existing |
| mongodb | ^6.12.0 | existing |
| bcryptjs | ^2.4.3 | existing |
| compression | ^1.7.5 | existing |
| cors | ^2.8.6 | existing |
| dotenv | ^17.4.2 | existing |
| jsonwebtoken | ^9.0.0 | **new** |
| helmet | ^8.1.0 | **new** |
| express-rate-limit | ^7.5.0 | **new** |

### ⚠️ Breaking Changes for Frontend

The frontend (`acses-website`) will need these updates to work with v2.0.0:

1. **Login flow** — `AdminContext.jsx` must call `POST /api/auth/login` with `{ username, password }`, store the returned JWT token, and attach `Authorization: Bearer <token>` to all admin API calls
2. **PUT/DELETE URLs** — all admin API calls must change from body-based IDs to URL-based:
   - `PUT /api/events` → `PUT /api/events/:id`
   - `DELETE /api/events` → `DELETE /api/events/:id`
   - (Same for all resources)
3. **Paginated responses** — events, gallery, store, and student-projects GET routes now return `{ items, total, page, limit }` instead of a flat array. The frontend must read `response.items` instead of using the response directly.
4. **Student projects** — public GET only returns `status: 'approved'` projects. Admin must use `GET /api/student-projects/all`.
5. **Executives endpoint removed** — `/api/executives` no longer exists. Use `/api/leadership` instead.

---

## [1.0.0] - Pre-2026-05-11

Original implementation.

- Express server serving static images from `public/` and JSON API from `api/`
- MongoDB CRUD endpoints for: leadership, executives, events, announcements, resources, store, gallery, student-projects, users, home
- No authentication on any route
- Plain-text password storage
- `executives.js` used separate `acses` database
- PUT/DELETE used request body for IDs
- `home.js` used deleteMany+insertOne (race condition)
- Legacy `index.js` image-only server on port 4000
