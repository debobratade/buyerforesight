from fastapi import APIRouter, Query
from typing import Optional
from app.schemas.user import UserCreate, UserUpdate, UserResponse, UserListResponse
from app.services import user_service

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", response_model=UserListResponse, summary="List all users")
def list_users(
    search: Optional[str] = Query(None, description="Search by name or email"),
    sort: Optional[str] = Query("created_at", description="Field to sort by: name, email, age, role, created_at"),
    order: Optional[str] = Query("asc", description="Sort direction: asc or desc"),
):
    return user_service.list_users(search=search, sort=sort, order=order)


@router.get("/{user_id}", response_model=UserResponse, summary="Get a user by ID")
def get_user(user_id: int):
    return user_service.get_user(user_id)


@router.post("", response_model=UserResponse, status_code=201, summary="Create a new user")
def create_user(payload: UserCreate):
    return user_service.create_user(payload)


@router.put("/{user_id}", response_model=UserResponse, summary="Update a user")
def update_user(user_id: int, payload: UserUpdate):
    return user_service.update_user(user_id, payload)


@router.delete("/{user_id}", status_code=200, summary="Delete a user")
def delete_user(user_id: int):
    return user_service.delete_user(user_id)
