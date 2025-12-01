import requests
from typing import Dict, Optional
from jose import jwt, JWTError
from jose.backends import RSAKey
from fastapi import HTTPException, status
from functools import lru_cache
import time

class CognitoVerifier:
    """Handles JWT token verification with AWS Cognito"""
    
    def __init__(self, jwks_url: str, region: str, user_pool_id: str, app_client_id: str):
        self.jwks_url = jwks_url
        self.region = region
        self.user_pool_id = user_pool_id
        self.app_client_id = app_client_id
        self._jwks_cache: Optional[Dict] = None
        self._cache_time: float = 0
        self._cache_duration: int = 3600  # 1 hour
    
    def _get_jwks(self) -> Dict:
        """Fetch JWKS from Cognito (with caching)"""
        current_time = time.time()
        
        if self._jwks_cache and (current_time - self._cache_time) < self._cache_duration:
            return self._jwks_cache
        
        try:
            response = requests.get(self.jwks_url, timeout=10)
            response.raise_for_status()
            self._jwks_cache = response.json()
            self._cache_time = current_time
            return self._jwks_cache
        except requests.RequestException as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Unable to fetch JWKS from Cognito"
            )
    
    def _get_signing_key(self, token_header: Dict) -> str:
        """Extract the public key from JWKS for token verification"""
        jwks = self._get_jwks()
        
        for key in jwks.get("keys", []):
            if key.get("kid") == token_header.get("kid"):
                return key
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unable to find appropriate signing key"
        )
    
    def verify_token(self, token: str, token_use: str = "access") -> Dict:
        """
        Verify JWT token from Cognito
        
        Args:
            token: JWT token string
            token_use: Either "access" or "id" token
            
        Returns:
            Decoded token payload
        """
        try:
            print("Verifying token:", token)
            print("Expected token use:", token_use)

            # Get token header without verification
            unverified_header = jwt.get_unverified_header(token)
            
            # Get the signing key
            signing_key = self._get_signing_key(unverified_header)
            
            # Verify and decode the token
            payload = jwt.decode(
                token,
                signing_key,
                algorithms=["RS256"],
                audience=self.app_client_id if token_use == "id" else None,
                options={
                    "verify_aud": token_use == "id",
                    "verify_exp": True,
                }
            )

            # Check if token is expired
            if payload.get("exp") and time.time() > payload["exp"]:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token has expired"
                )
            
            # Verify token_use claim
            if payload.get("token_use") != token_use:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=f"Token is not an {token_use} token"
                )
            
            # Verify issuer
            expected_issuer = f"https://cognito-idp.{self.region}.amazonaws.com/{self.user_pool_id}"
            if payload.get("iss") != expected_issuer:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token issuer"
                )
            
            return payload
            
        except JWTError as e:
            print("JWTError:", e)
            if("expired" in str(e).lower()):
                print("""Token expired error detected""")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Expired token"
                )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
