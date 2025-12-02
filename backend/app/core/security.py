from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from passlib.context import CryptContext
from app.core.config import get_settings

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
_settings = get_settings()

def hash_password(password: str) -> str:
    return pwd_ctx.hash(password)

def verify_password(password: str, password_hash: str) -> bool:
    return pwd_ctx.verify(password, password_hash)

def create_jwt(sub: str, role: str, sid: str) -> str:
    now = datetime.now(timezone.utc)
    exp = now + timedelta(minutes=_settings.JWT_EXPIRES_MIN)
    payload = {"sub": sub, "role": role, "sid": sid, "iat": int(now.timestamp()), "exp": int(exp.timestamp())}
    return jwt.encode(payload, _settings.JWT_SECRET, algorithm="HS256")

def decode_jwt(token: str) -> dict | None:
    try:
        return jwt.decode(token, _settings.JWT_SECRET, algorithms=["HS256"])
    except JWTError:
        return None
