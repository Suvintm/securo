import io
from datetime import datetime
from PIL import Image
import gridfs
from bson import ObjectId
from app.db.mongo import get_db

def save_frame_to_db(camera_id: str, anomaly: dict, frame) -> str:
    """Store anomaly frame into GridFS."""
    db = get_db()
    fs = gridfs.GridFS(db)
    img = Image.fromarray(frame)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    meta = {
        "camera_id": camera_id,
        "model": anomaly["model"],
        "label": anomaly["label"],
        "confidence": anomaly["confidence"],
        "timestamp": datetime.utcnow()
    }
    fid = fs.put(buf, **meta)
    return str(fid)
