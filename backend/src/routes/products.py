from fastapi import APIRouter, Depends, HTTPException, status
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

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.product_id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    db.delete(product)
    db.commit()