import { createClient } from "@/utils/supabase/server";
import { DashboardMetrics, DashboardMetricsData } from "@/components/dashboard/DashboardMetrics";
import { AppointmentTable, Appointment } from "@/components/dashboard/AppointmentTable";
import { OnboardingBanner } from "@/components/dashboard/OnboardingBanner";
import { AlertCircle, ChevronRight, Cake, Clock, FileText } from "lucide-react";
import Link from "next/link";

async function getDashboardData() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

    const tenantId = profile?.tenant_id;
    if (!tenantId) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const now = new Date();

    const todayStr      = today.toISOString();
    const tomorrowStr   = tomorrow.toISOString();
    const monthStartStr = monthStart.toISOString();
    const nowStr        = now.toISOString();

    const [apptToday, noshowsRes, fatRes, apptHoje, svcsCount, roomsCount, hoursRes, roomsAtivas, apptNow, clientesRes, protocolosRes] = await Promise.all([
        // Contagem agendamentos hoje
        supabase
            .from('appointments')
            .select('id', { count: 'exact', head: true })
            .eq('tenant_id', tenantId)
            .eq('is_block', false)
            .gte('starts_at', todayStr)
            .lt('starts_at', tomorrowStr),

        // No-shows do mês
        supabase
            .from('appointments')
            .select('id', { count: 'exact', head: true })
            .eq('tenant_id', tenantId)
            .eq('no_show', true)
            .gte('starts_at', monthStartStr),

        // Faturamento do mês (excluindo hoje pois ainda em andamento)
        supabase
            .from('appointments')
            .select('services(price)')
            .eq('tenant_id', tenantId)
            .eq('is_block', false)
            .eq('no_show', false)
            .gte('starts_at', monthStartStr),

        // Agendamentos de HOJE para tabela
        supabase
            .from('appointments')
            .select(`
                id, starts_at, ends_at, rsvp_status, no_show,
                clients(id, name),
                services(id, name),
                rooms(id, name),
                protocols(id, total_sessions, completed_sessions),
                users!appointments_professional_id_fkey(id, name)
            `)
            .eq('tenant_id', tenantId)
            .eq('is_block', false)
            .gte('starts_at', todayStr)
            .lt('starts_at', tomorrowStr)
            .order('starts_at'),

        // Contagem serviços ativos
        supabase
            .from('services')
            .select('id', { count: 'exact', head: true })
            .eq('tenant_id', tenantId)
            .eq('active', true),

        // Contagem salas ativas
        supabase
            .from('rooms')
            .select('id', { count: 'exact', head: true })
            .eq('tenant_id', tenantId)
            .eq('active', true),

        // Horários de funcionamento
        supabase
            .from("business_hours")
            .select("is_open, open_time, close_time")
            .eq("tenant_id", tenantId)
            .eq("is_open", true),

        // Salas ativas (para widget Salas Agora)
        supabase
            .from('rooms')
            .select('id, name')
            .eq('tenant_id', tenantId)
            .eq('active', true)
            .order('name'),

        // Agendamentos em andamento agora (starts_at <= now < ends_at)
        supabase
            .from('appointments')
            .select('id, starts_at, ends_at, room_id, clients(name), services(name, duration_minutes)')
            .eq('tenant_id', tenantId)
            .eq('is_block', false)
            .neq('rsvp_status', 'cancelled')
            .eq('no_show', false)
            .lte('starts_at', nowStr)
            .gt('ends_at', nowStr),

        // Clientes com data de nascimento (para aniversariantes)
        supabase
            .from('clients')
            .select('id, name, birth_date')
            .eq('tenant_id', tenantId)
            .not('birth_date', 'is', null),

        // Protocolos atrasados (status=active, expected_end_date < hoje)
        supabase
            .from('protocols')
            .select('id, total_sessions, completed_sessions, expected_end_date, clients(name)')
            .eq('tenant_id', tenantId)
            .eq('status', 'active')
            .lt('expected_end_date', todayStr)
            .order('expected_end_date')
            .limit(5),
    ]);

    const atendimentosHoje = apptToday.count ?? 0;
    const noshowsMes       = noshowsRes.count ?? 0;
    const faturamentoMes   = (fatRes.data ?? []).reduce((sum, a) => {
        const price = (a.services as { price?: number } | null)?.price ?? 0;
        return sum + price;
    }, 0);

    const restantes = (apptHoje.data ?? []).filter(a => new Date(a.starts_at) > now).length;

    // Calcular horários totais configurados
    let minH = 24;
    let maxH = 0;
    (hoursRes.data || []).forEach((h) => {
        if (h.open_time) {
            const hStart = parseInt(h.open_time.split(":")[0], 10);
            if (!isNaN(hStart) && hStart < minH) minH = hStart;
        }
        if (h.close_time) {
            const hEnd = parseInt(h.close_time.split(":")[0], 10);
            if (!isNaN(hEnd) && hEnd > maxH) maxH = hEnd;
        }
    });
    if (minH >= 24) minH = 8;
    if (maxH <= 0) maxH = 18;

    const slotsPorSala = Math.max(0, (maxH - minH) * 2 + 1);
    const qtdSalas = roomsCount.count ?? 0;
    const totalSlotsAgendaHoje = slotsPorSala * qtdSalas;
    const vagasLivresHoje = Math.max(0, totalSlotsAgendaHoje - atendimentosHoje);

    // Mapear appointments de hoje para tabela
    const appointments: Appointment[] = (apptHoje.data ?? []).map(a => {
        const clientName = (a.clients as { name?: string } | null)?.name ?? '';
        const initials   = clientName.split(' ').slice(0, 2).map((p: string) => p[0]?.toUpperCase() ?? '').join('') || '??';
        const timeStr    = (a.starts_at as string)?.slice(11, 16) ?? '';
        const proto      = a.protocols as { total_sessions?: number; completed_sessions?: number } | null;
        return {
            id:              a.id,
            hora:            timeStr,
            client_name:     clientName,
            client_initials: initials,
            service:         (a.services as { name?: string } | null)?.name ?? '',
            protocol:        proto ? `${proto.completed_sessions ?? 0}/${proto.total_sessions ?? 0}` : '',
            room:            (a.rooms as { name?: string } | null)?.name ?? '',
            professional:    ((a.users as { name?: string } | null)?.name ?? '').split(' ')[0],
            rsvp_status:     a.rsvp_status as Appointment['rsvp_status'],
            no_show:         a.no_show ?? false,
        };
    });

    // Salas Agora: quais salas estão em atendimento?
    const roomsNow = roomsAtivas.data ?? [];
    const apptNowData = apptNow.data ?? [];
    const salasAgora = roomsNow.map(room => {
        const appt = apptNowData.find(a => a.room_id === room.id);
        if (!appt) return { room, emAtendimento: false, clientName: '', serviceName: '', timeRange: '' };
        const clientName  = (appt.clients as { name?: string } | null)?.name ?? '';
        const serviceName = (appt.services as { name?: string } | null)?.name ?? '';
        const start = new Date(appt.starts_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const end   = new Date(appt.ends_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        return { room, emAtendimento: true, clientName, serviceName, timeRange: `${start}–${end}` };
    });

    // Aniversariantes próximos 7 dias
    const aniversariantes = (clientesRes.data ?? [])
        .map(c => {
            const bd = new Date(c.birth_date!);
            const anivEsteAno = new Date(today.getFullYear(), bd.getMonth(), bd.getDate());
            const dias = Math.round((anivEsteAno.getTime() - today.getTime()) / 86400000);
            return { ...c, dias };
        })
        .filter(c => c.dias >= 0 && c.dias <= 7)
        .sort((a, b) => a.dias - b.dias)
        .slice(0, 5);

    // Protocolos atrasados
    const protocolosAtrasados = (protocolosRes.data ?? []).map(p => {
        const diasAtraso = Math.floor((today.getTime() - new Date(p.expected_end_date!).getTime()) / 86400000);
        const clientName = (p.clients as { name?: string } | null)?.name ?? '';
        return { ...p, diasAtraso, clientName };
    });

    const rsvpPendentes = (apptHoje.data ?? []).filter(a => a.rsvp_status === 'pending').length;

    const metrics: DashboardMetricsData & { total_slots_dia: number; vagas_livres_hoje: number } = {
        atendimentos_hoje: atendimentosHoje,
        restantes_hoje:    restantes,
        noshows_mes:       noshowsMes,
        faturamento_mes:   faturamentoMes,
        total_slots_dia:   totalSlotsAgendaHoje,
        vagas_livres_hoje: vagasLivresHoje,
    };

    const needsSetup = (svcsCount.count ?? 0) === 0 || (roomsCount.count ?? 0) === 0;
    const setupChecklist = {
        hasServices: (svcsCount.count ?? 0) > 0,
        hasRooms:    (roomsCount.count ?? 0) > 0,
    };

    return { metrics, appointments, rsvpPendentes, needsSetup, setupChecklist, salasAgora, aniversariantes, protocolosAtrasados };
}

export default async function DashboardPage() {
    const data = await getDashboardData();

    const metrics             = data?.metrics            ?? { atendimentos_hoje: 0, restantes_hoje: 0, noshows_mes: 0, faturamento_mes: 0 };
    const appts               = data?.appointments       ?? [];
    const pendentes           = data?.rsvpPendentes      ?? 0;
    const needsSetup          = data?.needsSetup         ?? false;
    const setupChecklist      = data?.setupChecklist     ?? { hasServices: false, hasRooms: false };
    const salasAgora          = data?.salasAgora         ?? [];
    const aniversariantes     = data?.aniversariantes    ?? [];
    const protocolosAtrasados = data?.protocolosAtrasados ?? [];

    const card = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: "14px" };

    return (
        <div className="px-6 py-5 bg-background min-h-full">

            {/* Banner de Onboarding */}
            {needsSetup && (
                <OnboardingBanner
                    hasServices={setupChecklist.hasServices}
                    hasRooms={setupChecklist.hasRooms}
                />
            )}

            {/* Alerta RSVP pendente */}
            {pendentes > 0 && (
                <div
                    className="rounded-xl px-4 py-2.5 flex items-center gap-3 mb-4 relative overflow-hidden"
                    style={{ ...card, border: "1px solid rgba(196, 136, 10, 0.2)" }}
                >
                    <div className="absolute top-0 left-0 bottom-0 w-1" style={{ background: "#C4880A" }} />
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(196,136,10,0.08)", color: "#C4880A" }}>
                        <AlertCircle size={14} />
                    </div>
                    <div className="flex-1 text-[13px] font-medium" style={{ color: "var(--foreground)" }}>
                        {pendentes === 1
                            ? "1 cliente ainda não confirmou presença para hoje."
                            : `${pendentes} clientes ainda não confirmaram presença para hoje.`}
                    </div>
                    <Link href="/agenda" className="flex items-center gap-0.5 text-[11px] font-bold hover:underline" style={{ color: "#C4880A" }}>
                        Ver agenda <ChevronRight size={12} />
                    </Link>
                </div>
            )}

            <DashboardMetrics data={metrics} />

            {/* Layout principal: tabela (3/4) + widgets (1/4) */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-3">
                    <AppointmentTable appointments={appts} />
                </div>
                <div className="flex flex-col gap-3">

                    {/* Widget: Salas Agora */}
                    <div className="p-4" style={card}>
                        <div className="flex justify-between items-center mb-3">
                            <div style={{ color: "var(--muted-foreground)", fontWeight: 700, letterSpacing: "0.12em", fontSize: "9px", textTransform: "uppercase" }}>
                                Salas agora
                            </div>
                            <Clock size={13} style={{ color: "#BBA870" }} />
                        </div>
                        {salasAgora.length === 0 ? (
                            <div className="py-4 text-center" style={{ color: "#BBA870", fontSize: "12px" }}>Nenhuma sala configurada</div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {salasAgora.map(({ room, emAtendimento, clientName, serviceName, timeRange }) => (
                                    <div key={room.id} className="flex items-start gap-2.5 rounded-lg p-2.5" style={{
                                        background: emAtendimento ? "linear-gradient(135deg, rgba(196,168,58,0.1), rgba(184,150,12,0.06))" : "var(--background)",
                                        border: `1px solid ${emAtendimento ? "rgba(184,150,12,0.2)" : "var(--border)"}`,
                                    }}>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-1 mb-0.5">
                                                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--foreground)" }}>{room.name}</span>
                                                <span style={{
                                                    fontSize: "9px", fontWeight: 700, padding: "1px 6px", borderRadius: "6px",
                                                    background: emAtendimento ? "#B8960C" : "var(--muted)",
                                                    color: emAtendimento ? "#FFFDF7" : "var(--muted-foreground)",
                                                    letterSpacing: "0.05em", textTransform: "uppercase", flexShrink: 0,
                                                }}>
                                                    {emAtendimento ? "EM ATENDIMENTO" : "LIVRE"}
                                                </span>
                                            </div>
                                            {emAtendimento && (
                                                <div style={{ fontSize: "10px", color: "#8A7E60" }}>
                                                    {clientName} · {serviceName} · {timeRange}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Widget: Aniversariantes */}
                    <div className="p-4" style={card}>
                        <div className="flex justify-between items-center mb-3">
                            <div style={{ color: "var(--muted-foreground)", fontWeight: 700, letterSpacing: "0.12em", fontSize: "9px", textTransform: "uppercase" }}>
                                Aniversariantes
                            </div>
                            <Cake size={13} style={{ color: "#BBA870" }} />
                        </div>
                        {aniversariantes.length === 0 ? (
                            <div className="py-4 text-center" style={{ color: "#BBA870", fontSize: "12px" }}>Nenhum nos próximos 7 dias</div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {aniversariantes.map(c => (
                                    <div key={c.id} className="flex items-center justify-between gap-2">
                                        <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {c.name.split(' ')[0]}
                                        </span>
                                        <span style={{
                                            fontSize: "9px", fontWeight: 700, padding: "1px 6px", borderRadius: "6px", flexShrink: 0,
                                            background: c.dias === 0 ? "#B8960C" : "rgba(184,150,12,0.08)",
                                            color: c.dias === 0 ? "#FFFDF7" : "#B8960C",
                                        }}>
                                            {c.dias === 0 ? "Hoje 🎉" : `Em ${c.dias}d`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Widget: Protocolos Atrasados */}
                    <div className="p-4" style={card}>
                        <div className="flex justify-between items-center mb-3">
                            <div style={{ color: "var(--muted-foreground)", fontWeight: 700, letterSpacing: "0.12em", fontSize: "9px", textTransform: "uppercase" }}>
                                Protocolos atrasados
                            </div>
                            <FileText size={13} style={{ color: "#BBA870" }} />
                        </div>
                        {protocolosAtrasados.length === 0 ? (
                            <div className="py-4 text-center" style={{ color: "#2D8C4E", fontSize: "12px" }}>Nenhum atrasado ✓</div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {protocolosAtrasados.map(p => (
                                    <div key={p.id} className="flex items-center justify-between gap-2">
                                        <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {p.clientName.split(' ')[0]}
                                        </span>
                                        <span style={{
                                            fontSize: "9px", fontWeight: 700, padding: "1px 6px", borderRadius: "6px",
                                            background: "rgba(217,68,68,0.08)", color: "#D94444", flexShrink: 0,
                                        }}>
                                            +{p.diasAtraso}d
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
