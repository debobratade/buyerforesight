import sqlite3
from typing import Optional
from app.db.database import get_connection
from app.schemas.user import UserCreate, UserUpdate, UserResponse, UserListResponse
from fastapi import HTTPException


VALID_SORT_FIELDS = {"name", "email", "age", "role", "created_at"}


def _row_to_user(row: sqlite3.Row) -> UserResponse:
    return UserResponse(
        id=row["id"],
        name=row["name"],
        email=row["email"],
        age=row["age"],
        role=row["role"],
        created_at=row["created_at"],
        updated_at=row["updated_at"],
    )


def list_users(
    search: Optional[str] = None,
    sort: Optional[str] = "created_at",
    order: Optional[str] = "asc",
) -> UserListResponse:
    # Validate sort field to prevent SQL injection
    sort_field = sort if sort in VALID_SORT_FIELDS else "created_at"
    sort_order = "ASC" if order and order.lower() == "asc" else "DESC"

    query = "SELECT * FROM users"
    params: list = []

    if search:
        query += " WHERE name LIKE ? OR email LIKE ?"
        like = f"%{search}%"
        params.extend([like, like])

    query += f" ORDER BY {sort_field} {sort_order}"

    with get_connection() as conn:
        rows = conn.execute(query, params).fetchall()

    users = [_row_to_user(r) for r in rows]
    return UserListResponse(total=len(users), users=users)


def get_user(user_id: int) -> UserResponse:
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()

    if not row:
        raise HTTPException(status_code=404, detail=f"User {user_id} not found")

    return _row_to_user(row)


def create_user(payload: UserCreate) -> UserResponse:
    try:
        with get_connection() as conn:
            cursor = conn.execute(
                """
                INSERT INTO users (name, email, age, role)
                VALUES (?, ?, ?, ?)
                """,
                (payload.name, payload.email, payload.age, payload.role),
            )
            conn.commit()
            row = conn.execute(
                "SELECT * FROM users WHERE id = ?", (cursor.lastrowid,)
            ).fetchone()
        return _row_to_user(row)

    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=409, detail=f"Email '{payload.email}' is already in use"
        )


def update_user(user_id: int, payload: UserUpdate) -> UserResponse:
    # Only update fields that were explicitly provided
    updates = payload.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields provided for update")

    # Check user exists
    get_user(user_id)

    fields = ", ".join(f"{k} = ?" for k in updates)
    fields += ", updated_at = datetime('now')"
    values = list(updates.values()) + [user_id]

    try:
        with get_connection() as conn:
            conn.execute(
                f"UPDATE users SET {fields} WHERE id = ?", values  # noqa: S608
            )
            conn.commit()
            row = conn.execute(
                "SELECT * FROM users WHERE id = ?", (user_id,)
            ).fetchone()
        return _row_to_user(row)

    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=409, detail=f"Email '{updates.get('email')}' is already in use"
        )


def delete_user(user_id: int) -> dict:
    get_user(user_id)  # Raises 404 if not found
    with get_connection() as conn:
        conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
        conn.commit()
    return {"message": f"User {user_id} deleted successfully"}
