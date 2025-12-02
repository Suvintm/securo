from app.features.alerts.telegram_bot import send_alert
import numpy as np
import datetime

# Create a dummy image frame (black image)
dummy_frame = np.zeros((300, 300, 3), dtype=np.uint8)

# Dummy anomaly details
anomaly = {
    "model": "YOLOv5-Person",
    "label": "Person Detected",
    "confidence": 0.94,
    "timestamp": str(datetime.datetime.now())
}

# Dummy camera info
camera = {
    "name": "Main Entrance",
    "location": "Building A"
}

print("Sending test alert to Telegram...")
send_alert(anomaly, dummy_frame, camera)
print("✅ Test alert sent! Check your Telegram chat.")
