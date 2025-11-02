"""
Centralized configuration management for InvestAI platform.
Handles environment variables, API keys, and application settings.
"""

import os
from typing import Optional, List, Union
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings
import logging

class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # API Keys (optional for development)
    google_api_key: str = Field(..., env="GOOGLE_API_KEY")
    exa_api_key: str = Field(..., env="EXA_API_KEY")
    tavily_api_key: str = Field(..., env="TAVILY_API_KEY")
    
    # New fields from .env that were causing validation errors
    google_service_api_key: Optional[str] = Field(None, env="GOOGLE_SERVICE_API_KEY")
    react_app_api_url: Optional[str] = Field(None, env="REACT_APP_API_URL")
    react_app_firebase_api_key: Optional[str] = Field(None, env="REACT_APP_FIREBASE_API_KEY")
    react_app_firebase_auth_domain: Optional[str] = Field(None, env="REACT_APP_FIREBASE_AUTH_DOMAIN")
    react_app_firebase_project_id: Optional[str] = Field(None, env="REACT_APP_FIREBASE_PROJECT_ID")
    react_app_firebase_storage_bucket: Optional[str] = Field(None, env="REACT_APP_FIREBASE_STORAGE_BUCKET")
    react_app_firebase_messaging_sender_id: Optional[str] = Field(None, env="REACT_APP_FIREBASE_MESSAGING_SENDER_ID")
    react_app_firebase_app_id: Optional[str] = Field(None, env="REACT_APP_FIREBASE_APP_ID")
    google_cloud_project_id: Optional[str] = Field(None, env="GOOGLE_CLOUD_PROJECT_ID")
    google_cloud_location: Optional[str] = Field(None, env="GOOGLE_CLOUD_LOCATION")

    # Database Configuration
    database_url: str = Field(
        default="sqlite:///./investai.db",
        env="DATABASE_URL"
    )
    
    # Redis Configuration
    redis_url: str = Field(
        default="redis://localhost:6379", 
        env="REDIS_URL"
    )
    
    # Firebase Configuration
    firebase_project_id: Optional[str] = Field(None, env="FIREBASE_PROJECT_ID")
    firebase_private_key_id: Optional[str] = Field(None, env="FIREBASE_PRIVATE_KEY_ID")
    firebase_private_key: Optional[str] = Field(None, env="FIREBASE_PRIVATE_KEY")
    firebase_client_email: Optional[str] = Field(None, env="FIREBASE_CLIENT_EMAIL")
    firebase_client_id: Optional[str] = Field(None, env="FIREBASE_CLIENT_ID")
    firebase_auth_uri: str = Field(
        default="https://accounts.google.com/o/oauth2/auth",
        env="FIREBASE_AUTH_URI"
    )
    firebase_token_uri: str = Field(
        default="https://oauth2.googleapis.com/token",
        env="FIREBASE_TOKEN_URI"
    )
    
    # Application Configuration
    environment: str = Field(default="development", env="ENVIRONMENT")
    debug: bool = Field(default=True, env="DEBUG")
    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    
    # External Services
    backend_url: str = Field(default="http://localhost:8000", env="BACKEND_URL")
    frontend_url: str = Field(default="http://localhost:3000", env="FRONTEND_URL")

    # CORS Configuration
    allowed_origins: Union[List[str], str] = Field(
        default=[
            "http://localhost:3000", 
            "http://127.0.0.1:3000",
            "https://ecommerceapp-205c5.web.app/",
            "http://ecommerceapp-205c5.web.app/",
            "https://genaiexchangehackathon-production.up.railway.app",
            "https://genaiexchangehackathon-production.up.railway.app/"
        ],
        env="ALLOWED_ORIGINS"
    )
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "ignore" # Allow extra fields in .env without validation error

# Global settings instance
settings = Settings()

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper()),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)

def get_settings() -> Settings:
    """Get application settings."""
    # Debug: Log the loaded API key (masked for security)
    masked_key = settings.google_api_key[:8] + "..." + settings.google_api_key[-4:] if len(settings.google_api_key) > 12 else "***"
    logger.info(f"Google API Key loaded: {masked_key}")
    return settings

def validate_api_keys() -> None:
    """
    Validates that API keys are not using placeholder values.
    Raises ValueError if a placeholder is found.
    """
    placeholder_keys = []
    if "your-google-api-key-here" in settings.google_api_key or "demo_key" in settings.google_api_key:
        placeholder_keys.append("GOOGLE_API_KEY")
    if "your_api_key_here" in settings.exa_api_key or "demo_key" in settings.exa_api_key:
        placeholder_keys.append("EXA_API_KEY")
    if "your-tavily-api-key-here" in settings.tavily_api_key:
        placeholder_keys.append("TAVILY_API_KEY")

    if placeholder_keys:
        raise ValueError(
            f"Placeholder API keys found for: {', '.join(placeholder_keys)}. "
            "Please replace them with valid keys in your environment configuration."
        )
    logger.info("API keys validated successfully.")

# Validate configuration on import (allow demo keys for development)
# Validate configuration on import (allow demo keys for development)
# validate_api_keys()
