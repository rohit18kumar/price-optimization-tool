from typing import List, Optional
from sqlalchemy import select, delete, update, func
from models.domain import Product

def _product_to_dict(p: Product) -> dict:
    if not p:
        return None
    return {
        "product_id": p.product_id,
        "name": p.name,
        "category": p.category,
        "cost_price": float(p.cost_price),
        "selling_price": float(p.selling_price),
        "description": p.description,
        "stock_available": p.stock_available,
        "units_sold": p.units_sold,
        "customer_rating": float(p.customer_rating) if p.customer_rating else None,
        "demand_forecast": p.demand_forecast,
        "optimized_price": float(p.optimized_price) if p.optimized_price else None,
        "created_at": p.created_at
    }

async def get_all_products(session, category: Optional[str] = None, search: Optional[str] = None) -> List[dict]:
    query = select(Product).order_by(Product.product_id)
    
    if category:
        query = query.where(Product.category == category)
        
    if search:
        query = query.where(Product.name.ilike(f"%{search}%"))
        
    result = await session.execute(query)
    products = result.scalars().all()
    return [_product_to_dict(p) for p in products]

async def get_product_by_id(session, product_id: int) -> Optional[dict]:
    result = await session.execute(select(Product).where(Product.product_id == product_id))
    product = result.scalar_one_or_none()
    return _product_to_dict(product)

async def create_new_product(session, product_data) -> dict:
    new_product = Product(
        name=product_data.name,
        category=product_data.category,
        cost_price=product_data.cost_price,
        selling_price=product_data.selling_price,
        description=product_data.description,
        stock_available=product_data.stock_available,
        units_sold=product_data.units_sold,
        customer_rating=product_data.customer_rating,
    )
    session.add(new_product)
    await session.commit()
    await session.refresh(new_product)
    return _product_to_dict(new_product)

async def delete_product_by_id(session, product_id: int):
    await session.execute(delete(Product).where(Product.product_id == product_id))
    await session.commit()

async def update_product_by_id(session, product_id: int, product_data) -> dict:
    stmt = (
        update(Product)
        .where(Product.product_id == product_id)
        .values(
            name=product_data.name,
            category=product_data.category,
            cost_price=product_data.cost_price,
            selling_price=product_data.selling_price,
            description=product_data.description,
            stock_available=product_data.stock_available,
            units_sold=product_data.units_sold
        )
        .returning(Product)
    )
    result = await session.execute(stmt)
    updated_product = result.scalar_one_or_none()
    await session.commit()
    return _product_to_dict(updated_product)
