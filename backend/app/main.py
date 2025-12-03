from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.routers import auth, cameras, pipeline, anomalies, upload_detect, stream
from app.features.pipeline import video_feed
from app.routers import anomalies_ws  # ✅ Add WebSocket router
import warnings

warnings.filterwarnings("ignore", category=FutureWarning)

settings = get_settings()
app = FastAPI(title=settings.APP_NAME)

# ---------- Middleware ----------
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "running", "message": "Securo backend is live!"}

@app.get("/health")
async def health(): 
    return {"ok": True}

# ---------- Routers ----------
api = APIRouter(prefix=settings.API_PREFIX)
api.include_router(auth.router)
api.include_router(cameras.router)
api.include_router(pipeline.router)
api.include_router(anomalies.router)
api.include_router(video_feed.router)
api.include_router(upload_detect.router)
api.include_router(stream.router)  # ✅ Live stream endpoint
api.include_router(anomalies_ws.router)  # ✅ WebSocket route
app.include_router(api)
