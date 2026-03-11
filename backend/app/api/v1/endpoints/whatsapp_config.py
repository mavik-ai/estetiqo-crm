import logging
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional

from app.db.database import get_supabase
from app.services.evolution_api import create_instance, get_connection_state, logout_instance
from app.api.deps import get_current_user_tenant

logger = logging.getLogger(__name__)

router = APIRouter()

class CreateInstanceRequest(BaseModel):
    phone: str

class InstanceStatusResponse(BaseModel):
    status: str
    qrcode: Optional[str] = None
    phone: Optional[str] = None

@router.post("/instance/create")
async def setup_whatsapp_instance(
    request: CreateInstanceRequest,
    tenant_details: dict = Depends(get_current_user_tenant)
):
    """
    1. Verifica o tenant ativo.
    2. Gera o instanceName baseado no slug do tenant.
    3. Pede para a Evolution API criar a instância (gerando qrcode).
    4. Salva a intent no BD.
    5. Retorna o origin do QRCode pro front.
    """
    tenant_id = tenant_details["tenant_id"]
    supabase = get_supabase()

    # Busca o slug do tenant no banco
    response = supabase.table("tenants").select("slug, evolution_instance_name").eq("id", tenant_id).execute()
    data = response.data
    
    if not data or len(data) == 0:
        raise HTTPException(status_code=404, detail="Tenant não encontrado.")
        
    tenant = data[0]
    slug = tenant["slug"]
    
    # Se ja existir uma instancia registrada, a gente desloga pra criar uma nova limpa
    existing_instance = tenant.get("evolution_instance_name")
    if existing_instance:
        await logout_instance(existing_instance)

    # Novo nome de instancia
    new_instance_name = f"estetiqo_{slug}"
    
    # Clean up phone formating
    formatted_phone = ''.join(filter(str.isdigit, request.phone))
    if len(formatted_phone) in [10, 11] and not formatted_phone.startswith('55'):
        formatted_phone = f"55{formatted_phone}"
    
    # Dispara pra Evolution
    evo_res = await create_instance(new_instance_name, formatted_phone)
    if "error" in evo_res:
         raise HTTPException(status_code=500, detail=f"Erro na mensageria: {evo_res['error']}")
         
    qrcode_base64 = None
    if "qrcode" in evo_res and evo_res["qrcode"]:
        if "base64" in evo_res["qrcode"]:
            qrcode_base64 = evo_res["qrcode"]["base64"]

    # Salva no banco o estado
    supabase.table("tenants").update({
        "evolution_instance_name": new_instance_name,
        "whatsapp_number": formatted_phone,
        "whatsapp_status": "pending"
    }).eq("id", tenant_id).execute()
    
    return {
        "status": "pending",
        "qrcode": qrcode_base64,
        "message": "Leia o QR Code para conectar"
    }


@router.get("/instance/status")
async def check_whatsapp_status(
    tenant_details: dict = Depends(get_current_user_tenant)
):
    """
    1. Descobre a qual tenant o User pertence.
    2. Pega o `evolution_instance_name` do BD.
    3. Consulta a Evolution API pelo state.
    4. Se open, vira 'connected' no DB.
    """
    tenant_id = tenant_details["tenant_id"]
    supabase = get_supabase()

    response = supabase.table("tenants").select("evolution_instance_name, whatsapp_status, whatsapp_number").eq("id", tenant_id).execute()
    data = response.data
    
    if not data or len(data) == 0:
        raise HTTPException(status_code=404, detail="Tenant não encontrado.")
    
    tenant = data[0]
    instance_name = tenant.get("evolution_instance_name")
    current_db_status = tenant.get("whatsapp_status")
    
    if not instance_name:
        return {"status": "disconnected"}
        
    evo_state = await get_connection_state(instance_name)
    
    if "error" in evo_state:
        # Erro ou instancia nao existe la mais 
        if current_db_status != "disconnected":
             supabase.table("tenants").update({"whatsapp_status": "disconnected"}).eq("id", tenant_id).execute()
        return {"status": "disconnected"}
    
    # Lendo o State da response da Evolution
    state = evo_state.get("instance", {}).get("state", "disconnected")
    
    # Mapeando os states da Evolution ("open", "connecting", "close") para os states do nosso app
    new_status = current_db_status
    if state == "open":
        new_status = "connected"
    elif state == "connecting" or state == "init":
        new_status = "pending"
    else:
        new_status = "disconnected"
        
    if new_status != current_db_status:
        supabase.table("tenants").update({"whatsapp_status": new_status}).eq("id", tenant_id).execute()
        
    return {
        "status": new_status,
        "phone": tenant.get("whatsapp_number")
    }

@router.delete("/instance")
async def disconnect_whatsapp(
    tenant_details: dict = Depends(get_current_user_tenant)
):
    """
    Deleta a instancia e limpa o banco de dados.
    """
    tenant_id = tenant_details["tenant_id"]
    supabase = get_supabase()

    response = supabase.table("tenants").select("evolution_instance_name").eq("id", tenant_id).execute()
    data = response.data
    
    if not data or len(data) == 0:
        raise HTTPException(status_code=404, detail="Tenant não encontrado.")
        
    instance_name = data[0].get("evolution_instance_name")
    
    if instance_name:
        await logout_instance(instance_name)
        
    # Resetar na base do CRM
    supabase.table("tenants").update({
        "evolution_instance_name": None,
        "whatsapp_number": None,
        "whatsapp_status": "disconnected"
    }).eq("id", tenant_id).execute()
    
    return {"status": "disconnected"}
