# Backend/routes/parameters.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from Backend.database import get_db
from Backend import models

router = APIRouter(
    prefix="/api",
    tags=["Database Tables"]
)

@router.get("/admin_info")
async def get_product_info(db: AsyncSession = Depends(get_db)):
    result = await db.execute(models.AdminInfo.__table__.select().limit(10))
    rows = result.fetchall()
    return [dict(row._mapping) for row in rows]


@router.get("/product_info")
async def get_inventory_data(db: AsyncSession = Depends(get_db)):
    result = await db.execute(models.ProductInfo.__table__.select().limit(10))
    rows = result.fetchall()
    return [dict(row._mapping) for row in rows]


@router.get("/transaction_info")
async def get_sales_data(db: AsyncSession = Depends(get_db)):
    result = await db.execute(models.TransactionInfo.__table__.select().limit(10))
    rows = result.fetchall()
    return [dict(row._mapping) for row in rows]