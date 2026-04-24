"""Authentication router for AuthentiFy."""

import logging
from fastapi import APIRouter, HTTPException, Depends, Header
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from typing import Optional

from models.schemas import RegisterRequest, LoginRequest, TokenResponse, GoogleLoginRequest
from services import user_service, auth_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Auth"])

# Will be set from env in production. Using mock for local dev fallback
GOOGLE_CLIENT_ID = "970982697264-oncb4s598t582va6jva6p092a3fdj5ip.apps.googleusercontent.com" 

@router.post("/register", response_model=TokenResponse) 
async def register(req: RegisterRequest):
    if user_service.get_user_by_email(req.email):
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_pw = auth_service.get_password_hash(req.password)
    new_user = user_service.create_user(
        email=req.email,
        password_hash=hashed_pw,
        name=req.name,
        is_admin=True # All registrants on this panel are admins
    )
    
    # Create token
    access_token = auth_service.create_access_token(data={"sub": new_user["email"], "is_admin": new_user["is_admin"]})
    return {"access_token": access_token, "token_type": "bearer", "user": {"email": new_user["email"], "name": new_user["name"], "is_admin": new_user["is_admin"]}}


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    user = user_service.get_user_by_email(req.email)
    if not user or not auth_service.verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
        
    access_token = auth_service.create_access_token(data={"sub": user["email"], "is_admin": user["is_admin"]})
    return {"access_token": access_token, "token_type": "bearer", "user": {"email": user["email"], "name": user["name"], "is_admin": user["is_admin"]}}


@router.post("/google", response_model=TokenResponse)
async def google_login(req: GoogleLoginRequest):
    try:
        idinfo = None
        
        # Try real Google token verification first
        if GOOGLE_CLIENT_ID and GOOGLE_CLIENT_ID != "YOUR_GOOGLE_CLIENT_ID":
            try:
                idinfo = id_token.verify_oauth2_token(
                    req.token, google_requests.Request(), GOOGLE_CLIENT_ID
                )
            except Exception as verify_err:
                logger.warning(f"Google token verification failed, trying decode: {verify_err}")
        
        # Fallback: decode without verification (for development/demo)
        if not idinfo:
            try:
                import jwt as pyjwt
                idinfo = pyjwt.decode(req.token, options={"verify_signature": False})
            except Exception as decode_err:
                logger.error(f"JWT decode also failed: {decode_err}")
                raise HTTPException(status_code=401, detail="Invalid Google token — could not verify or decode.")
            
        email = idinfo.get("email")
        if not email:
            raise HTTPException(status_code=401, detail="Google token does not contain an email address.")
            
        name = idinfo.get("name", "Google User")
        
        user = user_service.get_user_by_email(email)
        if not user:
            # Auto-register google users
            user = user_service.create_user(email=email, password_hash="", name=name, is_admin=True)
            
        access_token = auth_service.create_access_token(data={"sub": user["email"], "is_admin": user["is_admin"]})
        return {"access_token": access_token, "token_type": "bearer", "user": {"email": user["email"], "name": user["name"], "is_admin": user["is_admin"]}}
        
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Google token verification failed: {e}")
        raise HTTPException(status_code=401, detail=f"Google authentication failed. Please try again.")
    except Exception as e:
        logger.error(f"Google login error: {e}")
        raise HTTPException(status_code=500, detail="Authentication error. Please try again.")


@router.get("/me")
async def get_current_user(authorization: Optional[str] = Header(None)):
    """Validate token and return current user info."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.split(" ", 1)[1]
    payload = auth_service.decode_access_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Token expired or invalid")
    
    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = user_service.get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return {"email": user["email"], "name": user["name"], "is_admin": user.get("is_admin", False)}
