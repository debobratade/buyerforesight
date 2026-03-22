# buyerforesight

# User Management API

A RESTful API for managing users built with Node.js, Express, and SQLite. Follows MVC architecture with each API handler in its own file and Joi for input validation.

---

## Tech Stack

- **Runtime** — Node.js
- **Framework** — Express
- **Database** — SQLite via sql.js (pure JavaScript, no native build tools required)
- **Validation** — Joi
- **Testing** — Jest + Supertest

---

## Project Structure

```
src/
├── app.js                      # Entry point, middleware setup, server bootstrap
├── db/
│   └── database.js             # SQLite connection, query helpers
├── utils/
│   └── User.js                 # All database queries for users
├── middleware/
│   └── validate.js             # Joi validation schemas and middleware
├── routes/
│   └── users.js                # Route definitions
└── controllers/
    ├── getUsers.js
    ├── getUserById.js
    ├── createUser.js
    ├── updateUser.js
    └── deleteUser.js

tests/
└── users.test.js               # 16 integration tests
```

---

## Setup & Run

### Prerequisites
- Node.js 18 or higher
- npm

### 1. Clone the repository

```bash
git clone https://github.com/debobratade/buyerforesight.git
git checkout node_with_express
cd user-management-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the server

```bash
# Production
npm start

# Development (auto-restarts on file changes)
npm run dev
```

Server runs at **http://localhost:3000**

---

## Running Tests

```bash
npm test
```

Tests run against an in-memory SQLite database so they never touch the real `users.db` file. All 16 tests should pass.

---

## API Reference

**Base URL:** `http://localhost:3000/api/v1`

All responses follow this shape:

```json
{ "status": true, "msg": "...", "data": {} }
```

Errors follow:

```json
{ "status": false, "msg": "..." }
```

---

### Create User

**`POST /api/v1/users`**

Creates a new user.

**Request Body:**

```json
{
    "name": "Alice Smith",
    "email": "alice@example.com",
    "age": 28,
    "role": "user"
}
```

| Field   | Type    | Required | Rules                                         |
|---------|---------|----------|-----------------------------------------------|
| `name`  | string  | Yes      | Max 100 characters                            |
| `email` | string  | Yes      | Must be a valid email, must be unique         |
| `age`   | integer | No       | Between 1 and 120                             |
| `role`  | string  | No       | One of `user`, `admin`, `moderator`. Defaults to `user` |

**Success Response `201`:**

```json
{
    "status": true,
    "msg": "User created successfully",
    "data": {
        "id": 1,
        "name": "Alice Smith",
        "email": "alice@example.com",
        "age": 28,
        "role": "user",
        "created_at": "2024-01-01 10:00:00",
        "updated_at": "2024-01-01 10:00:00"
    }
}
```

**Error Responses:**

| Status | Reason                  |
|--------|-------------------------|
| `400`  | Missing or invalid fields |
| `409`  | Email already in use    |

---

### Get All Users

**`GET /api/v1/users`**

Returns a list of all users. Supports optional filtering and sorting via query parameters.

**Query Parameters:**

| Param    | Type   | Description                                               |
|----------|--------|-----------------------------------------------------------|
| `search` | string | Filter by name or email (case-insensitive)                |
| `sort`   | string | Field to sort by: `name`, `email`, `age`, `role`, `created_at` |
| `order`  | string | Sort direction: `asc` (default) or `desc`                 |

**Example:**

```
GET /api/v1/users?search=alice&sort=name&order=asc
```

**Success Response `200`:**

```json
{
    "status": true,
    "msg": "Users list",
    "data": {
        "total": 1,
        "users": [...]
    }
}
```

**Error Responses:**

| Status | Reason               |
|--------|----------------------|
| `400`  | Invalid `order` value |
| `404`  | No users found       |

---

### Get User by ID

**`GET /api/v1/users/:id`**

Returns a single user by their ID.

**Example:**

```
GET /api/v1/users/1
```

**Success Response `200`:**

```json
{
    "status": true,
    "msg": "User details",
    "data": {
        "id": 1,
        "name": "Alice Smith",
        "email": "alice@example.com",
        "age": 28,
        "role": "user",
        "created_at": "2024-01-01 10:00:00",
        "updated_at": "2024-01-01 10:00:00"
    }
}
```

**Error Responses:**

| Status | Reason            |
|--------|-------------------|
| `400`  | Invalid ID format |
| `404`  | User not found    |

---

### Update User

**`PUT /api/v1/users/:id`**

Updates one or more fields of an existing user. Only the fields you include in the request body will be changed.

**Example:**

```
PUT /api/v1/users/1
```

**Request Body** (all fields optional, send only what you want to change):

```json
{
    "name": "Alice Johnson",
    "age": 30
}
```

**Success Response `200`:**

```json
{
    "status": true,
    "msg": "User updated successfully",
    "data": {
        "id": 1,
        "name": "Alice Johnson",
        "email": "alice@example.com",
        "age": 30,
        "role": "user",
        "created_at": "2024-01-01 10:00:00",
        "updated_at": "2024-01-01 11:00:00"
    }
}
```

**Error Responses:**

| Status | Reason                        |
|--------|-------------------------------|
| `400`  | Invalid ID or no fields sent  |
| `404`  | User not found                |
| `409`  | New email is already in use   |

---

### Delete User

**`DELETE /api/v1/users/:id`**

Deletes a user by their ID.

**Example:**

```
DELETE /api/v1/users/1
```

**Success Response `200`:**

```json
{
    "status": true,
    "msg": "User deleted successfully"
}
```

**Error Responses:**

| Status | Reason            |
|--------|-------------------|
| `400`  | Invalid ID format |
| `404`  | User not found    |

---

## Assumptions & Notes

- **No external database setup needed.** The `users.db` file is created automatically in the project root when the server starts for the first time.
- **sql.js** is used instead of `better-sqlite3` because it is pure JavaScript (no native build tools or `node-gyp` required), making it installable on any machine with just `npm install`.
- **Partial updates** — the `PUT` endpoint only updates the fields you explicitly send. Omitted fields remain unchanged.
- **Sort injection protection** — the `sort` query parameter is validated against a whitelist of allowed column names before being used in a SQL query.
- **Tests use in-memory SQLite** — running `npm test` never reads from or writes to `users.db`.

