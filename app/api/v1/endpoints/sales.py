from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models.sale import Sale
from app.db.models.sale_item import SaleItem
from app.db.models.product import Product
from app.schemas.sale import SaleCreate, SaleResponse, SaleDetailResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/sales", tags=["sales"])


@router.get("/", response_model=list[SaleResponse])
def list_sales(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    sales = db.query(Sale).all()
    return sales


@router.get("/{sale_id}", response_model=SaleDetailResponse)
def get_sale(
    sale_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    sale = db.query(Sale).filter(Sale.id == sale_id).first()

    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")

    return sale


@router.post("/", response_model=SaleResponse)
def create_sale(
    data: SaleCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if not data.items:
        raise HTTPException(status_code=400, detail="Sale must contain at least one item")

    validated_items = []
    total_sale_price = 0

    for item in data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()

        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product with id {item.product_id} not found"
            )

        if item.quantity <= 0:
            raise HTTPException(
                status_code=400,
                detail="Quantity must be greater than 0"
            )

        if product.stock_quantity < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Not enough stock for product: {product.name}"
            )

        item_total = product.price * item.quantity
        total_sale_price += item_total

        validated_items.append({
            "product": product,
            "quantity": item.quantity,
            "unit_price": product.price,
            "total_price": item_total
        })

    sale = Sale(total_price=total_sale_price)
    db.add(sale)
    db.flush()

    for item_data in validated_items:
        sale_item = SaleItem(
            sale_id=sale.id,
            product_id=item_data["product"].id,
            quantity=item_data["quantity"],
            unit_price=item_data["unit_price"],
            total_price=item_data["total_price"]
        )
        db.add(sale_item)
        item_data["product"].stock_quantity -= item_data["quantity"]

    db.commit()
    db.refresh(sale)

    return sale
