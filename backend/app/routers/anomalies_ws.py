from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List

router = APIRouter(prefix="/ws", tags=["websocket"])

active_connections: List[WebSocket] = []

async def notify_all_anomalies(data: dict):
    """Broadcast anomaly to all active WebSocket clients."""
    for ws in active_connections:
        try:
            await ws.send_json(data)
        except Exception:
            continue

@router.websocket("/anomalies")
async def anomaly_ws(websocket: WebSocket):
    """WebSocket endpoint for anomaly updates."""
    await websocket.accept()
    active_connections.append(websocket)
    print("🟢 WebSocket connected")

    try:
        while True:
            await websocket.receive_text()  # keep alive
    except WebSocketDisconnect:
        active_connections.remove(websocket)
        print("🔴 WebSocket disconnected")
