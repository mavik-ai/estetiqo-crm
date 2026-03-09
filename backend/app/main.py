from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.api.v1.router import api_router
import time
from collections import defaultdict
from threading import Lock

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    # Em produção, desabilitar docs públicos
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url=None,
)

# ============================================================
# CORS — restrito ao frontend autorizado
# ============================================================
ALLOWED_ORIGINS = [o.strip() for o in settings.BACKEND_CORS_ORIGINS if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "X-Requested-With"],
    max_age=600,
)

# ============================================================
# RATE LIMITING — in-memory (por IP)
# ============================================================
_rate_store: dict[str, list[float]] = defaultdict(list)
_rate_lock = Lock()

RATE_LIMIT = 60        # máximo de requisições
RATE_WINDOW = 60.0     # por janela de segundos


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    # Não aplica rate limit em rotas de sistema
    if request.url.path in ("/", "/health-check"):
        return await call_next(request)

    client_ip = request.client.host if request.client else "unknown"
    now = time.time()

    with _rate_lock:
        timestamps = _rate_store[client_ip]
        # Remove timestamps fora da janela
        _rate_store[client_ip] = [t for t in timestamps if now - t < RATE_WINDOW]
        if len(_rate_store[client_ip]) >= RATE_LIMIT:
            return JSONResponse(
                status_code=429,
                content={"detail": "Muitas requisições. Tente novamente em instantes."},
                headers={"Retry-After": str(int(RATE_WINDOW))},
            )
        _rate_store[client_ip].append(now)

    return await call_next(request)


# ============================================================
# SEGURANÇA — headers de resposta
# ============================================================
@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


# ============================================================
# ROTAS DE SISTEMA
# ============================================================
@app.get("/", tags=["system"])
def root():
    return {"name": "Estetiqo CRM API", "version": "1.0.0"}


@app.get("/health-check", tags=["system"])
def health_check():
    return {"status": "ok"}


app.include_router(api_router, prefix=settings.API_V1_STR)
