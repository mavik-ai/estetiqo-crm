from fastapi import APIRouter, Header, HTTPException
from supabase import create_client
import os
from datetime import date, datetime, timezone

router = APIRouter()

def get_supabase():
    url = os.getenv("SUPABASE_URL", "")
    key = os.getenv("SUPABASE_KEY", "")  # service_role key
    return create_client(url, key)


def get_tenant_id(user_id: str) -> str:
    """Retorna o tenant_id do usuário pelo user_id."""
    supabase = get_supabase()
    result = supabase.table("users").select("tenant_id").eq("id", user_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return result.data["tenant_id"]


def verify_token(authorization: str) -> str:
    """Verifica o JWT do Supabase e retorna o user_id."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token não informado")
    token = authorization.replace("Bearer ", "")
    supabase = get_supabase()
    user = supabase.auth.get_user(token)
    if not user or not user.user:
        raise HTTPException(status_code=401, detail="Token inválido")
    return user.user.id


@router.get("/metrics")
def get_dashboard_metrics(authorization: str = Header(None)):
    """
    Retorna as 4 métricas do dashboard:
    - atendimentos_hoje: total de agendamentos para hoje
    - horarios_vagos: slots sem agendamento no dia (simplificado)
    - noshows_mes: total de no-shows no mês corrente
    - faturamento_mes: soma de preços dos serviços realizados no mês
    """
    user_id = verify_token(authorization)
    tenant_id = get_tenant_id(user_id)
    supabase = get_supabase()

    today = date.today().isoformat()
    tomorrow = date.fromordinal(date.today().toordinal() + 1).isoformat()
    month_start = date.today().replace(day=1).isoformat()

    # Atendimentos hoje (excluindo bloqueios)
    hoje = supabase.table("appointments") \
        .select("id", count="exact") \
        .eq("tenant_id", tenant_id) \
        .eq("is_block", False) \
        .gte("starts_at", today) \
        .lt("starts_at", tomorrow) \
        .execute()
    atendimentos_hoje = hoje.count or 0

    # Restantes (horário ainda não passou)
    agora = datetime.now(timezone.utc).isoformat()
    restantes = supabase.table("appointments") \
        .select("id", count="exact") \
        .eq("tenant_id", tenant_id) \
        .eq("is_block", False) \
        .gte("starts_at", agora) \
        .lt("starts_at", tomorrow) \
        .execute()
    restantes_count = restantes.count or 0

    # No-shows do mês
    noshows = supabase.table("appointments") \
        .select("id", count="exact") \
        .eq("tenant_id", tenant_id) \
        .eq("no_show", True) \
        .gte("starts_at", month_start) \
        .execute()
    noshows_mes = noshows.count or 0

    # Faturamento do mês (soma dos serviços realizados = confirmed + not no_show)
    appts_mes = supabase.table("appointments") \
        .select("service_id, services(price)") \
        .eq("tenant_id", tenant_id) \
        .eq("is_block", False) \
        .eq("no_show", False) \
        .in_("rsvp_status", ["confirmed", "pending", "noresponse"]) \
        .gte("starts_at", month_start) \
        .lt("starts_at", today) \
        .execute()
    faturamento = sum(
        (a.get("services", {}) or {}).get("price", 0) or 0
        for a in (appts_mes.data or [])
    )

    # RSVP pendentes de hoje (para banner)
    pendentes = supabase.table("appointments") \
        .select("id", count="exact") \
        .eq("tenant_id", tenant_id) \
        .eq("is_block", False) \
        .in_("rsvp_status", ["pending", "noresponse"]) \
        .gte("starts_at", today) \
        .lt("starts_at", tomorrow) \
        .execute()
    rsvp_pendentes = pendentes.count or 0

    return {
        "atendimentos_hoje": atendimentos_hoje,
        "restantes_hoje": restantes_count,
        "noshows_mes": noshows_mes,
        "faturamento_mes": float(faturamento),
        "rsvp_pendentes_hoje": rsvp_pendentes,
    }


@router.get("/appointments/upcoming")
def get_upcoming_appointments(authorization: str = Header(None)):
    """
    Retorna os agendamentos de hoje ordenados por horário,
    com dados do cliente, serviço, sala e protocolo.
    """
    user_id = verify_token(authorization)
    tenant_id = get_tenant_id(user_id)
    supabase = get_supabase()

    today = date.today().isoformat()
    tomorrow = date.fromordinal(date.today().toordinal() + 1).isoformat()

    result = supabase.table("appointments") \
        .select("""
            id,
            starts_at,
            ends_at,
            rsvp_status,
            no_show,
            clients(id, name),
            services(id, name, price),
            rooms(id, name),
            protocols(id, total_sessions, completed_sessions),
            users!appointments_professional_id_fkey(id, name, avatar_initials)
        """) \
        .eq("tenant_id", tenant_id) \
        .eq("is_block", False) \
        .gte("starts_at", today) \
        .lt("starts_at", tomorrow) \
        .order("starts_at") \
        .execute()

    appointments = []
    for a in (result.data or []):
        client = a.get("clients") or {}
        service = a.get("services") or {}
        room = a.get("rooms") or {}
        protocol = a.get("protocols") or {}
        professional = a.get("users") or {}

        client_name = client.get("name", "")
        initials = "".join(p[0].upper() for p in client_name.split()[:2]) if client_name else "??"

        starts_at = a.get("starts_at", "")
        hora = starts_at[11:16] if len(starts_at) >= 16 else ""

        protocol_label = ""
        if protocol:
            done = protocol.get("completed_sessions", 0)
            total = protocol.get("total_sessions", 0)
            protocol_label = f"{done}/{total}"

        appointments.append({
            "id": a["id"],
            "hora": hora,
            "client_id": client.get("id"),
            "client_name": client_name,
            "client_initials": initials,
            "service": service.get("name", ""),
            "protocol": protocol_label,
            "room": room.get("name", ""),
            "professional": professional.get("name", ""),
            "rsvp_status": a.get("rsvp_status", "pending"),
            "no_show": a.get("no_show", False),
        })

    return {"appointments": appointments, "total": len(appointments)}
