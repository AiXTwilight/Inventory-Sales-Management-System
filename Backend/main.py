from fastapi import FastAPI
from contextlib import asynccontextmanager
from Backend.database import engine, Base
from Backend.routes import parameters
from fastapi.middleware.cors import CORSMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Starting up RetailDash backend...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Database connected and models loaded!")

    yield

    await engine.dispose()
    print("🛑 Database connection closed!")


app = FastAPI(
    title="RetailDash API",
    description="Backend service for Dashboard, Inventory & Retail Management",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change later to ["http://127.0.0.1:5500"] for security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(parameters.router)

@app.get("/")
async def root():
    return {"message": "Backend running successfully 🚀"}