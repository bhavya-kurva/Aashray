import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import engine, Base, SessionLocal, is_sqlite
from app.models import User
from app.config import settings
from app.websocket.manager import manager

# Import routers
from app.routers import auth, incidents, resources, allocation, alerts, webhooks

# Create DB Tables on Startup (perfect for prototyping/local dev)
Base.metadata.create_all(bind=engine)

def auto_seed_if_empty():
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            from seed import seed_db
            seed_db(drop_existing=False)
    except Exception as e:
        print(f"Database auto-seed check: {e}")
    finally:
        db.close()

auto_seed_if_empty()

app = FastAPI(
    title="Real-Time Disaster Management & Resource Coordination API",
    version="1.0.0",
    docs_url="/docs",  # Expose Swagger docs
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for dev simplicity
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount local storage folder for uploads static serving
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=settings.UPLOAD_DIR), name="static")

# Mount Routers under /api prefix
app.include_router(auth.router, prefix="/api")
app.include_router(incidents.router, prefix="/api")
app.include_router(resources.router, prefix="/api")
app.include_router(allocation.router, prefix="/api")
app.include_router(alerts.router, prefix="/api")
app.include_router(webhooks.router, prefix="/api")

# Real-Time WebSocket server endpoint
@app.websocket("/api/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Keep connection open and listen for heartbeat/messages
        while True:
            data = await websocket.receive_text()
            # Echo back or ignore heartbeats
            await websocket.send_text(f"heartbeat: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Disaster Management & Resource Coordination Platform API",
        "documentation": "/docs"
    }
