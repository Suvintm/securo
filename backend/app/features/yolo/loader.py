from pathlib import Path
import pathlib
import torch
import traceback
import logging



import platform
import pathlib

# ✅ Cross-platform compatibility: Allow loading models trained on different OS
# This MUST run before any torch.load happens
if platform.system() == 'Linux':
    pathlib.WindowsPath = pathlib.PosixPath
elif platform.system() == 'Windows':
    pathlib.PosixPath = pathlib.WindowsPath

logging.getLogger("yolo_loader").setLevel(logging.DEBUG)

MODEL_ROOT = Path(__file__).resolve().parents[2] / "ai_models"
YOLOV5_ROOT = Path(__file__).resolve().parents[2] / "yolov5"
_cache = {}

print(f"[DEBUG] MODEL_ROOT={MODEL_ROOT} exists={MODEL_ROOT.exists()}")
print(f"[DEBUG] YOLOV5_ROOT={YOLOV5_ROOT} exists={YOLOV5_ROOT.exists()}")

from app.core.config import get_settings
import urllib.request
import os

def model_path(filename: str) -> str:
    """
    Returns path to model file. If not found locally, returns GitHub release URL.
    
    Args:
        filename: Name of the model file (e.g., 'weapon.pt')
        
    Returns:
        str: Local path or remote URL to the model
    """
    path = MODEL_ROOT / filename
    
    # If model exists locally, use local path
    if path.exists():
        print(f"[MODEL] ✅ Using local model: {filename}")
        return str(path)
    
    # Model not found locally - use remote URL
    print(f"[MODEL] ⚠️ Model file not found locally: {filename}")
    
    get_settings.cache_clear()  # Force reload settings to get latest URLs
    settings = get_settings()
    url = settings.MODEL_URLS.get(filename)
    
    if not url or "your-username" in url:
        raise FileNotFoundError(
            f"[ERROR] Model {filename} missing and no valid URL configured in settings.MODEL_URLS."
        )
    
    print(f"[MODEL] 🌐 Using remote model from: {url}")
    return url

def load_model(filename: str):
    """
    Load YOLOv5 model from local path or remote URL.
    Models are cached after first load for performance.
    
    Args:
        filename: Name of the model file (e.g., 'weapon.pt')
        
    Returns:
        Loaded YOLOv5 model
    """
    print(f"[MODEL] 🔄 Attempting to load model: {filename}")
    
    if filename in _cache:
        print(f"[MODEL] 💾 Cached model loaded: {filename}")
        return _cache[filename]

    try:
        weights = model_path(filename)  # Returns local path or remote URL
        print(f"[MODEL] 📍 Model path resolved: {weights}")
    except Exception as e:
        print(f"[MODEL] ❌ Failed to resolve model path for {filename}: {e}")
        raise
    
    # Determine if it's a URL or local path
    is_url = weights.startswith("http://") or weights.startswith("https://")
    
    if is_url:
        print(f"[MODEL] 🌐 Loading YOLOv5 model from remote URL: {weights}")
    else:
        print(f"[MODEL] 📁 Loading YOLOv5 model from local path: {weights}")
    
    repo = str(YOLOV5_ROOT.resolve())
    print(f"[MODEL] 📂 Using local YOLOv5 repo: {repo}")
    print(f"[MODEL] 📂 YOLOv5 repo exists: {YOLOV5_ROOT.exists()}")
    
    # Check if hubconf.py exists
    hubconf_path = YOLOV5_ROOT / "hubconf.py"
    print(f"[MODEL] 📄 hubconf.py exists: {hubconf_path.exists()}")
    if not hubconf_path.exists():
        print(f"[MODEL] ❌ CRITICAL: hubconf.py not found at {hubconf_path}")
        raise FileNotFoundError(f"hubconf.py not found at {hubconf_path}")

    try:
        print(f"[MODEL] 🔧 Calling torch.hub.load...")
        # torch.hub.load can handle both local paths and URLs
        model = torch.hub.load(repo, "custom", path=weights, source="local", force_reload=True)
        print(f"[MODEL] ✅ Loaded YOLOv5 model successfully: {filename}")
    except Exception as e:
        print(f"[MODEL] ❌ Failed to load YOLOv5 model: {filename}")
        print(f"[MODEL] ❌ Error type: {type(e).__name__}")
        print(f"[MODEL] ❌ Error message: {str(e)}")
        print(traceback.format_exc())
        raise

    _cache[filename] = model
    print(f"[MODEL] 💾 Model cached: {filename}")
    return model
