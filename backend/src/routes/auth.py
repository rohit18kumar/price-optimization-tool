from fastapi import APIRouter, Depends, HTTPException, status
from core.database import get_db
from core.config import settings
from models.request import UserLogin, UserSignup
from models.response import Token, UserResponse
from core.security import verify_password, get_password_hash, create_access_token, verify_token
from utils import auth_db

router = APIRouter()

@router.post("/signup", response_model=UserResponse)
async def signup(user_data: UserSignup, conn=Depends(get_db)):
    existing = await auth_db.get_user_by_email(conn, user_data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    hashed_password = get_password_hash(user_data.password)
    user = await auth_db.create_user(
        conn, 
        user_data.email, 
        hashed_password, 
        user_data.role, 
        user_data.first_name, 
        user_data.last_name
    )
    return user

from fastapi import Response

@router.post("/login", response_model=Token)
async def login(response: Response, user_credentials: UserLogin, conn=Depends(get_db)):
    user = await auth_db.get_user_by_email(conn, user_credentials.email)
    
    if not user or not verify_password(user_credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is inactive",
        )

    access_token = create_access_token(
        data={"sub": str(user["id"]), "email": user["email"], "role": user["role"]}
    )
    
    # Set the token in an HttpOnly cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_HOURS * 3600,
        samesite="lax",
        secure=False  # Set to True in production with HTTPS
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Successfully logged out"}
@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(verify_token), conn=Depends(get_db)):
    user = await auth_db.get_user_by_id(conn, current_user["id"])
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user
