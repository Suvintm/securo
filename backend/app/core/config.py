from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List, Optional, Dict

class Settings(BaseSettings):
    APP_NAME: str = "ai-secure"
    ENV: str = "dev"
    API_PREFIX: str = "/api"
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # MongoDB configuration
    MONGO_URI: str
    MONGO_DB: str = "ai_security"

    # JWT Authentication
    JWT_SECRET: str
    JWT_EXPIRES_MIN: int = 60 * 24 * 7  # 7 days

    # CORS
    COOKIE_SECURE: bool = False
    CORS_ORIGINS: str = "http://localhost:5173"

    # Telegram configuration
    TELEGRAM_BOT_TOKEN: Optional[str] = None
    TELEGRAM_CHAT_ID: Optional[str] = None

    CLOUDINARY_CLOUD_NAME: Optional[str] = None
    CLOUDINARY_API_KEY: Optional[str] = None
    CLOUDINARY_API_SECRET: Optional[str] = None

    # Detection Thresholds
    MODEL_THRESHOLDS: Dict[str, float] = {
        "weapon": 0.85,
        "fire": 0.85,
        "people": 0.85,
        "shoplifting": 0.65,
        "crowd": 0.85,
        "Accident": 0.85,
        "Vandalism": 0.85,
        "default": 0.85
    }

    # Thresholds for Displaying Bounding Boxes (Visual only)
    DISPLAY_THRESHOLDS: Dict[str, float] = {
        "weapon": 0.40,
        "fire": 0.80,
        "people": 0.80,
        "shoplifting": 0.60,
        "crowd": 0.80,
        "Accident": 0.80,
        "Vandalism": 0.80,
        "default": 0.80
    }

    # Remote Model URLs (for auto-downloading)
    MODEL_URLS: Dict[str, str] = {
        "people.pt": "https://github.com/Suvintm/securo/releases/download/v1.0.0/people.pt",
        "weapon.pt": "https://github.com/Suvintm/securo/releases/download/v1.0.0/weapon.pt",
        "fire.pt": "https://github.com/Suvintm/securo/releases/download/v1.0.0/fire.pt",
        "shoplifting.pt": "https://github.com/Suvintm/securo/releases/download/v1.0.0/shoplifting.pt",
        "crowd.pt": "https://github.com/Suvintm/securo/releases/download/v1.0.0/crowd.pt",
        "Accident.pt": "https://github.com/Suvintm/securo/releases/download/v1.0.0/Accident.pt",
        "Vandalism.pt": "https://github.com/Suvintm/securo/releases/download/v1.0.0/Vandalism.pt",
    }

    # Persistence Logic
    DETECTION_PERSISTENCE_SECONDS: float = 5.0

    class Config:
        env_file = ".env"
        extra = "ignore"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
