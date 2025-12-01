from fastapi import APIRouter, Depends
from typing import Dict

router = APIRouter()

@router.get("/public")
async def public_endpoint():
    """Public endpoint - no authentication required"""
    return {"message": "This is a public endpoint"}

@router.get("/protected")
async def protected_endpoint(
    token_payload: Dict = Depends(verify_access_token)
):
    """Protected endpoint - requires valid access token"""
    return {
        "message": "This is a protected endpoint",
        "user": token_payload.get("username"),
        "scopes": token_payload.get("scope", "").split()
    }

@router.get("/user/profile")
async def get_user_profile(
    token_payload: Dict = Depends(verify_id_token)
):
    """Get user profile from ID token"""
    return {
        "username": token_payload.get("cognito:username"),
        "email": token_payload.get("email"),
        "email_verified": token_payload.get("email_verified"),
        "sub": token_payload.get("sub"),
    }

@router.get("/user/me")
async def read_current_user(
    username: str = Depends(get_current_username),
    token_payload: Dict = Depends(verify_access_token)
):
    """Get current user info"""
    return {
        "username": username,
        "groups": token_payload.get("cognito:groups", []),
        "scopes": token_payload.get("scope", "").split()
    }
