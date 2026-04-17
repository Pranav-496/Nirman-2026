"""Authentication router for AuthentiFy."""

import logging
from fastapi import APIRouter, HTTPException, Depends
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

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
        # Skip verification in local dev if using placeholder
        # In a real app, you MUST verify the token.
        if GOOGLE_CLIENT_ID == "YOUR_GOOGLE_CLIENT_ID":
            # For hackathon/demo pursposes if no real client ID is provided yet, we'll blindly decode.
            import jwt
            idinfo = jwt.decode(req.token, options={"verify_signature": False})
        else:
            idinfo = id_token.verify_oauth2_token(req.token, google_requests.Request(), GOOGLE_CLIENT_ID)
            
        email = idinfo.get("email")
        name = idinfo.get("name", "Google User")
        
        user = user_service.get_user_by_email(email)
        if not user:
            # Auto-register google users
            user = user_service.create_user(email=email, password_hash="", name=name, is_admin=True)
            
        access_token = auth_service.create_access_token(data={"sub": user["email"], "is_admin": user["is_admin"]})
        return {"access_token": access_token, "token_type": "bearer", "user": {"email": user["email"], "name": user["name"], "is_admin": user["is_admin"]}}
        
    except ValueError as e:
        logger.error(f"Google token verification failed: {e}")
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {e}")
    except Exception as e:
        logger.error(f"Google login error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
