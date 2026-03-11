from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime, timedelta, timezone
from app.api.v1.endpoints.dashboard import get_supabase
from app.core.config import settings

router = APIRouter()

def verify_n8n_token(authorization: str):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token N8N não informado")
    token = authorization.replace("Bearer ", "")
    if not settings.N8N_API_KEY:
        # Se a chave não estiver configurada no .env, bloqueia
        raise HTTPException(status_code=500, detail="Chave N8N não configurada no servidor.")
    if token != settings.N8N_API_KEY:
        raise HTTPException(status_code=401, detail="Token N8N inválido")
    return True

@router.get("/disponibilidade")
def get_disponibilidade(data: str, tenant_id: str, room_id: Optional[str] = None, authorization: str = Header(None)):
    """
    Retorna os agendamentos já existentes (horários ocupados) para uma data,
    para que o Agente Camila possa calcular os horários livres sem expor 
    dados de pacientes.
    A data (data) deve estar no formato ISO 'YYYY-MM-DD'.
    """
    verify_n8n_token(authorization)
    supabase = get_supabase()
    
    try:
        start_date = data
        end_date = (datetime.fromisoformat(data) + timedelta(days=1)).strftime("%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de data inválido. Use YYYY-MM-DD.")

    query = supabase.table("appointments") \
        .select("id, starts_at, ends_at, room_id, professional_id") \
        .eq("tenant_id", tenant_id) \
        .eq("no_show", False) \
        .gte("starts_at", start_date) \
        .lt("starts_at", end_date)

    if room_id:
        query = query.eq("room_id", room_id)

    result = query.execute()
    
    busy_slots = []
    for a in (result.data or []):
        busy_slots.append({
            "starts_at": a.get("starts_at"),
            "ends_at": a.get("ends_at"),
            "room_id": a.get("room_id"),
            "professional_id": a.get("professional_id")
        })

    return {"data": data, "busy_slots": busy_slots}

class AgendamentoN8N(BaseModel):
    tenant_id: str
    client_phone: str
    client_name: str
    service_id: str
    room_id: str
    starts_at: str
    ends_at: str

@router.post("/agendamento")
def criar_agendamento(agendamento: AgendamentoN8N, authorization: str = Header(None)):
    """
    Permite à Camila (N8N) criar um agendamento diretamente no banco.
    """
    verify_n8n_token(authorization)
    supabase = get_supabase()

    # 1. Busca ou cria o cliente pelo telefone
    formatted_phone = ''.join(filter(str.isdigit, agendamento.client_phone))
    clients = supabase.table("clients").select("id").eq("tenant_id", agendamento.tenant_id).eq("phone", formatted_phone).execute()
    
    if clients.data and len(clients.data) > 0:
        client_id = clients.data[0]["id"]
    else:
        # Criar cliente (a gente gera um fake BD, clients precisa de name e phone)
        new_client = supabase.table("clients").insert({
            "tenant_id": agendamento.tenant_id,
            "name": agendamento.client_name,
            "phone": formatted_phone
        }).execute()
        
        if not new_client.data:
            raise HTTPException(status_code=500, detail="Erro ao criar cliente novo.")
        client_id = new_client.data[0]["id"]

    # 2. Gera rsvp_token e tenta inserir o agendamento
    import uuid
    rsvp_token = str(uuid.uuid4()).replace("-", "")[:16]

    res = supabase.table("appointments").insert({
        "tenant_id": agendamento.tenant_id,
        "client_id": client_id,
        "service_id": agendamento.service_id,
        "room_id": agendamento.room_id,
        "starts_at": agendamento.starts_at,
        "ends_at": agendamento.ends_at,
        "rsvp_status": "pending",
        "rsvp_token": rsvp_token,
        "is_block": False,
        "no_show": False
    }).execute()

    if not res.data:
        raise HTTPException(status_code=500, detail="Erro ao criar agendamento. Conflito de horário ou dados inválidos.")

    # Disparar o envio do ZAP? 
    # O próprio N8N tem a Evolution API conectada, então o fluxo lá fará o disparo se quiser.
    # Alternativamente, a Camila pode bater no endpoint /api/v1/whatsapp/send-rsvp após criar.

    return {
        "status": "success", 
        "appointment_id": res.data[0]["id"],
        "client_id": client_id,
        "rsvp_token": rsvp_token
    }
