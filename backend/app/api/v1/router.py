from fastapi import APIRouter
from app.api.v1.endpoints import dashboard, whatsapp, n8n, whatsapp_config

api_router = APIRouter()

api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(whatsapp.router, prefix="/whatsapp", tags=["whatsapp"])
api_router.include_router(whatsapp_config.router, prefix="/whatsapp", tags=["whatsapp-config"])
api_router.include_router(n8n.router, prefix="/n8n", tags=["n8n"])
