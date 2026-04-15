# Backend Architecture & Folder Structure — Instructions

This document explains the design, responsibilities, and conventions used in the `Backend` folder. It is written as a guide you can reuse when creating a new project with the same architecture.

---

## High-level overview

This backend follows a thin-MVC / service-layer pattern with a clear separation of concerns:

- Client -> Routes -> Controllers -> Services -> Models -> Database
- Cross-cutting concerns (auth, errors, logging) live in `middlewares/`.
- App bootstrap is in `app.js`; process startup in `server.js`.

Key technologies used in this project:

- Express for HTTP server and routing
- Mongoose for MongoDB models and data access
- express-validator for request validation
- bcrypt for password hashing and jsonwebtoken for authentication

The goals of this structure are testability, separation of concerns, and easy onboarding.

---

## Folder-by-folder responsibilities

- `app.js`
  - Create and configure the Express app instance.
  - Register global middleware (CORS, body parsing, cookie parsing, security middleware).
  - Mount routers (e.g. `app.use('/users', userRoutes)`).
  - Export the `app` object only (do not start the server here).

- `server.js`
  - Create the HTTP server (`http.createServer(app)`) and call `server.listen(...)`.
  - Keep runtime/start concerns here (ports, logging, graceful shutdown).

- `routes/`
  - Define express.Router instances and attach validation middlewares.
  - Routes should be thin: only map HTTP requests to controller functions and run validators.

- `controllers/`
  - Orchestrate request handling: validate inputs (using `validationResult`), call services, format responses.
  - Controllers should not contain heavy business logic or direct DB calls — delegate to services.
  - Use `try/catch` and `next(err)` to forward unexpected errors to a centralized error handler.

- `services/`
  - Contain business/domain logic, complex workflows, and transactions.
  - Services call models (or repositories/DAOs) and return plain JS objects or throw domain errors.
  - This layer is where unit tests should focus (mocking models).

- `models/`
  - Mongoose schemas, statics, instance methods and pre/post hooks.
  - Implement domain invariants (schema-level validation) and helper methods like `generateAuthToken` or `comparePassword`.
  - Prefer `pre('save')` hooks for password hashing instead of handling hashing in controllers for consistency.

- `middlewares/`
  - Authentication, authorization, request logging, input sanitization, and centralized error handling.
  - Keep middleware small and focused; use composition.

- `db/`
  - Database connection logic and reconnection handling. Export a single `connectToDb()` function.

- `README.md`, `package.json`
  - Project-level documentation and dependency metadata. Keep README focused on endpoints, required env vars, and run instructions.

---

## Code & API conventions

- Validation: keep request validation in `routes/` (or move validators into `validators/` for reuse). Use `express-validator` to produce consistent error objects.
- Responses: return consistent JSON envelopes, e.g. `{ success: true, data: ... }` or `{ error: { code, message } }` for errors.
- Errors: throw Error instances from services for domain errors; controllers forward errors with `next(err)` and the centralized error handler maps them to HTTP responses.
- Async handling: always handle async functions with `try/catch` (or use `express-async-errors` / `express-async-handler`) so exceptions propagate to the error handler.

Example controller pattern:

```
// controllers/example.controller.js
const exampleService = require('../services/example.service');

module.exports.create = async (req, res, next) => {
  try {
    const result = await exampleService.create(req.body);
    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
};
```

Example service pattern:

```
// services/example.service.js
const Model = require('../models/example.model');

module.exports.create = async (payload) => {
  // domain rules, calls to Model, other services
  const created = await Model.create(payload);
  return created;
};
```

## Model best-practices (Mongoose)

- Use schema-level validation for field constraints and data types.
- Use `select: false` on sensitive fields (e.g., password) and explicit `.select('+password')` when you need it for comparison.
- Use `schema.pre('save', ...)` to hash passwords when `password` is modified. Example:

```
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
```

- Implement instance methods for actions related to the document (e.g., `comparePassword`, `generateAuthToken`). Keep these methods minimal and testable.

## Authentication middleware notes

Current `auth.middleware.js` attempts to read the token from cookies or authorization header but may crash if the header is missing because it uses `.split(' ')[1]` without checking. Use a safer approach:

```
const authHeader = req.headers.authorization;
let token = req.cookies?.token;
if (!token && authHeader && authHeader.startsWith('Bearer ')) {
  token = authHeader.split(' ')[1];
}
if (!token) return res.status(401).json({ message: 'Unauthorized' });
```

Also verify token expiration and try/catch jwt verification to forward errors.

## Error handling

- Add a centralized error handler middleware (registered last in `app.js`). Example:

```
function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: { message: err.message || 'Internal Server Error' } });
}

app.use(errorHandler);
```

- Normalize thrown errors from services with a consistent shape (e.g., include `status` for HTTP code).

## Security recommendations

- Store `JWT_SECRET`, DB credentials and other secrets in environment variables (e.g., `.env`).
- Use `httpOnly` and `secure` flags on cookies if you store tokens in cookies.
- Use `helmet`, `express-mongo-sanitize`, and `xss-clean` to reduce application-layer attack surface.
- Apply rate limiting on auth endpoints (e.g., `express-rate-limit`).

## Validation & sanitization

- Keep validation schemas close to routes or in a dedicated `validators/` folder and compose them in the router.
- Use `express-validator` for field validation and sanitize inputs before passing to services.

## Logging

- Replace `console.log` with a structured logger (pino, winston). Log at different levels and redact sensitive fields.

## Testing

- Unit tests: target `services/` and `models/` by mocking dependencies.
- Integration tests: use `supertest` against an in-memory DB (e.g., `mongodb-memory-server`) to test routes end-to-end.
- Suggested npm scripts:

```
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js",
  "test": "jest --runInBand"
}
```

## Environment variables (example `.env`)

```
PORT=3000
DB_CONNECT=mongodb://localhost:27017/your-db
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

## Project bootstrapping (copy to a new project)

1. Copy the directory structure: `controllers/`, `models/`, `services/`, `routes/`, `middlewares/`, `db/`, plus `app.js` and `server.js`.
2. Create `.env` with the required environment variables.
3. Install dependencies: `npm install express mongoose bcrypt jsonwebtoken express-validator cookie-parser cors dotenv` plus dev tools (`nodemon`, `jest`).
4. Run database and then `npm run dev`.

## Suggested improvements / next steps

- Move validation schemas to a `validators/` folder for reuse.
- Add a centralized error class (e.g., `ApiError`) and use it in services for consistent status codes.
- Move password hashing into a model `pre('save')` hook to avoid duplication.
- Add an `error.middleware.js` and a `logger.middleware.js` and register both in `app.js`.
- Add OpenAPI (Swagger) docs for the APIs and expand `README.md` to include setup instructions.

---

If you want, I can:

- Create the suggested `validators/` and `middlewares/error.middleware.js` files and update `app.js`.
- Convert these patterns into a reusable project scaffold or a `yo`/`npm init` template.

Tell me which improvements you want me to implement next.
