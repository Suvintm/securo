import telebot
import io
from PIL import Image
from app.core.config import get_settings

settings = get_settings()

# Load from .env or fallback to hardcoded (your current style)
TELEGRAM_TOKEN = settings.TELEGRAM_BOT_TOKEN or "8493100424:AAGiwuPiZfKKa5u_wS1gWokqJdw4dKqMUBk"
CHAT_ID = settings.TELEGRAM_CHAT_ID or "7133500274"

bot = telebot.TeleBot(TELEGRAM_TOKEN, threaded=False)

def send_alert(anomaly, frame, camera):
    """
    Sends an alert message with image to Telegram when anomaly is detected.
    """
    try:
        # Convert numpy frame to image in-memory
        img = Image.fromarray(frame)
        bio = io.BytesIO()
        img.save(bio, format="JPEG")
        bio.seek(0)

        caption = (
            f"🚨 Anomaly Detected!\n\n"
            f"📷 Camera: {camera.get('name', 'Unknown')} ({camera.get('location', 'N/A')})\n"
            f"🤖 Model: {anomaly.get('model', 'Unknown')}\n"
            f"🏷️ Label: {anomaly.get('label', 'Unknown')}\n"
            f"🎯 Confidence: {anomaly.get('confidence', 0):.2f}\n"
            f"⏰ Time: {anomaly.get('timestamp', 'N/A')}"
        )

        bot.send_photo(CHAT_ID, bio, caption=caption)
        print(f"[Telegram] ✅ Alert sent successfully for {anomaly.get('label')}")
    except Exception as e:
        print(f"[Telegram] ❌ Failed to send alert: {e}")
