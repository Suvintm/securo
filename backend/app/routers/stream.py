from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.features.pipeline.stream_manager import StreamManager
import time

router = APIRouter(prefix="/stream", tags=["stream"])


def generate_frames():
    """
    Generator function for MJPEG streaming.
    Continuously yields frames from StreamManager.
    """
    sm = StreamManager.get_instance()
    
    while True:
        frame_bytes = sm.get_latest_frame()
        
        if frame_bytes is not None:
            # MJPEG format: multipart/x-mixed-replace with boundary
            yield (
                b'--frame\r\n'
                b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n'
            )
        else:
            # If no frame available, send a small delay
            time.sleep(0.1)


@router.get("/video_feed")
async def video_feed():
    """
    MJPEG video stream endpoint.
    Returns live camera feed with detection bounding boxes.
    """
    return StreamingResponse(
        generate_frames(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )


@router.get("/status")
async def stream_status():
    """
    Get current stream status.
    Returns camera info and active state.
    """
    sm = StreamManager.get_instance()
    
    # Convert camera_info to JSON-safe format (remove ObjectId)
    safe_camera_info = None
    if sm.camera_info:
        safe_camera_info = {
            "name": sm.camera_info.get("name"),
            "location": sm.camera_info.get("location"),
            "source": sm.camera_info.get("source"),
            "is_active": sm.camera_info.get("is_active")
        }
    
    return {
        "active": sm.active,
        "camera_info": safe_camera_info,
        "active_models": sm.active_models,
        "has_frame": sm.latest_frame is not None
    }
