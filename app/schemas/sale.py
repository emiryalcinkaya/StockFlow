from typing import List
from datetime import datetime
from pydantic import BaseModel, Field


class SaleItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)


class SaleCreate(BaseModel):
    items: List[SaleItemCreate] = Field(min_length=1)


class SaleItemResponse(BaseModel):
    product_id: int
    product_name: str
    quantity: int
    unit_price: float
    total_price: float

    class Config:
        from_attributes = True


class SaleResponse(BaseModel):
    id: int
    total_price: float
    created_at: datetime

    class Config:
        from_attributes = True


class SaleDetailResponse(BaseModel):
    id: int
    total_price: float
    created_at: datetime
    items: List[SaleItemResponse]

    class Config:
        from_attributes = True
