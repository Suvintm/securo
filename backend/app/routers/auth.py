from fastapi import APIRouter, Depends, Response, Request, HTTPException
from app.models.user_models import UserCreate, UserLogin, UserOut
from app.models.auth_models import MsgOut
from app.services.auth_service import register_user, login_user
from app.core.deps import get_current_user
from app.repositories.sessions_repo import invalidate_session
from app.core.config import get_settings

router = APIRouter(prefix="/auth", tags=["auth"])
_settings = get_settings()

def set_auth_cookie(response: Response, token: str):
    response.set_cookie(
        key="accessToken",
        value=token,
        httponly=True,
        secure=False,  # ✅ keep False in local dev
        samesite="lax",  # ✅ allows localhost cookie usage
        max_age=_settings.JWT_EXPIRES_MIN * 60,
        path="/"
    )


@router.post("/register", response_model=UserOut)
async def register(payload: UserCreate, response: Response):
    try:
        user, token = await register_user(payload.name, payload.email, payload.password)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))
    set_auth_cookie(response, token)
    return user

@router.post("/login", response_model=UserOut)
async def login(payload: UserLogin, response: Response, request: Request):
    try:
        user, token = await login_user(
            payload.email, payload.password,
            user_agent=request.headers.get("user-agent"),
            ip=request.client.host if request.client else None
        )
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    set_auth_cookie(response, token)
    return user

@router.get("/me", response_model=UserOut)
async def me(current=Depends(get_current_user)):
    return UserOut(id=current["id"], name=current["name"], email=current["email"], role=current["role"])

@router.post("/logout", response_model=MsgOut)
async def logout(response: Response, current=Depends(get_current_user)):
    await invalidate_session(current["sid"])
    response.delete_cookie("accessToken", path="/")
    return MsgOut(message="Logged out")
