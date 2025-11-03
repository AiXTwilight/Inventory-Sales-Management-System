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

@router.get("/dashboard")
async def get_dashboard(db: AsyncSession = Depends(get_db)):
    """
    Combines data from ProductInfo and TransactionInfo
    to provide metrics, charts, recent purchases, top sellers,
    and stock alerts for the dashboard.
    """

    # Fetch all products and transactions
    product_result = await db.execute(select(models.ProductInfo))
    transaction_result = await db.execute(select(models.TransactionInfo))
    products = [dict(row._mapping) for row in product_result.fetchall()]
    transactions = [dict(row._mapping) for row in transaction_result.fetchall()]

    # === Metrics ===
    total_products_sold = len(transactions)
    total_sales = sum(t.get("product_price") or 0 for t in transactions)

    today_str = date.today().isoformat()
    todays_transactions = [
        t for t in transactions
        if str(t.get("date_time", "")).startswith(today_str)
    ]
    todays_sales_total = sum(t.get("product_price") or 0 for t in todays_transactions)
    todays_sales_count = len(todays_transactions)

    # === Recent Purchases (last 5) ===
    recent_purchases = sorted(
        transactions,
        key=lambda x: x.get("date_time", ""),
        reverse=True
    )[:5]

    # === Top Selling Products (by frequency in transactions) ===
    top_counts = Counter(t["product_name"] for t in transactions)
    top_selling = [
        {"product_name": name, "units_sold": count}
        for name, count in top_counts.most_common(5)
    ]

    # === Stock Alerts (products with low stock) ===
    low_stock = sorted(
        [
            {"product_name": p["product_name"], "stock": p["stock"]}
            for p in products
            if p.get("stock", 0) < 20
        ],
        key=lambda x: x["stock"]
    )

    # === Monthly Sales for Charts ===
    monthly_sales = [0] * 12
    for t in transactions:
        try:
            dt = t["date_time"]
            if dt:
                month = int(str(dt)[5:7]) - 1
                monthly_sales[month] += t.get("product_price") or 0
        except Exception:
            pass

    return {
        "metrics": {
            "total_products_sold": total_products_sold,
            "total_sales": total_sales,
            "todays_sales_total": todays_sales_total,
            "todays_sales_count": todays_sales_count
        },
        "recent_purchases": recent_purchases,
        "top_selling": top_selling,
        "stock_alerts": low_stock,
        "monthly_sales": monthly_sales
    }