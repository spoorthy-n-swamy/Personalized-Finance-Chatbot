import os
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # API Configuration
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    DEBUG: bool = True
    
    # AI Model Configuration
    HUGGINGFACE_API_KEY: Optional[str] = None
    GRANITE_MODEL_NAME: str = "ibm-granite/granite-3.1-2b-instruct"
    MAX_TOKENS: int = 512
    TEMPERATURE: float = 0.7
    
    WATSON_API_KEY: str = "DzItdGn8-Ukx-9l_EI7H_Sa4beYolpBmgUkwqRDDO9jb"
    WATSON_URL: str = "https://api.us-south.assistant.v2.watson.cloud.ibm.com"
    WATSON_VERSION: str = "2023-06-15"
    WATSON_ASSISTANT_ID: Optional[str] = None  # Will be set when assistant is created
    
    WATSONX_API_KEY: str = "keuOfKbUAHbRxhWXZrsqBOsyYXuVaNDwlmaYn3evePNO"
    WATSONX_API_URL: Optional[str] = None
    WATSONX_PROJECT_ID: Optional[str] = None
    
    GEMINI_API_KEY: str = "AIzaSyCcpzznXKUDRAGf97xTZ9LD0t5TX_Jp8Bc"
    GEMINI_MODEL: str = "gemini-1.5-flash"
    
    ALPHA_VANTAGE_API_KEY: str = "SE9O1MP3SRI318F9"
    
    # Database Configuration (for future use)
    DATABASE_URL: Optional[str] = None
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Financial Analysis Configuration
    DEFAULT_SAVINGS_RATE: float = 0.20  # 20% savings rate
    EMERGENCY_FUND_MONTHS: int = 6
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
