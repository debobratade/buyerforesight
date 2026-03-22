# User Management API — Python / FastAPI

A RESTful API for managing users, built with **FastAPI** and **SQLite** (via Python's built-in `sqlite3` module). 

---

## Tech Stack

| Layer       | Choice                          |
|-------------|--------------------------------|
| Framework   | FastAPI 0.115                  |
| Server      | Uvicorn (ASGI)                 |
| Database    | SQLite (built-in `sqlite3`)    |
| Validation  | Pydantic v2                    |
| Tests       | pytest + httpx                 |

---

## Project Structure

```
user-management-fastapi/
├── app/
│   ├── main.py              # App factory, lifespan, error handlers
│   ├── db/
│   │   └── database.py      # Singleton SQLite connection + init_db()
│   ├── routers/
│   │   └── users.py         # Route definitions
│   ├── schemas/
│   │   └── user.py          # Pydantic request/response models
│   └── services/
│       └── user_service.py  # Business logic (list, get, create, update, delete)
├── tests/
│   └── test_users.py        # 15 pytest tests (in-memory DB)
├── requirements.txt
└── README.md
```

---

## Setup & Run

### Prerequisites
- Python 3.11 or higher
- `pip`

### 1. Clone & enter the project

```bash
git clone https://github.com/debobratade/buyerforesight
git checkout python_with_fastapi
cd user-management-fastapi
```

### 2. Create a virtual environment

```bash
python -m venv .venv
source .venv/bin/activate      # macOS / Linux
.venv\Scripts\activate         # Windows
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the server

```bash
uvicorn app.main:app --reload
```

The API will be available at **http://localhost:8000**

### 5. Interactive API docs

FastAPI ships with built-in Swagger UI:

```
http://localhost:8000/docs
```

---

## Running Tests

```bash
pytest tests/ -v
```

Tests use an in-memory SQLite database — no file is created or modified.

---

## API Reference

Base path: `/api/v1`

### `GET /api/v1/users`
List all users. Supports optional query parameters:

| Parameter | Type   | Description                                          |
|-----------|--------|------------------------------------------------------|
| `search`  | string | Filter by name or email (case-insensitive substring) |
| `sort`    | string | Field to sort by: `name`, `email`, `age`, `role`, `created_at` (default) |
| `order`   | string | `asc` (default) or `desc`                           |

**Example:**
```
GET /api/v1/users?search=alice&sort=name&order=asc
```

**Response `200`:**
```json
{
  "total": 1,
  "users": [
    {
      "id": 1,
      "name": "Alice Smith",
      "email": "alice@example.com",
      "age": 28,
      "role": "user",
      "created_at": "2024-01-01 10:00:00",
      "updated_at": "2024-01-01 10:00:00"
    }
  ]
}
```

---

### `GET /api/v1/users/:id`
Get a single user by ID.

**Response `200`:** User object  
**Response `404`:** `{ "detail": "User 99 not found" }`

---

### `POST /api/v1/users`
Create a new user.

**Request body:**
```json
{
  "name": "Alice Smith",
  "email": "alice@example.com",
  "age": 28,
  "role": "user"
}
```

| Field   | Required | Rules                                    |
|---------|----------|------------------------------------------|
| `name`  | ✅       | 1–100 characters                         |
| `email` | ✅       | Valid email, must be unique              |
| `age`   | ❌       | Integer 1–120                            |
| `role`  | ❌       | One of `user`, `admin`, `moderator` (default: `user`) |

**Response `201`:** Created user object  
**Response `409`:** Email already in use  
**Response `422`:** Validation error

---

### `PUT /api/v1/users/:id`
Update a user. Only include the fields you want to change (partial update).

**Request body** (all fields optional):
```json
{
  "name": "Alice Johnson",
  "age": 29
}
```

**Response `200`:** Updated user object  
**Response `400`:** No fields provided  
**Response `404`:** User not found  
**Response `409`:** Email already in use

---

### `DELETE /api/v1/users/:id`
Delete a user by ID.

**Response `200`:** `{ "message": "User 1 deleted successfully" }`  
**Response `404`:** User not found

---

## Error Response Format

All errors follow a consistent shape:

```json
{ "detail": "Human-readable error message" }
```

Validation errors include a breakdown:

```json
{
  "detail": "Validation error",
  "errors": [
    { "field": "body.email", "message": "value is not a valid email address" }
  ]
}
```

---

## Assumptions & Notes

- **Database file** (`users.db`) is created automatically in the project root on first run and is gitignored. No migration tool is needed.
- **Partial updates** — `PUT` only modifies fields explicitly included in the request body. Omitted fields are left unchanged.
- **Sort injection protection** — the `sort` query parameter is validated against a whitelist of allowed column names before being interpolated into SQL.
- **Role values** are restricted to `user`, `admin`, and `moderator`.
- **`check_same_thread=False`** is set on the SQLite connection to allow FastAPI's thread-pool executor to safely reuse the connection across async route handlers.
