from app.db.mongo import sessions_col
from bson import ObjectId

async def create_session(user_id: str, user_agent: str | None, ip: str | None) -> dict:
    doc = {"user_id": user_id, "user_agent": user_agent, "ip": ip, "valid": True}
    res = await sessions_col().insert_one(doc)
    doc["_id"] = res.inserted_id
    return doc

async def invalidate_session(sid: str):
    await sessions_col().update_one({"_id": ObjectId(sid)}, {"$set": {"valid": False}})

async def is_session_valid(sid: str) -> bool:
    doc = await sessions_col().find_one({"_id": ObjectId(sid)})
    return bool(doc and doc.get("valid") is True)
