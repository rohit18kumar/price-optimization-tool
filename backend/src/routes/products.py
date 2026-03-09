from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from models.database import Product
from models.response import ProductResponse
from core.security import verify_token

router = APIRouter()

@router.get("/", response_model=List[ProductResponse])
def get_products(
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    products = db.query(Product).all()
    return products