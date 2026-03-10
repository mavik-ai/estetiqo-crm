import { createClient } from "@/utils/supabase/server";
import { DashboardMetrics, DashboardMetricsData } from "@/components/dashboard/DashboardMetrics";
import { AppointmentTable, Appointment } from "@/components/dashboard/AppointmentTable";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { PopularServices } from "@/components/dashboard/PopularServices";
import { AlertCircle, ChevronRight, Sparkles, Scissors, DoorOpen, Layers } from "lucide-react";
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

    const [apptToday, noshowsRes, fatRes, apptUpcoming, svcsCount, roomsCount] = await Promise.all([
        supabase
            .from('appointments')
            .select('id', { count: 'exact', head: true })
            .eq('tenant_id', tenantId)
            .eq('is_block', false)
            .gte('starts_at', todayStr)
            .lt('starts_at', tomorrowStr),

        supabase
            .from('appointments')
            .select('id', { count: 'exact', head: true })
            .eq('tenant_id', tenantId)
            .eq('no_show', true)
            .gte('starts_at', monthStartStr),

        supabase
            .from('appointments')
            .select('services(price)')
            .eq('tenant_id', tenantId)
            .eq('is_block', false)
            .eq('no_show', false)
            .gte('starts_at', monthStartStr)
            .lt('starts_at', todayStr),

        supabase
            .from('appointments')
            .select(`
                id, starts_at, rsvp_status, no_show,
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

        supabase
            .from('services')
            .select('id', { count: 'exact', head: true })
            .eq('tenant_id', tenantId)
            .eq('active', true),

        supabase
            .from('rooms')
            .select('id', { count: 'exact', head: true })
            .eq('tenant_id', tenantId),
    ]);

    const atendimentosHoje = apptToday.count ?? 0;
    const noshowsMes       = noshowsRes.count ?? 0;
    const faturamentoMes   = (fatRes.data ?? []).reduce((sum, a) => {
        const price = (a.services as { price?: number } | null)?.price ?? 0;
        return sum + price;
    }, 0);

    const restantes    = (apptUpcoming.data ?? []).filter(a => new Date(a.starts_at) > now).length;
    const rsvpPendentes = (apptUpcoming.data ?? []).filter(
        a => a.rsvp_status === 'pending' || a.rsvp_status === 'noresponse'
    ).length;

    // Serviços mais realizados no mês
    const { data: servicesMonth } = await supabase
        .from('appointments')
        .select('services(name)')
        .eq('tenant_id', tenantId)
        .eq('is_block', false)
        .eq('no_show', false)
        .gte('starts_at', monthStartStr);

    const serviceCount: Record<string, number> = {};
    (servicesMonth ?? []).forEach(a => {
        const name = (a.services as { name?: string } | null)?.name;
        if (name) serviceCount[name] = (serviceCount[name] ?? 0) + 1;
    });
    const total = Object.values(serviceCount).reduce((s, v) => s + v, 0);
    const popularServices = Object.entries(serviceCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([name, count]) => ({ name, pct: total > 0 ? Math.round((count / total) * 100) : 0 }));

    const appointments: Appointment[] = (apptUpcoming.data ?? []).map(a => {
        const clientName = (a.clients as { name?: string } | null)?.name ?? '';
        const initials   = clientName.split(' ').slice(0, 2).map((p: string) => p[0]?.toUpperCase() ?? '').join('') || '??';
        const hora       = (a.starts_at as string)?.slice(11, 16) ?? '';
        const proto      = a.protocols as { total_sessions?: number; completed_sessions?: number } | null;
        return {
            id:              a.id,
            hora,
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

    const metrics: DashboardMetricsData = {
        atendimentos_hoje: atendimentosHoje,
        restantes_hoje:    restantes,
        noshows_mes:       noshowsMes,
        faturamento_mes:   faturamentoMes,
    };

    const needsSetup = (svcsCount.count ?? 0) === 0 || (roomsCount.count ?? 0) === 0;
    const setupChecklist = {
      hasServices: (svcsCount.count ?? 0) > 0,
      hasRooms:    (roomsCount.count ?? 0) > 0,
    };

    return { metrics, appointments, rsvpPendentes, popularServices, needsSetup, setupChecklist };
}

export default async function DashboardPage() {
    const data = await getDashboardData();

    const metrics       = data?.metrics        ?? { atendimentos_hoje: 0, restantes_hoje: 0, noshows_mes: 0, faturamento_mes: 0 };
    const appts         = data?.appointments   ?? [];
    const pendentes     = data?.rsvpPendentes  ?? 0;
    const services      = data?.popularServices ?? [];
    const needsSetup    = data?.needsSetup     ?? false;
    const setupChecklist = data?.setupChecklist ?? { hasServices: false, hasRooms: false };

    const card = { background: "#FFFFFF", border: "1px solid #EDE5D3", borderRadius: "14px" };

    return (
        <div className="px-6 py-5 bg-[#F6F2EA] min-h-full">

            {/* Banner de Onboarding */}
        {needsSetup && (
          <div
            style={{
              background: 'linear-gradient(135deg, #FBF5EA, #F3E8CC)',
              border: '1px solid rgba(184,150,12,0.25)',
              borderRadius: '14px',
              padding: '20px 24px',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <Sparkles size={20} strokeWidth={1.5} color="#B8960C" style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '15px', fontWeight: 700, color: '#2D2319', margin: '0 0 6px' }}>
                  Configure sua clínica antes de começar
                </p>
                <p style={{ fontSize: '12px', color: '#A69060', margin: '0 0 14px' }}>
                  Complete os itens abaixo para usar o sistema com todas as funcionalidades.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {!setupChecklist.hasServices && (
                    <Link
                      href="/servicos"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '7px 14px', borderRadius: '8px',
                        background: 'rgba(184,150,12,0.10)', border: '1px solid rgba(184,150,12,0.25)',
                        fontSize: '12px', fontWeight: 700, color: '#B8960C', textDecoration: 'none',
                      }}
                    >
                      <Scissors size={12} strokeWidth={2} />
                      Cadastrar 1º serviço
                    </Link>
                  )}
                  {!setupChecklist.hasRooms && (
                    <Link
                      href="/config/salas"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '7px 14px', borderRadius: '8px',
                        background: 'rgba(184,150,12,0.10)', border: '1px solid rgba(184,150,12,0.25)',
                        fontSize: '12px', fontWeight: 700, color: '#B8960C', textDecoration: 'none',
                      }}
                    >
                      <DoorOpen size={12} strokeWidth={2} />
                      Cadastrar 1ª sala
                    </Link>
                  )}
                  <Link
                    href="/protocolos/novo"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '7px 14px', borderRadius: '8px',
                      background: 'rgba(184,150,12,0.10)', border: '1px solid rgba(184,150,12,0.25)',
                      fontSize: '12px', fontWeight: 700, color: '#B8960C', textDecoration: 'none',
                    }}
                  >
                    <Layers size={12} strokeWidth={2} />
                    Criar 1º protocolo
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {pendentes > 0 && (
                <div
                    className="rounded-xl px-4 py-2.5 flex items-center gap-3 mb-4 relative overflow-hidden"
                    style={{ ...card, border: "1px solid rgba(196, 136, 10, 0.2)" }}
                >
                    <div className="absolute top-0 left-0 bottom-0 w-1" style={{ background: "#C4880A" }} />
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(196,136,10,0.08)", color: "#C4880A" }}>
                        <AlertCircle size={14} />
                    </div>
                    <div className="flex-1 text-[13px] font-medium" style={{ color: "#2D2319" }}>
                        {pendentes === 1
                            ? "1 cliente ainda não confirmou presença para hoje."
                            : `${pendentes} clientes ainda não confirmaram presença para hoje.`}
                    </div>
                    <button className="flex items-center gap-0.5 text-[11px] font-bold hover:underline" style={{ color: "#C4880A" }}>
                        Ver pendentes <ChevronRight size={12} />
                    </button>
                </div>
            )}

            <DashboardMetrics data={metrics} />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-3">
                    <AppointmentTable appointments={appts} />
                </div>
                <div className="flex flex-col gap-4">
                    <RecentActivity />
                    <PopularServices services={services} />
                </div>
            </div>
        </div>
    );
}
