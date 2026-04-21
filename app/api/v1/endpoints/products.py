from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models.product import Product
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate
from app.schemas.product import StockUpdate

router = APIRouter(prefix="/products", tags=["products"])


@router.post("/", response_model=ProductResponse)
def create_product(data: ProductCreate, db: Session = Depends(get_db)):
    existing_product = db.query(Product).filter(Product.barcode == data.barcode).first()

    if existing_product:
        raise HTTPException(status_code=400, detail="Barcode already exists")

    product = Product(
        name=data.name,
        barcode=data.barcode,
        price=data.price,
        stock_quantity=data.stock_quantity
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    return product


@router.get("/", response_model=list[ProductResponse])
def list_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    return products

@router.get("/{product_id}", response_model=ProductResponse)

def get_product(product_id: int, db: Session = Depends(get_db)):

    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:

        raise HTTPException(status_code=404, detail="Product not found")

    return product

@router.delete("/{product_id}")

def delete_product(product_id: int, db: Session = Depends(get_db)):

    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:

        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(product)

    db.commit()

    return {"message": "Product deleted successfully"}

@router.patch("/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, data: ProductUpdate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if data.barcode and data.barcode != product.barcode:
        existing_product = db.query(Product).filter(Product.barcode == data.barcode).first()
        if existing_product:
            raise HTTPException(status_code=400, detail="Barcode already exists")

    update_data = data.dict(exclude_unset=True)

    for key, value in update_data.items():
        setattr(product, key, value)

    db.commit()
    db.refresh(product)

    return product

@router.post("/{product_id}/increase-stock")
def increase_stock(product_id: int, data: StockUpdate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.stock_quantity += data.quantity

    db.commit()
    db.refresh(product)

    return {"message": "Stock increased", "new_stock": product.stock_quantity}

@router.post("/{product_id}/decrease-stock")
def decrease_stock(product_id: int, data: StockUpdate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if product.stock_quantity < data.quantity:
        raise HTTPException(status_code=400, detail="Not enough stock")

    product.stock_quantity -= data.quantity

    db.commit()
    db.refresh(product)

    return {"message": "Stock decreased", "new_stock": product.stock_quantity}
