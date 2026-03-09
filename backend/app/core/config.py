import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Estetiqo CRM API"
    API_V1_STR: str = "/api/v1"

    # Modo debug — desabilita /docs em produção
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"

    # CORS — origens permitidas
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "https://estetiqo.com.br",
    ]

    # SUPABASE
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")

    # JWT — nunca use valor padrão em produção
    # Gere com: openssl rand -hex 32
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 dias

    class Config:
        case_sensitive = True


settings = Settings()

# Bloqueia inicialização se segredos críticos estiverem ausentes
if not settings.SECRET_KEY:
    raise RuntimeError(
        "SECRET_KEY não configurada no .env. "
        "Gere uma chave segura com: openssl rand -hex 32"
    )
if len(settings.SECRET_KEY) < 32:
    raise RuntimeError(
        "SECRET_KEY muito curta (mínimo 32 caracteres). "
        "Gere com: openssl rand -hex 32"
    )
