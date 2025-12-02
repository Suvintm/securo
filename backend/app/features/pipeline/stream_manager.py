import cv2
import datetime
import threading
import time
import asyncio
from app.features.alerts.telegram_bot import send_alert
from app.services.anomalies_svc import create_anomaly_svc
from app.features.yolo.loader import load_model
from app.core.config import get_settings


class StreamManager:
    """Singleton manager to handle live video streaming + YOLO detection"""

    _instance = None
    _lock = threading.Lock()

    def __init__(self):
        self.active = False
        self.camera_info = None
        self.models = {}
        self.thread = None
        self.cap = None
        self.active_models = []
        self.last_frame = None
        self.latest_frame = None  # ✅ Store latest annotated frame for web streaming
        self.last_alert_time = 0
        self.detection_timers = {}  # ✅ Track how long an object has been visible
        self.settings = get_settings()

        # ✅ Load all models individually to prevent one failure from stopping others
        model_files = {
            "people": "people.pt",
            "weapon": "weapon.pt",
            "fire": "fire.pt",
            "shoplifting": "shoplifting.pt",
            "crowd": "crowd.pt",
            "Accident": "Accident.pt",
            "Vandalism": "Vandalism.pt"
        }

        for name, filename in model_files.items():
            try:
                self.models[name] = load_model(filename)
                print(f"[MODEL] ✅ Loaded {name}")
            except Exception as e:
                print(f"[ERROR] Failed to load {name}: {e}")

        print(f"[MODEL] ✅ YOLO models loading process complete. Loaded: {list(self.models.keys())}")

        # ✅ Activate all successfully loaded models by default
        self.active_models = list(self.models.keys())

    def activate_all_models(self):
        """Activate all available models."""
        self.active_models = list(self.models.keys())
        print(f"[STREAM] ✅ All models activated: {self.active_models}")

    def deactivate_all_models(self):
        """Deactivate all models."""
        self.active_models = []
        print("[STREAM] 🛑 All models deactivated.")

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = StreamManager()
        return cls._instance

    def start(self, camera_info):
        if self.active:
            print("[WARN] Stream already running. Restarting...")
            self.stop()

        self.camera_info = camera_info
        print(f"[INFO] Starting camera: {camera_info['name']} ({camera_info['location']})")

        source = 0 if camera_info["source"] == "laptop_cam" else camera_info.get("rtsp_url")
        self.cap = cv2.VideoCapture(source)

        if not self.cap.isOpened():
            print("[ERROR] ❌ Unable to open camera source.")
            self.active = False
            return

        self.active = True
        self.thread = threading.Thread(target=self._process_stream, daemon=True)
        self.thread.start()
        print("[INFO] 🚀 Stream thread started.")

    def stop(self):
        if not self.active:
            print("[INFO] Stream already stopped.")
            return

        print("[INFO] 🛑 Stopping camera stream...")
        self.active = False

        if self.thread and self.thread.is_alive():
            self.thread.join(timeout=2)

        if self.cap:
            self.cap.release()
            self.cap = None

        try:
            cv2.destroyAllWindows()
        except Exception:
            pass

        print("[INFO] ✅ Stream stopped successfully.")

    def get_latest_frame(self):
        """
        Return latest annotated frame as JPEG bytes for web streaming.
        Returns None if no frame is available.
        """
        if self.latest_frame is not None:
            try:
                _, buffer = cv2.imencode('.jpg', self.latest_frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
                return buffer.tobytes()
            except Exception as e:
                print(f"[ERROR] Failed to encode frame: {e}")
                return None
        return None

    def _process_stream(self):
        print("[INFO] 🔍 Detection loop started.")

        while self.active and self.cap and self.cap.isOpened():
            ret, frame_bgr = self.cap.read()
            if not ret:
                print("[WARN] ⚠️ Failed to read frame.")
                break

            frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
            
            # ✅ Track which labels are seen in THIS frame
            current_frame_labels = set()

            for model_name in self.active_models:
                model = self.models.get(model_name)
                if not model:
                    continue

                try:
                    results = model(frame_rgb)
                    detections = results.pandas().xyxy[0]

                    for _, det in detections.iterrows():
                        label = det["name"]
                        conf = float(det["confidence"])
                        x1, y1, x2, y2 = map(int, [det["xmin"], det["ymin"], det["xmax"], det["ymax"]])

                        # ✅ Use dynamic threshold from settings
                        # Reload settings to ensure we have the latest values
                        current_settings = get_settings()
                        
                        # 1️⃣ Alert Threshold (High confidence needed)
                        alert_threshold = current_settings.MODEL_THRESHOLDS.get(model_name, current_settings.MODEL_THRESHOLDS["default"])
                        
                        # 2️⃣ Display Threshold (Lower confidence okay for visual)
                        display_threshold = current_settings.DISPLAY_THRESHOLDS.get(model_name, current_settings.DISPLAY_THRESHOLDS["default"])
                        
                        # [DEBUG] Print every detection to see why alerts might be skipped
                        # print(f"[DEBUG] Detected: {label} | Conf: {conf:.2f} | Display Thresh: {display_threshold} | Alert Thresh: {alert_threshold}")

                        # ✅ Only process/draw if confidence is above DISPLAY threshold
                        if conf > display_threshold:
                            # ✅ Detection color coding
                            if model_name == "people":
                                color = (0, 255, 0)
                            elif model_name == "weapon":
                                color = (0, 0, 255)
                            elif model_name == "fire":
                                color = (0, 165, 255)
                            elif model_name == "shoplifting":
                                color = (255, 0, 255)
                            elif model_name == "crowd":
                                color = (255, 140, 0)
                            elif model_name == "Accident":
                                color = (255, 255, 0)
                            elif model_name == "Vandalism":
                                color = (0, 255, 255)
                            else:
                                color = (255, 255, 255)

                            cv2.rectangle(frame_bgr, (x1, y1), (x2, y2), color, 2)
                            cv2.putText(
                                frame_bgr,
                                f"{label} {conf:.2f}",
                                (x1, max(y1 - 10, 20)),
                                cv2.FONT_HERSHEY_SIMPLEX,
                                0.6,
                                color,
                                2,
                            )
                            
                            # ✅ Check for ALERT threshold (stricter)
                            if conf > alert_threshold:
                                persistence_seconds = getattr(current_settings, "DETECTION_PERSISTENCE_SECONDS", 3.0)
                                current_frame_labels.add(label)
                                
                                # Start timer if new
                                if label not in self.detection_timers:
                                    self.detection_timers[label] = time.time()
                                    print(f"[TIMER] ⏳ Started tracking {label}...")
                                
                                # Check duration
                                duration = time.time() - self.detection_timers[label]
                                
                                if duration >= persistence_seconds:
                                    now = time.time()
                                    if now - self.last_alert_time > 2:  # 🔽 shorter cooldown for testing
                                        self.last_alert_time = now
                                        anomaly = {
                                            "model": model_name,
                                            "label": label,
                                            "confidence": conf,
                                            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                                        }

                                    print(f"[ALERT] 🚨 {label} detected ({conf:.2f}) via {model_name} (Duration: {duration:.1f}s)")
                                    print(f"[DEBUG] camera_info={self.camera_info}")

                                    if self.camera_info and isinstance(self.camera_info, dict):
                                        try:
                                            send_alert(anomaly, frame_bgr, self.camera_info)
                                        except Exception as e:
                                            print(f"[ERROR] Telegram alert failed: {e}")

                                        # ✅ Always attempt to save anomaly
                                        try:
                                            loop = asyncio.get_event_loop()
                                        except RuntimeError:
                                            loop = None

                                        if loop and loop.is_running():
                                            asyncio.run_coroutine_threadsafe(
                                                create_anomaly_svc(anomaly, frame_bgr, self.camera_info),
                                                loop,
                                            )
                                        else:
                                            asyncio.run(
                                                create_anomaly_svc(anomaly, frame_bgr, self.camera_info)
                                            )
                                    else:
                                        print("[WARN] ⚠️ Camera info not set yet — skipping alert save.")

                except Exception as e:
                    print(f"[ERROR] Detection error in {model_name}: {e}")
            
            # ✅ Reset timers for labels NOT seen in this frame
            for label in list(self.detection_timers.keys()):
                if label not in current_frame_labels:
                    print(f"[TIMER] 🔄 Reset tracking for {label} (lost)")
                    del self.detection_timers[label]

            # 🎥 Store latest frame for web streaming (instead of cv2.imshow)
            self.latest_frame = frame_bgr.copy()
            
            # Small delay to prevent overwhelming CPU
            time.sleep(0.03)  # ~30 FPS
            
            if not self.active:
                break

        print("[INFO] Detection loop exiting.")
        try:
            cv2.destroyAllWindows()
        except Exception:
            pass
