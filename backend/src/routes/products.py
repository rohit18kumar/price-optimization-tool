from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from core.database import get_db
from models.request import ProductCreate
from models.response import ProductResponse
from core.security import verify_token, RoleChecker
from utils import product_db, forecast_db

router = APIRouter()

@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    current_user: dict = Depends(RoleChecker(["admin", "supplier"])),
    conn=Depends(get_db),
):
    return await product_db.create_new_product(conn, product_data)

@router.get("/", response_model=List[ProductResponse])
async def get_products(
    category: Optional[str] = Query(None, min_length=1, max_length=50),
    search: Optional[str] = Query(None, min_length=1, max_length=50),
    current_user: dict = Depends(RoleChecker(["admin", "buyer", "supplier"])),
    conn=Depends(get_db),
):
    return await product_db.get_all_products(conn, category=category, search=search)

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    current_user: dict = Depends(RoleChecker(["admin"])),
    conn=Depends(get_db),
):
    existing = await product_db.get_product_by_id(conn, product_id)
    if existing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
    await product_db.delete_product_by_id(conn, product_id)

@router.patch("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_data: ProductCreate,
    current_user: dict = Depends(RoleChecker(["admin", "supplier"])),
    conn=Depends(get_db),
):
    existing = await product_db.get_product_by_id(conn, product_id)
    if existing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
    await product_db.update_product_by_id(conn, product_id, product_data)
    price_changed = float(existing.get("selling_price") or 0) != float(product_data.selling_price)
    units_changed = int(existing.get("units_sold") or 0) != int(product_data.units_sold or 0)
    if price_changed or units_changed:
        await forecast_db.recalculate_category(conn, existing["category"])
    updated = await product_db.get_product_by_id(conn, product_id)
    return updated
