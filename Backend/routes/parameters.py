# Backend/routes/parameters.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from collections import Counter
from datetime import date
from Backend.database import get_db
from Backend import models

router = APIRouter(
    prefix="/api",
    tags=["Database Tables"]
)

# === Base Table Routes (Keep for testing or debugging) ===

@router.get("/admin_info")
async def get_admin_info(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.AdminInfo))
    rows = result.fetchall()
    return [dict(row._mapping) for row in rows]

@router.get("/product_info")
async def get_product_info(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.ProductInfo))
    rows = result.fetchall()
    return [dict(row._mapping) for row in rows]

@router.get("/transaction_info")
async def get_transaction_info(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.TransactionInfo))
    rows = result.fetchall()
    return [dict(row._mapping) for row in rows]

# === Unified Dashboard Endpoint ===

router = APIRouter(
    prefix="/api",
    tags=["Dashboard"]
)

@router.get("/dashboard")
async def get_dashboard(db: AsyncSession = Depends(get_db)):
    # Fetch all transactions
    transaction_query = await db.execute(select(models.TransactionInfo))
    transactions = [t.__dict__ for t in transaction_query.scalars().all()]

    # Fetch all products (to map IDs → names)
    product_query = await db.execute(select(models.ProductInfo))
    products = [p.__dict__ for p in product_query.scalars().all()]
    product_map = {p["product_id"]: p["product_name"] for p in products if "product_id" in p}

    # Compute metrics
    total_sales = sum(t.get("product_price", 0) for t in transactions)
    total_products_sold = len(transactions)

    # Recent purchases (last 5)
    recent_purchases = sorted(transactions, key=lambda x: x.get("date_time", ""), reverse=True)[:5]
    for t in recent_purchases:
        pid = t.get("product_id")
        t["product_name"] = product_map.get(pid, "Unknown Product")

    # Top selling products (based on product_id)
    top_counts = Counter(t.get("product_id") for t in transactions)
    top_selling = []
    for pid, count in top_counts.most_common(5):
        top_selling.append({
            "product_id": pid,
            "product_name": product_map.get(pid, "Unknown Product"),
            "units_sold": count
        })

    # Stock alerts (low stock)
    stock_alerts = sorted(
        [p for p in products if p.get("stock", 9999) < 20],
        key=lambda x: x["stock"]
    )[:5]

    return {
        "metrics": {
            "total_products_sold": total_products_sold,
            "total_sales": total_sales,
            "todays_sales_total": total_sales,  # placeholder until you add date filter
            "todays_sales_count": len(transactions)
        },
        "recent_purchases": recent_purchases,
        "top_selling": top_selling,
        "stock_alerts": stock_alerts
    }