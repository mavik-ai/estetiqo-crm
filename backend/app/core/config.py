import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Estetiqo CRM API"
    API_V1_STR: str = "/api/v1"
    
    # SECURITY WARNING: Em produção as origins devem ser restritas.
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "https://estetiqo.com.br",
    ]

    # SUPABASE
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")

    # JWT 
    SECRET_KEY: str = os.getenv("SECRET_KEY", "changethisinproduction")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    class Config:
        case_sensitive = True

settings = Settings()
