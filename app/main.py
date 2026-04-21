from fastapi import FastAPI
from sqlalchemy import text
from app.api.v1.router import api_router
from app.db.session import engine
from app.core.config import settings

app = FastAPI(title=settings.app_name)

app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def root():
    return {"message": "StockFlow API running"}


@app.get("/db-check")
def db_check():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        return {"database": "connected", "result": result.scalar()}
