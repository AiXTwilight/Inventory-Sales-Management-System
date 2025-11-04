# Backend/routes/parameters.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
import random, string, re, os
from Backend.database import get_db
from Backend import models
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from dotenv import load_dotenv

# =====================================================
# INITIAL SETUP
# =====================================================
load_dotenv()
router = APIRouter(prefix="/api", tags=["Dashboard, Inventory & Retail Management"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# =====================================================
# UTILITY FUNCTIONS
# =====================================================
def generate_unique_admin_id():
    """Generate a 7-character alphanumeric unique admin ID."""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=7))

def verify_password_strength(password: str):
    """Ensure password is alphanumeric, has symbol, number, alphabet, and is 8–12 chars."""
    if len(password) < 8 or len(password) > 12:
        return False
    if len(password.encode("utf-8")) > 72:  # bcrypt limit
        return False
    if not re.search(r"[A-Za-z]", password):  # at least one letter
        return False
    if not re.search(r"\d", password):  # at least one number
        return False
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):  # at least one symbol
        return False
    return True

def send_email_via_sendgrid(to_email: str, subject: str, html_content: str):
    """Send formatted email via SendGrid."""
    sendgrid_api_key = os.getenv("SENDGRID_API_KEY")
    sender_email = os.getenv("FROM_EMAIL")
    if not sendgrid_api_key or not sender_email:
        print("❌ Missing SendGrid credentials.")
        return
    try:
        sg = SendGridAPIClient(sendgrid_api_key)
        message = Mail(from_email=sender_email, to_emails=to_email, subject=subject, html_content=html_content)
        sg.send(message)
        print(f"✅ Email sent successfully to {to_email}")
    except Exception as e:
        print(f"❌ Failed to send email: {e}")

# =====================================================
# PYDANTIC MODELS
# =====================================================
class RegisterAdmin(BaseModel):
    email: EmailStr
    password: str

class LoginAdmin(BaseModel):
    admin_id: str
    password: str

# =====================================================
# 🧾 INVENTORY LIST ENDPOINT (SORTED)
# =====================================================
@router.get("/product_info")
async def get_all_products(db: AsyncSession = Depends(get_db)):
    """Return all products sorted by stock status (critical → low → in stock)."""
    result = await db.execute(select(models.ProductInfo))
    products = result.scalars().all()

    # Define sort order: Out of Stock (critical) → Low Stock → In Stock
    def stock_priority(p):
        if p.stock == 0:
            return 0  # 🔴 Critical
        elif p.stock < 10:
            return 1  # 🟡 Low
        else:
            return 2  # 🟢 Healthy

    products_sorted = sorted(products, key=stock_priority)

    return [
        {
            "product_id": p.product_id,
            "product_name": p.product_name,
            "category": p.category,
            "stock": p.stock,
            "price": p.price,
            "stock_status": p.stock_status
        }
        for p in products_sorted
    ]

