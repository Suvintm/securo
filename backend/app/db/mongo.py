from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
from app.core.config import get_settings

settings = get_settings()

# Async client (for normal CRUD)
_async_client: AsyncIOMotorClient | None = None

# Sync client (for GridFS)
_sync_client: MongoClient | None = None


def get_client() -> AsyncIOMotorClient:
    global _async_client
    if _async_client is None:
        _async_client = AsyncIOMotorClient(settings.MONGO_URI)
    return _async_client


def get_db():
    """Return async DB instance for Motor."""
    return get_client()[settings.MONGO_DB]


def get_sync_db():
    """Return sync DB instance for GridFS (PyMongo)."""
    global _sync_client
    if _sync_client is None:
        _sync_client = MongoClient(settings.MONGO_URI)
    return _sync_client[settings.MONGO_DB]


# Common collections
def users_col():
    return get_db()["users"]


def sessions_col():
    return get_db()["sessions"]
