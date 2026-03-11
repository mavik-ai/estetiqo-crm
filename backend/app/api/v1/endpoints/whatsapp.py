from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from app.services.evolution_api import send_rsvp_message

router = APIRouter()

class RsvpRequest(BaseModel):
    phone: str
    client_name: str
    date_str: str
    time_str: str
    rsvp_link: str
    instance_name: str

@router.post("/send-rsvp")
async def trigger_rsvp(request: RsvpRequest, background_tasks: BackgroundTasks):
    """
    Endpoint interno chamado pelo servidor Frontend (Next.js) para disparar
    o WhatsApp após salvar um novo agendamento com segurança no BD.
    Usa BackgroundTasks para não prender a requisição.
    """
    if not request.phone:
        raise HTTPException(status_code=400, detail="O telefone do cliente é obrigatório")
        
    if not request.instance_name:
        raise HTTPException(status_code=400, detail="Instância da Evolution API (tenant) é obrigatória")
        
    background_tasks.add_task(
        send_rsvp_message,
        instance_name=request.instance_name,
        phone=request.phone,
        client_name=request.client_name,
        date_str=request.date_str,
        time_str=request.time_str,
        rsvp_link=request.rsvp_link
    )
    
    return {"status": "success", "message": "Disparo de WhatsApp enfileirado com sucesso"}
