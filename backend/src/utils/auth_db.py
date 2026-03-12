from typing import Optional
from sqlalchemy import select
from models.domain import User

async def get_user_by_email(session, email: str) -> Optional[dict]:
    result = await session.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if user:
        return {
            "id": user.id,
            "email": user.email,
            "password_hash": user.password_hash,
            "role": user.role,
            "is_active": user.is_active
        }
    return None

async def get_user_by_id(session, user_id: int) -> Optional[dict]:
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user:
        return {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "first_name": user.first_name,
            "last_name": user.last_name
        }
    return None

async def create_user(session, email, password_hash, role, first_name, last_name):
    new_user = User(
        email=email,
        password_hash=password_hash,
        role=role,
        first_name=first_name,
        last_name=last_name,
        is_active=True
    )
    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)
    return {
        "id": new_user.id,
        "email": new_user.email,
        "role": new_user.role,
        "first_name": new_user.first_name,
        "last_name": new_user.last_name
    }
