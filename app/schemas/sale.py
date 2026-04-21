from pydantic import BaseModel
from typing import List


class SaleItemCreate(BaseModel):
    product_id: int
    quantity: int


class SaleCreate(BaseModel):
    items: List[SaleItemCreate]


class SaleResponse(BaseModel):
    id: int
    total_price: float

    class Config:
        from_attributes = True
