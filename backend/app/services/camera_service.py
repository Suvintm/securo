from typing import Dict, Any
from fastapi import HTTPException
from app.repositories import cameras_repo

def _out(doc: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": str(doc["_id"]),
        "name": doc["name"],
        "location": doc["location"],
        "source": doc["source"],
        "is_active": bool(doc.get("is_active", False)),
        "created_by": doc["created_by"],
    }

async def create_camera_svc(payload: Dict[str, Any], owner_id: str):
    if payload.get("source") == "rtsp" and not payload.get("rtsp_url"):
        raise HTTPException(status_code=400, detail="rtsp_url required for source=rtsp")

    doc = {
        "name": payload["name"],
        "location": payload["location"],
        "source": payload.get("source", "laptop_cam"),
        "rtsp_url": payload.get("rtsp_url"),
        "is_active": False,
        "created_by": owner_id,
    }
    saved = await cameras_repo.create_camera(doc)
    return _out(saved)

async def list_cameras_svc(owner_id: str):
    cams = await cameras_repo.list_cameras(owner_id)
    return [_out(c) for c in cams]

async def update_camera_svc(cid: str, updates: Dict[str, Any], owner_id: str):
    cam = await cameras_repo.find_by_id(cid)
    if not cam or cam.get("created_by") != owner_id:
        raise HTTPException(status_code=404, detail="Camera not found")
    updated = await cameras_repo.update_camera(cid, updates)
    return _out(updated)

async def delete_camera_svc(cid: str, owner_id: str):
    cam = await cameras_repo.find_by_id(cid)
    if not cam or cam.get("created_by") != owner_id:
        raise HTTPException(status_code=404, detail="Camera not found")
    await cameras_repo.delete_camera(cid)
    return {"deleted": True}

async def start_camera_svc(cid: str, owner_id: str):
    cam = await cameras_repo.find_by_id(cid)
    if not cam or cam.get("created_by") != owner_id:
        raise HTTPException(status_code=404, detail="Camera not found")

    # Only one camera active at once
    await cameras_repo.deactivate_all(except_id=cid, owner=owner_id)
    await cameras_repo.set_active(cid, True)
    cam = await cameras_repo.find_by_id(cid)
    return _out(cam)

async def stop_camera_svc(cid: str, owner_id: str):
    cam = await cameras_repo.find_by_id(cid)
    if not cam or cam.get("created_by") != owner_id:
        raise HTTPException(status_code=404, detail="Camera not found")
    await cameras_repo.set_active(cid, False)
    cam = await cameras_repo.find_by_id(cid)
    return _out(cam)

async def get_active_camera_svc(owner_id: str):
    cam = await cameras_repo.get_active_for_owner(owner_id)
    return _out(cam) if cam else None
