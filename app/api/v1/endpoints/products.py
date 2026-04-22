from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.db.models.product import Product
from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    StockUpdate
)
from app.api.deps import require_role

router = APIRouter(prefix="/products", tags=["products"])


@router.post("/", response_model=ProductResponse)
def create_product(
    data: ProductCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin"))
):
    existing_product = db.query(Product).filter(Product.barcode == data.barcode).first()

    if existing_product:
        raise HTTPException(status_code=400, detail="Barcode already exists")

    product = Product(
        name=data.name,
        barcode=data.barcode,
        price=data.price,
        stock_quantity=data.stock_quantity,
        is_active=True
    )

    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.get("/", response_model=List[ProductResponse])
def get_products(db: Session = Depends(get_db)):
    return db.query(Product).filter(Product.is_active == True).all()


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.is_active == True
    ).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return product


@router.patch("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    data: ProductUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin"))
):
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.is_active == True
    ).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if data.barcode is not None:
        existing_product = db.query(Product).filter(
            Product.barcode == data.barcode,
            Product.id != product_id
        ).first()

        if existing_product:
            raise HTTPException(status_code=400, detail="Barcode already exists")

    if data.name is not None:
        product.name = data.name

    if data.barcode is not None:
        product.barcode = data.barcode

    if data.price is not None:
        product.price = data.price

    if data.stock_quantity is not None:
        product.stock_quantity = data.stock_quantity

    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}")
def archive_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin"))
):
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.is_active == True
    ).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.is_active = False
    db.commit()

    return {"message": "Product archived successfully"}


@router.post("/{product_id}/increase-stock", response_model=ProductResponse)
def increase_stock(
    product_id: int,
    data: StockUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin"))
):
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.is_active == True
    ).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.stock_quantity += data.quantity

    db.commit()
    db.refresh(product)
    return product


@router.post("/{product_id}/decrease-stock", response_model=ProductResponse)
def decrease_stock(
    product_id: int,
    data: StockUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin"))
):
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.is_active == True
    ).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if product.stock_quantity < data.quantity:
        raise HTTPException(status_code=400, detail="Not enough stock")

    product.stock_quantity -= data.quantity

    db.commit()
    db.refresh(product)
    return product