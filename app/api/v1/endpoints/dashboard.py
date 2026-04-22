from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.session import get_db
from app.db.models.product import Product
from app.db.models.sale import Sale

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    total_products = db.query(Product).filter(Product.is_active == True).count()

    low_stock = db.query(Product).filter(
        Product.stock_quantity < 5,
        Product.is_active == True
    ).count()

    total_sales = db.query(Sale).count()

    total_revenue = db.query(func.sum(Sale.total_price)).scalar() or 0

    return {
        "total_products": total_products,
        "low_stock": low_stock,
        "total_sales": total_sales,
        "revenue": float(total_revenue)
    }
