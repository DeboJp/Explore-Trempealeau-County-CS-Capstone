from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict
from functools import lru_cache
from app.config import get_settings
from app.auth.cognito import CognitoVerifier

security = HTTPBearer()

@lru_cache()
def get_cognito_verifier() -> CognitoVerifier:
    """Create singleton CognitoVerifier instance"""
    settings = get_settings()
    return CognitoVerifier(
        jwks_url=settings.jwks_url,
        region=settings.aws_region,
        user_pool_id=settings.cognito_user_pool_id,
        app_client_id=settings.cognito_app_client_id
    )

async def verify_access_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    verifier: CognitoVerifier = Depends(get_cognito_verifier)
) -> Dict:
    """
    Dependency to verify access token
    Use this for API authorization
    """
    token = credentials.credentials
    return verifier.verify_token(token, token_use="access")

async def verify_id_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    verifier: CognitoVerifier = Depends(get_cognito_verifier)
) -> Dict:
    """
    Dependency to verify ID token
    Use this to get full user information
    """
    token = credentials.credentials
    return verifier.verify_token(token, token_use="id")

def get_current_username(token_payload: Dict = Depends(verify_access_token)) -> str:
    """Extract username from verified token"""
    username = token_payload.get("username")
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username not found in token"
        )
    return username

