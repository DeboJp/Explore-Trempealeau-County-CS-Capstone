from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional

class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    # Cognito settings
    aws_region: str
    cognito_user_pool_id: str
    cognito_app_client_id: str
    cognito_domain: str
    algorithm: str = "RS256"
    
    # DynamoDB settings
    dynamodb_table_name: str
    dynamodb_endpoint_url: Optional[str] = None  # For local DynamoDB
    
    s3_bucket_name: str
    
    @property
    def jwks_url(self) -> str:
        return (
            f"https://cognito-idp.{self.aws_region}.amazonaws.com/"
            f"{self.cognito_user_pool_id}/.well-known/jwks.json"
        )
    
    class Config:
        env_file = ".env"
        case_sensitive = False

@lru_cache()
def get_settings() -> Settings:
    return Settings()