import cv2
import io
import gridfs
import cloudinary
import cloudinary.uploader
from bson import ObjectId
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.db.mongo import get_db, get_sync_db
from app.core.config import get_settings
import re

# ---------- Cloudinary Setup ----------
settings = get_settings()
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

# ---------- GridFS Initialization ----------
def get_fs():
    """Return GridFS object using synchronous PyMongo DB."""
    db = get_sync_db()  # ✅ FIXED — now sync instance
    return gridfs.GridFS(db)


# ---------- Helper: Safe Serializer ----------
def serialize_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    if not doc:
        return {}

    def convert_value(v):
        if isinstance(v, ObjectId):
            return str(v)
        elif isinstance(v, datetime):
            return v.isoformat()
        elif isinstance(v, dict):
            return {k: convert_value(vv) for k, vv in v.items()}
        elif isinstance(v, list):
            return [convert_value(i) for i in v]
        return v

    safe_doc = {k: convert_value(v) for k, v in doc.items()}
    if "_id" in safe_doc:
        safe_doc["id"] = safe_doc.pop("_id")
    return safe_doc


# ---------- MongoDB Collection ----------
def anomalies_col():
    return get_db()["anomalies"]


# ---------- SAVE ANOMALY IMAGE ----------
async def save_anomaly_image(anomaly: Dict[str, Any], frame, camera: Dict[str, Any]) -> Optional[str]:
    """
    Upload anomaly image to Cloudinary,
    save optional copy in GridFS,
    and insert metadata in MongoDB.
    """
    try:
        # Encode frame as JPEG
        _, buffer = cv2.imencode(".jpg", frame)
        image_bytes = io.BytesIO(buffer)

        # Upload to Cloudinary
        upload_result = cloudinary.uploader.upload(
            image_bytes,
            folder="ai-security/anomalies",
            public_id=f"{camera.get('name','camera')}_{anomaly['label']}_{datetime.utcnow().timestamp()}",
            resource_type="image",
            overwrite=True
        )

        image_url = upload_result.get("secure_url")
        print(f"[CLOUDINARY] ✅ Uploaded image: {image_url}")

        # Save in GridFS (optional backup)
        fs = get_fs()
        metadata = {
            "camera_name": camera.get("name"),
            "camera_location": camera.get("location"),
            "model": anomaly.get("model"),
            "label": anomaly.get("label"),
            "confidence": anomaly.get("confidence"),
            "timestamp": anomaly.get("timestamp"),
            "cloudinary_url": image_url
        }
        fs.put(image_bytes.getvalue(), **metadata)
        print("[DB] ✅ Image metadata saved to GridFS")

        # Insert anomaly record in MongoDB (sync-safe for thread)
        doc = {
            "camera_name": camera.get("name", "Unknown"),
            "camera_location": camera.get("location", "Unknown"),
            "model": anomaly.get("model"),
            "label": anomaly.get("label"),
            "confidence": anomaly.get("confidence"),
            "timestamp": datetime.utcnow(),
            "image_url": image_url,
        }

        try:
            # ✅ Use synchronous DB for thread-safe insert
            sync_db = get_sync_db()
            sync_db["anomalies"].insert_one(doc)
            print("[DB] ✅ Anomaly record inserted successfully (sync mode)")

            # ✅ Broadcast anomaly event via WebSocket
            try:
                from app.routers.anomalies_ws import notify_all_anomalies
                import asyncio
                asyncio.create_task(
                    notify_all_anomalies({
                        "event": "new_anomaly",
                        "label": anomaly.get("label"),
                        "model": anomaly.get("model"),
                        "camera_name": camera.get("name", "Unknown"),
                        "confidence": anomaly.get("confidence"),
                        "image_url": image_url,
                        "timestamp": datetime.utcnow().isoformat(),
                    })
                )
                print("[WS] 🔊 Real-time anomaly broadcasted")
            except Exception as e:
                print(f"[WS] ❌ Failed to broadcast anomaly: {e}")

        except Exception as e:
            print(f"[ERROR] ❌ Failed to insert anomaly record: {e}")

        return image_url

    except Exception as e:
        print(f"[ERROR] ❌ Failed to save anomaly image or record: {e}")
        return None


# ---------- LIST ANOMALIES ----------
async def list_anomalies(limit: int = 50, skip: int = 0) -> List[Dict[str, Any]]:
    try:
        cur = anomalies_col().find().sort("timestamp", -1).skip(skip).limit(limit)
        anomalies = []
        async for doc in cur:
            anomalies.append(serialize_doc(doc))
        return anomalies
    except Exception as e:
        print(f"[ERROR] ❌ list_anomalies failed: {e}")
        return []


# ---------- DELETE ANOMALY ----------
async def delete_anomaly(anomaly_id: str) -> bool:
    """Delete anomaly record from MongoDB and its image from Cloudinary."""
    try:
        db = get_db()
        col = db["anomalies"]
        doc = await col.find_one({"_id": ObjectId(anomaly_id)})
        if not doc:
            print(f"[WARN] ⚠️ Anomaly not found: {anomaly_id}")
            return False

        # 1️⃣ Delete image from Cloudinary
        image_url = doc.get("image_url")
        if image_url:
            # Extract Cloudinary public_id
            match = re.search(r"upload/(?:v\d+/)?(.*)\.\w+$", image_url)
            if match:
                public_id = match.group(1)
                cloudinary.uploader.destroy(public_id)
                print(f"[CLOUDINARY] 🗑️ Deleted image: {public_id}")

        # 2️⃣ Delete record from MongoDB
        res = await col.delete_one({"_id": ObjectId(anomaly_id)})
        print(f"[DB] 🗑️ Deleted anomaly record: {anomaly_id}")
        return res.deleted_count > 0

    except Exception as e:
        print(f"[ERROR] ❌ delete_anomaly failed: {e}")
        return False


# ---------- BULK DELETE ANOMALIES ----------
async def delete_multiple_anomalies(anomaly_ids: List[str]) -> Dict[str, Any]:
    """
    Delete multiple anomaly records from MongoDB and their images from Cloudinary.
    
    Args:
        anomaly_ids: List of anomaly IDs to delete
        
    Returns:
        Dict with deleted_count, failed_count, and failed_ids
    """
    deleted_count = 0
    failed_count = 0
    failed_ids = []
    
    for anomaly_id in anomaly_ids:
        try:
            success = await delete_anomaly(anomaly_id)
            if success:
                deleted_count += 1
                print(f"[BULK DELETE] ✅ Deleted anomaly: {anomaly_id}")
            else:
                failed_count += 1
                failed_ids.append(anomaly_id)
                print(f"[BULK DELETE] ⚠️ Failed to delete anomaly: {anomaly_id}")
        except Exception as e:
            failed_count += 1
            failed_ids.append(anomaly_id)
            print(f"[BULK DELETE] ❌ Error deleting anomaly {anomaly_id}: {e}")
    
    print(f"[BULK DELETE] 📊 Summary: {deleted_count} deleted, {failed_count} failed")
    
    return {
        "deleted_count": deleted_count,
        "failed_count": failed_count,
        "failed_ids": failed_ids
    }


# ---------- IMAGE RETRIEVAL ----------
async def get_anomaly_file(file_id: str) -> Optional[bytes]:
    try:
        fs = get_fs()
        file = fs.get(ObjectId(file_id))
        return file.read()
    except Exception as e:
        print(f"[ERROR] ❌ get_anomaly_file failed: {e}")
        return None
