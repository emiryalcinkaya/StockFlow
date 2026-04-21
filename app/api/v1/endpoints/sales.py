from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user
from app.db.models.product import Product
from app.db.models.sale import Sale
from app.db.models.sale_item import SaleItem
from app.db.session import get_db
from app.schemas.sale import SaleCreate, SaleResponse, SaleDetailResponse

router = APIRouter(prefix="/sales", tags=["sales"])


@router.post("/", response_model=SaleResponse)
def create_sale(
    data: SaleCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        total_price = 0
        sale_items_data = []

        for item in data.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()

            if not product:
                raise HTTPException(
                    status_code=404,
                    detail=f"Product {item.product_id} not found"
                )

            if product.stock_quantity < item.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Not enough stock for product {product.name}"
                )

            item_total = product.price * item.quantity
            total_price += item_total

            sale_items_data.append({
                "product": product,
                "product_id": product.id,
                "quantity": item.quantity,
                "unit_price": product.price,
                "total_price": item_total
            })

        sale = Sale(total_price=total_price)
        db.add(sale)
        db.flush()

        for item_data in sale_items_data:
            sale_item = SaleItem(
                sale_id=sale.id,
                product_id=item_data["product_id"],
                quantity=item_data["quantity"],
                unit_price=item_data["unit_price"],
                total_price=item_data["total_price"]
            )
            db.add(sale_item)
            item_data["product"].stock_quantity -= item_data["quantity"]

        db.commit()
        db.refresh(sale)
        return sale

    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/", response_model=List[SaleResponse])
def get_sales(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return db.query(Sale).order_by(Sale.id.desc()).all()


@router.get("/{sale_id}", response_model=SaleDetailResponse)
def get_sale(
    sale_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    sale = (
        db.query(Sale)
        .options(joinedload(Sale.items).joinedload(SaleItem.product))
        .filter(Sale.id == sale_id)
        .first()
    )

    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")

    return sale
