import cv2
import torch
import tempfile
import base64
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.features.pipeline.stream_manager import StreamManager
from app.core.config import get_settings

settings = get_settings()

router = APIRouter(prefix="/upload", tags=["upload"])


@router.post("/detect")
async def detect_anomalies(file: UploadFile = File(...)):
    """
    Accepts an image or video, stops camera if active,
    runs YOLO detection on it using all active models.
    """
    try:
        sm = StreamManager.get_instance()

        # 🛑 Stop camera stream if active
        if sm.active:
            sm.stop()
            print("[UPLOAD] Camera stream stopped for manual detection.")

        # ✅ Check if at least one model is active
        if not sm.active_models or len(sm.active_models) == 0:
            raise HTTPException(
                status_code=400,
                detail="No models are activated. Please enable at least one model to detect anomalies."
            )

        # Save uploaded file temporarily
        suffix = Path(file.filename).suffix.lower()
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
        tmp.write(await file.read())
        tmp.close()

        detections = []
        frame = None

        # 🧠 Handle image files separately
        if suffix in [".jpg", ".jpeg", ".png", ".bmp"]:
            frame = cv2.imread(tmp.name)
            if frame is None:
                raise HTTPException(status_code=400, detail="Invalid image file")
        else:
            # Handle videos
            cap = cv2.VideoCapture(tmp.name)
            ret, frame = cap.read()
            cap.release()
            if not ret or frame is None:
                raise HTTPException(status_code=400, detail="Invalid video file")

        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Run all loaded models (use only active ones)
        for model_name in sm.active_models:
            model = sm.models.get(model_name)
            if not model:
                continue

            results = model(frame_rgb)
            df = results.pandas().xyxy[0]

            for _, det in df.iterrows():
                label = det["name"]
                conf = float(det["confidence"])
                threshold = settings.MODEL_THRESHOLDS.get(model_name, settings.MODEL_THRESHOLDS["default"])
                if conf < threshold:
                    continue

                detections.append({
                    "model": model_name,
                    "label": label,
                    "confidence": conf,
                    "bbox": [
                        int(det["xmin"]),
                        int(det["ymin"]),
                        int(det["xmax"]),
                        int(det["ymax"])
                    ]
                })

                # Draw bounding box
                cv2.rectangle(
                    frame,
                    (int(det["xmin"]), int(det["ymin"])),
                    (int(det["xmax"]), int(det["ymax"])),
                    (0, 255, 0),
                    2
                )
                cv2.putText(
                    frame,
                    f"{label} {conf:.2f}",
                    (int(det["xmin"]), max(int(det["ymin"]) - 10, 20)),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    (0, 255, 0),
                    2
                )

        # Convert final frame to Base64
        _, buffer = cv2.imencode(".jpg", frame)
        img_base64 = base64.b64encode(buffer).decode("utf-8")

        return {"detections": detections, "annotated_image": img_base64}

    except Exception as e:
        print("[ERROR] ❌ File detection failed:", e)
        raise HTTPException(status_code=500, detail=str(e))
