from fastapi import APIRouter, Depends
from typing import List, Optional
from app.models.camera_models import CameraCreate, CameraUpdate, CameraOut
from app.core.deps import require_admin
from app.services import camera_service

router = APIRouter(prefix="/cameras", tags=["cameras"])

@router.post("", response_model=CameraOut)
async def create_camera(payload: CameraCreate, current=Depends(require_admin)):
    return await camera_service.create_camera_svc(payload.model_dump(), current["id"])

@router.get("", response_model=List[CameraOut])
async def list_cameras(current=Depends(require_admin)):
    return await camera_service.list_cameras_svc(current["id"])

@router.patch("/{camera_id}", response_model=CameraOut)
async def update_camera(camera_id: str, payload: CameraUpdate, current=Depends(require_admin)):
    return await camera_service.update_camera_svc(camera_id, payload.model_dump(exclude_unset=True), current["id"])

@router.delete("/{camera_id}")
async def delete_camera(camera_id: str, current=Depends(require_admin)):
    return await camera_service.delete_camera_svc(camera_id, current["id"])

@router.post("/{camera_id}/start", response_model=CameraOut)
async def start_camera(camera_id: str, current=Depends(require_admin)):
    return await camera_service.start_camera_svc(camera_id, current["id"])

@router.post("/{camera_id}/stop", response_model=CameraOut)
async def stop_camera(camera_id: str, current=Depends(require_admin)):
    return await camera_service.stop_camera_svc(camera_id, current["id"])

@router.get("/active", response_model=Optional[CameraOut])
async def get_active(current=Depends(require_admin)):
    return await camera_service.get_active_camera_svc(current["id"])
