from app.db.mongo import get_db
from bson import ObjectId
from typing import Optional, Dict, Any, List

def cameras_col():
    return get_db()["cameras"]

def _oid(id_str: str) -> ObjectId:
    return ObjectId(id_str)

async def create_camera(doc: Dict[str, Any]) -> Dict[str, Any]:
    res = await cameras_col().insert_one(doc)
    doc["_id"] = res.inserted_id
    return doc

async def list_cameras(owner: str) -> List[Dict[str, Any]]:
    cur = cameras_col().find({"created_by": owner}).sort([("_id", -1)])
    return [d async for d in cur]

async def find_by_id(id_str: str) -> Optional[Dict[str, Any]]:
    return await cameras_col().find_one({"_id": _oid(id_str)})

async def update_camera(id_str: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    await cameras_col().update_one({"_id": _oid(id_str)}, {"$set": updates})
    return await find_by_id(id_str)

async def delete_camera(id_str: str) -> int:
    res = await cameras_col().delete_one({"_id": _oid(id_str)})
    return res.deleted_count

async def deactivate_all(except_id: Optional[str] = None, owner: Optional[str] = None):
    q: Dict[str, Any] = {}
    if owner:
        q["created_by"] = owner
    if except_id:
        q["_id"] = {"$ne": _oid(except_id)}
    await cameras_col().update_many(q, {"$set": {"is_active": False}})

async def set_active(id_str: str, is_active: bool):
    await cameras_col().update_one({"_id": _oid(id_str)}, {"$set": {"is_active": is_active}})

async def get_active_for_owner(owner: str) -> Optional[Dict[str, Any]]:
    return await cameras_col().find_one({"created_by": owner, "is_active": True})
