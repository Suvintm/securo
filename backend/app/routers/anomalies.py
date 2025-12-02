from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.services import anomalies_svc
from app.repositories.anomalies_repo import get_anomaly_file
import io

router = APIRouter(prefix="/anomalies", tags=["anomalies"])


# ---------- 1️⃣ LIST ALL ANOMALIES ----------
@router.get("/")  # ✅ removed trailing slash to avoid 307 redirects
async def get_anomalies(limit: int = 50, skip: int = 0):
    """
    📋 List all detected anomalies (from anomalies collection)
    Each record includes model, label, confidence, timestamp, camera info, image_id
    """
    try:
        items = await anomalies_svc.list_anomalies_svc(limit=limit, skip=skip)
        return {"count": len(items), "items": items}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch anomalies: {e}")


# ---------- 2️⃣ FETCH IMAGE BY ID ----------
@router.get("/{image_id}/image")
async def get_anomaly_image(image_id: str):
    """
    🖼️ Retrieve a single anomaly image from MongoDB GridFS by its ID.
    (Only used if Cloudinary image_url unavailable)
    """
    try:
        data = await get_anomaly_file(image_id)
        if not data:
            raise HTTPException(status_code=404, detail="File not found")
        return StreamingResponse(io.BytesIO(data), media_type="image/jpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading image: {e}")


# ---------- 3️⃣ DELETE ANOMALY ----------
@router.delete("/{anomaly_id}")
async def delete_anomaly_route(anomaly_id: str):
    """
    🗑️ Delete an anomaly record and its corresponding Cloudinary image
    """
    try:
        ok = await anomalies_svc.delete_anomaly_svc(anomaly_id)
        if not ok:
            raise HTTPException(status_code=404, detail="Anomaly not found")

        return {"deleted": True, "id": anomaly_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete anomaly: {e}")


# ---------- 4️⃣ BULK DELETE ANOMALIES ----------
@router.post("/bulk-delete")
async def bulk_delete_anomalies_route(request: dict):
    """
    🗑️ Delete multiple anomaly records and their corresponding Cloudinary images
    
    Request body: {"ids": ["id1", "id2", "id3"]}
    """
    try:
        anomaly_ids = request.get("ids", [])
        
        if not anomaly_ids:
            raise HTTPException(status_code=400, detail="No IDs provided")
        
        if not isinstance(anomaly_ids, list):
            raise HTTPException(status_code=400, detail="IDs must be a list")
        
        result = await anomalies_svc.delete_multiple_anomalies_svc(anomaly_ids)
        
        return {
            "deleted_count": result["deleted_count"],
            "failed_count": result["failed_count"],
            "failed_ids": result["failed_ids"],
            "message": f"Successfully deleted {result['deleted_count']} anomalies"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to bulk delete anomalies: {e}")
