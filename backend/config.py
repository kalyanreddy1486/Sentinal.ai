from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite:///./sentinel.db"
    
    # AI API Keys
    GOOGLE_API_KEY: str = ""
    XAI_API_KEY: str = ""
    
    # Gmail SMTP
    SMTP_SERVER: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    ALERT_FROM_EMAIL: str = ""
    
    # Twilio
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE_NUMBER: str = ""
    
    # Application
    APP_NAME: str = "SENTINEL AI"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"
    
    # Alert Settings
    ALERT_THRESHOLD: int = 80
    CONFIRMATION_WAIT_SECONDS: int = 60
    ESCALATION_TIMEOUT_MINUTES: int = 15
    
    # Monitoring
    MAX_CONCURRENT_MACHINES: int = 50
    WEBSOCKET_UPDATE_INTERVAL: int = 2
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    import os
    # Force reload from .env file, ignoring system env vars for these keys
    for key in ['DATABASE_URL', 'APP_NAME', 'DEBUG']:
        os.environ.pop(key, None)
    return Settings()
