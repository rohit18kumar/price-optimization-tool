from pydantic import BaseModel
from decimal import Decimal
from typing import Optional
from datetime import datetime

# Auth Response Models
class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None

# Product Response Models
class ProductResponse(BaseModel):
    product_id: int
    name: str
    category: str
    cost_price: Decimal
    selling_price: Decimal
    description: Optional[str] = None
    stock_available: int
    units_sold: int
    customer_rating: Optional[Decimal] = None
    demand_forecast: Optional[int] = None
    optimized_price: Optional[Decimal] = None
    created_at: datetime