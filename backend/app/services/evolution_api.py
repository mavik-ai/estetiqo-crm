import httpx
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

async def send_rsvp_message(instance_name: str, phone: str, client_name: str, date_str: str, time_str: str, rsvp_link: str) -> bool:
    """
    Envia a mensagem de confirmação de agendamento (RSVP) via Evolution API.
    A mensagem contém os botões para confirmar ou remarcar, facilitando para o usuário.
    """
    if not settings.EVOLUTION_API_URL or not settings.EVOLUTION_API_TOKEN or not instance_name:
        logger.warning(f"Credenciais ou instância ausentes para envio WhatsApp. Instância requisitada: {instance_name}")
        return False

    # A Evolution API geralmente recebe o telefone no formato 5511999999999
    # Aqui formatamos para garantir que só tenha números e comece com o código do país
    formatted_phone = ''.join(filter(str.isdigit, phone))
    if len(formatted_phone) == 10 or len(formatted_phone) == 11:
        # Assumindo Brasil se não tiver DDI
        formatted_phone = f"55{formatted_phone}"

    message_text = f"Olá {client_name}! 🌟\n\nEste é um lembrete do seu agendamento na *Estetiqo* para o dia *{date_str}* às *{time_str}*.\n\nPor favor, confirme sua presença acessando o link abaixo:\n{rsvp_link}\n\nTe esperamos lá!"

    url = f"{settings.EVOLUTION_API_URL}/message/sendText/{instance_name}"
    headers = {
        "apikey": settings.EVOLUTION_API_TOKEN,
        "Content-Type": "application/json"
    }
    payload = {
        "number": formatted_phone,
        "options": {
            "delay": 1200,
            "presence": "composing"
        },
        "textMessage": {
            "text": message_text
        }
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers, timeout=10.0)
            response.raise_for_status()
            logger.info("Envio de WhatsApp RSVP realizado com sucesso.")
            return True
    except Exception as e:
        logger.error(f"Erro ao enviar WhatsApp RSVP para {formatted_phone}: {str(e)}")
        return False

async def create_instance(instance_name: str, phone: str = "") -> dict:
    """ Cria uma nova instância na Evolution API. Retorna o base64 do QRCode na resposta (se houver). """
    if not settings.EVOLUTION_API_URL or not settings.EVOLUTION_API_TOKEN:
        logger.error("Credenciais da Evolution API ausentes.")
        return {"error": "Credenciais da Evolution API ausentes"}
        
    url = f"{settings.EVOLUTION_API_URL}/instance/create"
    headers = {
        "apikey": settings.EVOLUTION_API_TOKEN,
        "Content-Type": "application/json"
    }
    payload = {
        "instanceName": instance_name,
        "qrcode": True,
        "number": phone
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers, timeout=15.0)
            response.raise_for_status()
            return response.json()
    except Exception as e:
        logger.error(f"Erro ao criar instância {instance_name} na Evolution API: {str(e)}")
        return {"error": str(e)}

async def get_connection_state(instance_name: str) -> dict:
    """ Verifica o status de conexão da instância (open, init, connecting). """
    if not settings.EVOLUTION_API_URL or not settings.EVOLUTION_API_TOKEN:
        return {"error": "Credenciais ausentes"}
        
    url = f"{settings.EVOLUTION_API_URL}/instance/connectionState/{instance_name}"
    headers = {
        "apikey": settings.EVOLUTION_API_TOKEN
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers, timeout=10.0)
            # Retorna 404 se a instância caiu / nao existe, tem que tratar.
            if response.status_code == 404:
                return {"instance": {"state": "disconnected"}}
                
            response.raise_for_status()
            data = response.json()
            return data
    except Exception as e:
        logger.error(f"Erro ao consultar state da instância {instance_name}: {str(e)}")
        return {"error": str(e)}

async def logout_instance(instance_name: str) -> dict:
    """ Desloga e deleta a instância da Evolution API """
    if not settings.EVOLUTION_API_URL or not settings.EVOLUTION_API_TOKEN:
        return {"error": "Credenciais ausentes"}
        
    url = f"{settings.EVOLUTION_API_URL}/instance/logout/{instance_name}"
    headers = {
        "apikey": settings.EVOLUTION_API_TOKEN
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.delete(url, headers=headers, timeout=15.0)
            response.raise_for_status()
            return response.json()
    except Exception as e:
        logger.error(f"Erro ao deslogar instância {instance_name}: {str(e)}")
        return {"error": str(e)}
