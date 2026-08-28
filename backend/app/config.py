import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Force loading environment variables from parent folder .env if it exists
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
if os.path.exists(env_path):
    load_dotenv(env_path)
else:
    load_dotenv()

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./disaster_management.db"
    JWT_SECRET: str = "supersecretjwtkeyforlocaldevelopment12345"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    UPLOAD_DIR: str = "uploads"
    
    # Optional Cloudinary Storage settings
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""
    
    # Mock / Live integrations
    SMS_PROVIDER: str = "mock"
    IVR_PROVIDER: str = "mock"
    IMD_API_URL: str = "mock"
    IMD_API_KEY: str = ""
    PORT: int = 8000

    class Config:
        extra = "ignore"

settings = Settings()
