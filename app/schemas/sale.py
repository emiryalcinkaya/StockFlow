from pydantic import BaseModel
from datetime import datetime


class SaleItemCreate(BaseModel):
    product_id: int
    quantity: int


class SaleCreate(BaseModel):
    items: list[SaleItemCreate]


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
    items: list[SaleItemResponse]

    class Config:
        from_attributes = True
