# Backend/routes/parameters.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta
from Backend.database import get_db
from Backend import models

# --- MAIN ROUTER (Dashboard + Inventory) ---
router = APIRouter(prefix="/api", tags=["Dashboard & Inventory"])

# ================================================
# 📊 DASHBOARD ENDPOINTS
# ================================================

@router.get("/admin_info")
async def get_admin_info(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.AdminInfo))
    rows = result.fetchall()
    return [dict(row._mapping) for row in rows]


@router.get("/product_info")
async def get_product_info(db: AsyncSession = Depends(get_db)):
    """Returns a clean JSON list of products for the inventory table."""
    result = await db.execute(select(models.ProductInfo))
    products = result.scalars().all()

    return [
        {
            "product_id": p.product_id,
            "product_name": p.product_name,
            "category": p.category,
            "stock": p.stock,
            "stock_status": p.stock_status,
            "price": float(p.price or 0),
            "supplier": p.supplier,
            "created_at": p.created_at.isoformat() if p.created_at else None,
            "reviews": float(p.reviews or 0),
        }
        for p in products
    ]


@router.get("/transaction_info")
async def get_transaction_info(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.TransactionInfo))
    rows = result.fetchall()
    return [dict(row._mapping) for row in rows]


@router.get("/dashboard")
async def get_dashboard(db: AsyncSession = Depends(get_db)):
    product_result = await db.execute(select(models.ProductInfo))
    transaction_result = await db.execute(select(models.TransactionInfo))
    products = product_result.scalars().all()
    transactions = transaction_result.scalars().all()

    def normalize_name(name: str) -> str:
        return ''.join(c.lower() for c in name if c.isalnum()) if name else ''

    product_lookup = {normalize_name(p.product_name): p for p in products if p.product_name}

    total_sales = sum(t.product_price or 0 for t in transactions)
    total_products_sold = len(transactions)
    today = datetime.now().date()
    yesterday = today - timedelta(days=1)

    todays_sales = [t for t in transactions if t.date_time and t.date_time.date() == today]
    yesterdays_sales = [t for t in transactions if t.date_time and t.date_time.date() == yesterday]

    todays_sales_total = sum(t.product_price or 0 for t in todays_sales)
    todays_sales_count = len(todays_sales)
    yesterdays_sales_total = sum(t.product_price or 0 for t in yesterdays_sales)

    def monthly_total(month, year):
        return sum(
            t.product_price or 0
            for t in transactions
            if t.date_time and t.date_time.month == month and t.date_time.year == year
        )

    current_month = today.month
    previous_month = 12 if current_month == 1 else current_month - 1
    current_year = today.year
    previous_year = current_year if current_month != 1 else current_year - 1
    this_month_total = monthly_total(current_month, current_year)
    last_month_total = monthly_total(previous_month, previous_year)

    sales_change_percent = (
        ((this_month_total - last_month_total) / last_month_total) * 100
        if last_month_total else 0
    )

    revenue_change_percent = (
        ((todays_sales_total - yesterdays_sales_total) / yesterdays_sales_total) * 100
        if yesterdays_sales_total else 0
    )

    recent = sorted(transactions, key=lambda t: t.date_time or 0, reverse=True)[:5]
    recent_purchases = []
    for t in recent:
        product = product_lookup.get(normalize_name(t.product_name)) if t.product_name else None
        recent_purchases.append({
            "user_id": getattr(t, "user_id", "Unknown"),
            "product_name": getattr(t, "product_name", "Unknown Product"),
            "date_time": t.date_time.isoformat() if t.date_time else "",
            "product_price": getattr(t, "product_price", 0),
            "category": getattr(product, "category", ""),
        })

    product_sales = {}
    for t in transactions:
        if t.product_name:
            key = normalize_name(t.product_name)
            product_sales[key] = product_sales.get(key, 0) + 1

    top_selling = sorted(product_sales.items(), key=lambda x: x[1], reverse=True)[:5]
    top_selling_data = []
    for key, units in top_selling:
        product = product_lookup.get(key)
        top_selling_data.append({
            "product_name": product.product_name if product else key,
            "units_sold": units,
            "reviews": getattr(product, "reviews", 0)
        })

    stock_alerts = sorted(
        [p for p in products if (p.stock or 0) < 20],
        key=lambda p: p.stock or 0
    )
    stock_alerts_data = [
        {"product_name": p.product_name, "stock": p.stock or 0}
        for p in stock_alerts
    ]

    monthly_sales = [0] * 12
    for t in transactions:
        if t.date_time and t.product_price:
            monthly_sales[t.date_time.month - 1] += t.product_price

    return {
        "metrics": {
            "total_products_sold": total_products_sold,
            "total_sales": total_sales,
            "todays_sales_total": todays_sales_total,
            "todays_sales_count": todays_sales_count,
            "sales_change_percent": round(sales_change_percent, 2),
            "revenue_change_percent": round(revenue_change_percent, 2),
        },
        "recent_purchases": recent_purchases,
        "top_selling": top_selling_data,
        "stock_alerts": stock_alerts_data,
        "monthly_sales": monthly_sales
    }


# ================================================
# 🧾 INVENTORY ENDPOINT
# ================================================

@router.put("/update_stock/{product_id}")
async def update_product_stock(product_id: str, new_stock: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.ProductInfo).where(models.ProductInfo.product_id == product_id))
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(status_code=404, detail=f"Product ID {product_id} not found")

    product.stock = new_stock
    if new_stock <= 0:
        product.stock_status = "Out of Stock"
    elif new_stock < 10:
        product.stock_status = "Low Stock"
    else:
        product.stock_status = "In Stock"

    await db.commit()
    await db.refresh(product)

    return {
        "message": f"✅ Stock for {product.product_name} updated successfully",
        "product_id": product.product_id,
        "new_stock": product.stock,
        "stock_status": product.stock_status
    }