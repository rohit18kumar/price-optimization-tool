from pydantic import BaseModel, EmailStr
from decimal import Decimal
from typing import Optional

# Auth Request Models
class UserSignup(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    role: str  # admin, buyer, supplier

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Product Request Models
class ProductCreate(BaseModel):
    name: str
    category: str
    cost_price: Decimal
    selling_price: Decimal
    description: Optional[str] = None
    stock_available: Optional[int] = 0
    customer_rating: Optional[Decimal] = 0.00