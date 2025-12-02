import cv2
import numpy as np
from datetime import datetime
from typing import List, Dict
from app.core.config import get_settings
from .loader import load_model

# names of models you have
MODELS = ["people.pt", "weapon.pt"]

def detect_all(frame: np.ndarray) -> List[Dict]:
    """Run detection on all YOLO models and return anomalies list."""
    results = []
    for model_name in MODELS:
        model = load_model(model_name)
        res = model(frame)
        df = res.pandas().xyxy[0]
        for _, r in df.iterrows():
            label = r["name"]
            conf = float(r["confidence"])
            settings = get_settings()
            threshold = settings.MODEL_THRESHOLDS.get(model_name, settings.MODEL_THRESHOLDS["default"])
            if conf >= threshold:
                results.append({
                    "model": model_name,
                    "label": label,
                    "confidence": conf,
                    "timestamp": datetime.utcnow().isoformat()
                })
    return results
