import cv2
import time
from fastapi import APIRouter, Response
from app.features.pipeline.stream_manager import StreamManager

router = APIRouter(prefix="/video", tags=["video"])

def generate_frames():
    stream = StreamManager.get_instance()

    while True:
        if stream.last_frame is None:
            time.sleep(0.05)
            continue

        ret, buffer = cv2.imencode(".jpg", stream.last_frame)
        if not ret:
            time.sleep(0.05)
            continue

        frame = buffer.tobytes()
        yield (
            b"--frame\r\n"
            b"Content-Type: image/jpeg\r\n\r\n" + frame + b"\r\n"
        )
        time.sleep(0.03)  # regulate frame rate

@router.get("/feed")
async def video_feed():
    """
    Stream YOLO detection frames to the frontend.
    """
    return Response(generate_frames(), media_type="multipart/x-mixed-replace; boundary=frame")
