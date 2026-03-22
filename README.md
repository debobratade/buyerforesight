# BuyerForesight — Backend Engineer Assessment

**Candidate:** Debobrata Dey  
**Assignment:** User Management REST API  
**Repo:** https://github.com/debobratade/buyerforesight

---

## Overview

The assignment asked to build a User Management REST API in either Python or Node.js. I completed it in **both languages** to demonstrate flexibility across stacks — each solution is a fully independent codebase living in its own branch.

| Solution | Branch | Stack |
|---|---|---|
| Node.js | `node_with_express` | Node.js, Express, SQLite, Joi |
| Python | `python_with_fastapi` | Python, FastAPI, SQLite, Pydantic |

---

## How to Run

### Node.js — Express

```bash
git checkout node_with_express
npm install
npm start
```
Server runs at **http://localhost:3000**

### Python — FastAPI

```bash
git checkout python_with_fastapi
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
Server runs at **http://localhost:8000**  
Interactive docs at **http://localhost:8000/docs**

---

## API Endpoints

Both solutions expose the same endpoints under `/api/v1/users`:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/users` | List all users |
| `GET` | `/api/v1/users?search=alice` | Search by name or email |
| `GET` | `/api/v1/users?sort=name&order=asc` | Sort results |
| `GET` | `/api/v1/users/:id` | Get a single user |
| `POST` | `/api/v1/users` | Create a user |
| `PUT` | `/api/v1/users/:id` | Update a user |
| `DELETE` | `/api/v1/users/:id` | Delete a user |

**Sample request body for POST/PUT:**

```json
{
    "name": "Alice Smith",
    "email": "alice@example.com",
    "age": 28,
    "role": "user"
}
```

**Sample response:**

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

---

## Running Tests

### Node.js
```bash
npm test
```

### Python
```bash
pytest tests/ -v
```

Both test suites run against an in-memory SQLite database and cover all endpoints including error cases.

---
