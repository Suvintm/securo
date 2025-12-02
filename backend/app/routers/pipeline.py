from fastapi import APIRouter, Depends, HTTPException
from app.core.deps import require_admin
from app.repositories import cameras_repo
from app.features.pipeline.stream_manager import StreamManager

router = APIRouter(prefix="/pipeline", tags=["pipeline"])

@router.post("/start")
async def start_pipeline(current=Depends(require_admin)):
    cam = await cameras_repo.get_active_for_owner(current["id"])
    if not cam:
        raise HTTPException(status_code=400, detail="No active camera found.")
    sm = StreamManager.get_instance()
    sm.start({"id": str(cam["_id"]), **cam})
    return {"message": f"Pipeline started for camera {cam['name']}"}

@router.post("/stop")
async def stop_pipeline(current=Depends(require_admin)):
    sm = StreamManager.get_instance()
    sm.stop()
    return {"message": "Pipeline stopped"}

@router.post("/model/{model_name}/activate")
async def activate_model(model_name: str):
    """Activate a specific detection model (e.g., people, weapon, or fire)."""
    stream = StreamManager.get_instance()
    if model_name not in ["people", "weapon", "fire" , "shoplifting", "crowd", "Accident" , "Vandalism"]:  # ✅ added fire
        raise HTTPException(status_code=400, detail="Invalid model name")

    if model_name not in stream.active_models:
        stream.active_models.append(model_name)
        print(f"[PIPELINE] ✅ Activated model: {model_name}")
    return {"message": f"{model_name} model activated"}


@router.post("/model/{model_name}/deactivate")
async def deactivate_model(model_name: str):
    """Deactivate a specific detection model."""
    stream = StreamManager.get_instance()
    if model_name not in ["people", "weapon", "fire", "shoplifting", "crowd", "Accident", "Vandalism"]:  # ✅ added fire
        raise HTTPException(status_code=400, detail="Invalid model name")

    if model_name in stream.active_models:
        stream.active_models.remove(model_name)
        print(f"[PIPELINE] 🛑 Deactivated model: {model_name}")
    return {"message": f"{model_name} model deactivated"}

@router.post("/models/activate_all")
async def activate_all_models():
    """Activate all detection models."""
    stream = StreamManager.get_instance()
    stream.activate_all_models()
    return {"message": "All models activated"}

@router.post("/models/deactivate_all")
async def deactivate_all_models():
    """Deactivate all detection models."""
    stream = StreamManager.get_instance()
    stream.deactivate_all_models()
    return {"message": "All models deactivated"}
@router.get("/models/status")
async def get_model_status():
    """Return which models are active or inactive."""
    stream = StreamManager.get_instance()
    all_models = ["people", "weapon", "fire", "shoplifting", "crowd", "Accident", "Vandalism"]  # ✅ added crowd
    return {
        name: name in stream.active_models
        for name in all_models
    }
