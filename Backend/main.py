from fastapi import FastAPI
from contextlib import asynccontextmanager
from Backend.database import engine, Base
from Backend.routes import parameters
from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Database connected and models loaded!")

    yield  # Application runs here

    # Shutdown
    await engine.dispose()
    print("🛑 Database connection closed!")

app = FastAPI(
    title="Real-Time Data API",
    description="Backend service for real-time charts and parameters",
    version="1.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or list of your front-end origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(parameters.router)

@app.get("/")
def root():
    return {"message": "Backend running successfully 🚀"}