# =====================================================
# 📊 DASHBOARD ENDPOINT
# =====================================================
@router.get("/dashboard")
async def get_dashboard(db: AsyncSession = Depends(get_db)):
    """Fetch dashboard analytics and summaries."""
    product_result = await db.execute(select(models.ProductInfo))
    transaction_result = await db.execute(select(models.TransactionInfo))
    products = product_result.scalars().all()
    transactions = transaction_result.scalars().all()

    # === BASIC METRICS ===
    total_sales = sum(t.product_price or 0 for t in transactions)
    total_products_sold = len(transactions)

    today = datetime.now().date()
    yesterday = today - timedelta(days=1)
    todays_sales = [t for t in transactions if t.date_time and t.date_time.date() == today]
    yesterdays_sales = [t for t in transactions if t.date_time and t.date_time.date() == yesterday]
    todays_sales_total = sum(t.product_price or 0 for t in todays_sales)
    todays_sales_count = len(todays_sales)
    yesterdays_sales_total = sum(t.product_price or 0 for t in yesterdays_sales)

    # === MONTHLY SALES TREND ===
    monthly_sales = [0] * 12
    for t in transactions:
        if t.date_time:
            monthly_sales[t.date_time.month - 1] += t.product_price or 0

    # === TOP SELLING PRODUCTS ===
    product_sales = {}
    for t in transactions:
        if t.product_name:
            product_sales[t.product_name] = product_sales.get(t.product_name, 0) + 1

    top_selling = []
    for name, count in sorted(product_sales.items(), key=lambda x: x[1], reverse=True)[:5]:
        product_obj = next((p for p in products if p.product_name == name), None)
        top_selling.append({
            "product_name": name,
            "units_sold": count,
            "reviews": getattr(product_obj, "reviews", 0) if product_obj else 0
        })

    # === STOCK ALERTS (RED + YELLOW ONLY) ===
    stock_alerts = []
    for p in products:
        if p.stock == 0:
            level = "critical"  # 🔴 Out of Stock
        elif p.stock < 10:
            level = "warning"   # 🟡 Low Stock
        else:
            continue  # 🟢 In Stock — skip

        stock_alerts.append({
            "product_name": p.product_name,
            "stock": p.stock,
            "level": level
        })

    # Sort: critical first, then warning
    stock_alerts.sort(key=lambda x: {"critical": 0, "warning": 1}[x["level"]])

    # === RECENT PURCHASES ===
    recent_purchases = sorted(transactions, key=lambda t: t.date_time or datetime.min, reverse=True)[:5]

    # === RETURN DATA ===
    return {
        "metrics": {
            "total_products_sold": total_products_sold,
            "total_sales": total_sales,
            "todays_sales_total": todays_sales_total,
            "todays_sales_count": todays_sales_count,
            "sales_change_percent": round(
                ((todays_sales_total - yesterdays_sales_total) / yesterdays_sales_total * 100)
                if yesterdays_sales_total else 0, 2
            ),
            "revenue_change_percent": round(
                ((total_sales - sum(monthly_sales[:-1])) / sum(monthly_sales[:-1]) * 100)
                if sum(monthly_sales[:-1]) else 0, 2
            ),
        },
        "monthly_sales": monthly_sales,
        "top_selling": top_selling,
        "stock_alerts": stock_alerts,
        "recent_purchases": [
            {
                "user_id": t.user_id or "N/A",
                "product_name": t.product_name,
                "product_price": t.product_price,
                "date_time": t.date_time
            } for t in recent_purchases
        ]
    }

# =====================================================
# 🧾 INVENTORY STOCK UPDATE
# =====================================================
@router.put("/update_stock/{product_id}")
async def update_product_stock(product_id: str, new_stock: int, db: AsyncSession = Depends(get_db)):
    """Update product stock and auto-adjust status."""
    result = await db.execute(select(models.ProductInfo).where(models.ProductInfo.product_id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail=f"Product {product_id} not found")

    product.stock = new_stock
    product.stock_status = (
        "Out of Stock" if new_stock <= 0 else "Low Stock" if new_stock < 10 else "In Stock"
    )
    await db.commit()
    await db.refresh(product)
    return {
        "message": f"Stock for {product.product_name} updated",
        "product_id": product.product_id,
        "new_stock": product.stock,
        "stock_status": product.stock_status,
    }

# =====================================================
# 👤 ADMIN REGISTER & LOGIN
# =====================================================
@router.post("/register_admin")
async def register_admin(data: RegisterAdmin, db: AsyncSession = Depends(get_db)):
    """Register new admin with unique ID and SendGrid email."""
    if not verify_password_strength(data.password):
        raise HTTPException(
            status_code=400,
            detail="Password must be alphanumeric, include one special symbol, and be 8–12 characters long."
        )
    result = await db.execute(select(models.AdminInfo).where(models.AdminInfo.admin_email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered.")
    admin_id = generate_unique_admin_id()
    hashed_password = pwd_context.hash(data.password)
    new_admin = models.AdminInfo(
        admin_id=admin_id,
        admin_email=data.email,
        password=hashed_password,
        created_at=datetime.now(),
    )
    db.add(new_admin)
    await db.commit()
    html_content = f"""
    <html><body><h2>Welcome to RetailDash!</h2>
    <p>Your unique Admin ID: <strong>{admin_id}</strong></p>
    <p>Use this ID + password to sign in.</p></body></html>
    """
    send_email_via_sendgrid(data.email, "Your RetailDash Admin ID", html_content)
    return {"message": "✅ Registration successful! Check your email for Admin ID.", "admin_id": admin_id}

@router.post("/login_admin")
async def login_admin(data: LoginAdmin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.AdminInfo).where(models.AdminInfo.admin_id == data.admin_id))
    admin = result.scalar_one_or_none()
    if not admin or not pwd_context.verify(data.password, admin.password):
        raise HTTPException(status_code=401, detail="Invalid Admin ID or password.")
    return {"message": "✅ Login successful", "admin_id": admin.admin_id, "email": admin.admin_email}