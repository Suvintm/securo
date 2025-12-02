from app.core.security import hash_password, verify_password, create_jwt
from app.repositories import users_repo, sessions_repo
from app.models.user_models import UserOut

def _user_out(doc: dict) -> UserOut:
    return UserOut(
        id=str(doc["_id"]),
        name=doc["name"],
        email=doc["email"],
        role=doc.get("role", "admin"),
    )

async def register_user(name: str, email: str, password: str) -> tuple[UserOut, str]:
    # Prevent duplicate registration
    if await users_repo.find_by_email(email):
        raise ValueError("Email already registered")

    # Validate password length
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters long")

    # Bcrypt only supports up to 72 bytes — truncate safely
    password = password[:72]

    # Hash and store
    pwd_hash = hash_password(password)
    user = await users_repo.create_user(name, email, pwd_hash, role="admin")

    # Create session + token
    session = await sessions_repo.create_session(str(user["_id"]), None, None)
    token = create_jwt(str(user["_id"]), user.get("role", "admin"), str(session["_id"]))

    return _user_out(user), token


async def login_user(email: str, password: str, user_agent: str | None, ip: str | None) -> tuple[UserOut, str]:
    user = await users_repo.find_by_email(email)

    # Validate existence
    if not user:
        raise ValueError("Invalid credentials")

    # Verify password (truncate to match hash length if needed)
    if not verify_password(password[:72], user["password_hash"]):
        raise ValueError("Invalid credentials")

    # Create session + token
    session = await sessions_repo.create_session(str(user["_id"]), user_agent, ip)
    token = create_jwt(str(user["_id"]), user.get("role", "admin"), str(session["_id"]))

    return _user_out(user), token
