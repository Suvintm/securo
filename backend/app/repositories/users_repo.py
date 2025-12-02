from app.db.mongo import users_col
from bson import ObjectId
from typing import Optional

async def find_by_email(email: str) -> Optional[dict]:
    return await users_col().find_one({"email": email})

async def create_user(name: str, email: str, password_hash: str, role: str = "admin") -> dict:
    doc = {"name": name, "email": email, "password_hash": password_hash, "role": role}
    res = await users_col().insert_one(doc)
    doc["_id"] = res.inserted_id
    return doc

async def find_by_id(user_id: str) -> Optional[dict]:
    return await users_col().find_one({"_id": ObjectId(user_id)})
