from fastapi import Depends, HTTPException, status, Request
from app.core.security import decode_jwt
from app.repositories.users_repo import find_by_id
from app.repositories.sessions_repo import is_session_valid

AUTH_HEADER = "authorization"
BEARER = "bearer "

async def get_current_user(request: Request):
    token = request.cookies.get("accessToken")
    print("[DEBUG] Cookies received:", request.cookies)

    if not token:
        auth = request.headers.get(AUTH_HEADER)
        if auth and auth.lower().startswith(BEARER):
            token = auth[len(BEARER):]
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthenticated")
    print("[DEBUG] Cookies received:", request.cookies)

    payload = decode_jwt(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    sid = payload.get("sid")
    if not sid or not await is_session_valid(sid):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired")

    user_id = payload.get("sub")
    user = await find_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return {"id": str(user["_id"]), "name": user["name"], "email": user["email"], "role": user.get("role", "admin"), "sid": sid}
 


async def require_admin(current=Depends(get_current_user)):
    if current.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    return current
