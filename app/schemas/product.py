from pydantic import BaseModel
from typing import Optional

class ProductCreate(BaseModel):
    name: str
    barcode: str
    price: float
    stock_quantity: int = 0

class ProductUpdate(BaseModel):

    name: Optional[str] = None

    barcode: Optional[str] = None

    price: Optional[float] = None

    stock_quantity: Optional[int] = None

class ProductResponse(BaseModel):
    id: int
    name: str
    barcode: str
    price: float
    stock_quantity: int

    class Config:
        from_attributes = True

class StockUpdate(BaseModel):
    quantity: int
