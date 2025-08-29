from pydantic_settings import BaseSettings
import os
import secrets
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Status Page Application"
    VERSION: str = "1.0.0"
    
    # Database
    DATABASE_URL: str = f"sqlite:///{os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', 'status_page.db')}"
    
    # JWT Settings
    SECRET_KEY: str = "your-secret-key-change-in-production-123456789"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS Settings
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000", 
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174"
    ]
    
    # Security
    DEBUG: bool = True
    
    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    
    # Email settings (optional)
    SMTP_SERVER: str = ""
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    
    # Logging
    LOG_LEVEL: str = "INFO"

    @property
    def is_production(self) -> bool:
        return not self.DEBUG

    def generate_secret_key(self) -> str:
        """Generate a secure secret key for production"""
        return secrets.token_urlsafe(32)

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
