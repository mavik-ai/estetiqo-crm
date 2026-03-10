import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Calendar, TrendingUp, UserX, Star, Layers, UserPlus } from "lucide-react";

const card = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "14px",
} as const;

const periodos = [
  { key: "7",  label: "7 dias"  },
  { key: "30", label: "30 dias" },
  { key: "90", label: "3 meses" },
];

function getDateRange(days: number): { start: string; end: string } {
  const end   = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return {
    start: start.toISOString(),
    end:   end.toISOString(),
  };
}

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", user!.id)
    .single();

  const tenantId = profile!.tenant_id;

  const sp     = await searchParams;
  const days   = Number(sp.periodo ?? 30);
  const { start, end } = getDateRange(days);

  // Buscar tudo em paralelo
  const [appointmentsRes, sessionsRes, newClientsRes] = await Promise.all([
    supabase
      .from("appointments")
      .select("id, no_show, services(name, price)")
      .eq("tenant_id", tenantId)
      .gte("starts_at", start)
      .lte("starts_at", end),

    supabase
      .from("sessions")
      .select("id", { count: "exact", head: true })
      .gte("performed_at", start)
      .lte("performed_at", end),

    supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .gte("created_at", start)
      .lte("created_at", end),
  ]);

  const allAppointments = appointmentsRes.data ?? [];
  const total           = allAppointments.length;
  const noShows         = allAppointments.filter((a) => a.no_show).length;
  const noShowRate      = total > 0 ? Math.round((noShows / total) * 100) : 0;
  const sessoesCount    = sessionsRes.count ?? 0;
  const novosClientes   = newClientsRes.count ?? 0;

  const faturamento = allAppointments.reduce((acc, a) => {
    const raw = Array.isArray(a.services) ? a.services[0] : a.services;
    const svc = raw as { price: number | null } | null;
    return acc + (svc?.price ?? 0);
  }, 0);

  // Top serviços
  const serviceCount: Record<string, { name: string; count: number; revenue: number }> = {};
  for (const a of allAppointments) {
    const raw = Array.isArray(a.services) ? a.services[0] : a.services;
    const svc = raw as { name: string; price: number | null } | null;
    if (!svc) continue;
    if (!serviceCount[svc.name]) {
      serviceCount[svc.name] = { name: svc.name, count: 0, revenue: 0 };
    }
    serviceCount[svc.name].count++;
    serviceCount[svc.name].revenue += svc.price ?? 0;
  }
  const topServices = Object.values(serviceCount)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const currencyFmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

  const metricCards = [
    {
      icon: <Calendar size={20} strokeWidth={1.5} color="#B8960C" />,
      label: "Agendamentos",
      value: String(total),
      sub: `no período de ${days} dias`,
    },
    {
      icon: <Layers size={20} strokeWidth={1.5} color="#3A7BD5" />,
      label: "Sessões Realizadas",
      value: String(sessoesCount),
      sub: "sessões de protocolo no período",
    },
    {
      icon: <TrendingUp size={20} strokeWidth={1.5} color="#2D8C4E" />,
      label: "Faturamento",
      value: currencyFmt.format(faturamento),
      sub: "soma dos serviços agendados",
    },
    {
      icon: <UserPlus size={20} strokeWidth={1.5} color="#2D8C4E" />,
      label: "Novos Clientes",
      value: String(novosClientes),
      sub: "cadastradas no período",
    },
    {
      icon: <UserX size={20} strokeWidth={1.5} color="#D94444" />,
      label: "Taxa de No-Show",
      value: `${noShowRate}%`,
      sub: `${noShows} de ${total} agendamentos`,
    },
    {
      icon: <Star size={20} strokeWidth={1.5} color="#B8960C" />,
      label: "Tipos de Serviço",
      value: String(topServices.length),
      sub: "serviços distintos realizados",
    },
  ];

  return (
    <div className="px-6 py-5" style={{ background: "var(--background)", minHeight: "100%" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "22px",
              fontWeight: 700,
              color: "var(--foreground)",
              margin: 0,
            }}
          >
            Relatórios
          </h1>
          <p style={{ color: "var(--muted-foreground)", fontSize: "13px", marginTop: "2px" }}>
            Visão geral de desempenho da clínica
          </p>
        </div>

        {/* Filtro de período */}
        <div className="flex gap-2">
          {periodos.map((p) => {
            const isActive = String(days) === p.key;
            return (
              <Link
                key={p.key}
                href={`/relatorios?periodo=${p.key}`}
                style={{
                  padding: "6px 14px",
                  borderRadius: "99px",
                  fontSize: "12px",
                  fontWeight: 600,
                  border: isActive ? "1px solid #B8960C" : "1px solid #EDE5D3",
                  background: isActive ? "linear-gradient(135deg, #D4B86A, #B8960C)" : "var(--card)",
                  color: isActive ? "#161412" : "#A69060",
                  textDecoration: "none",
                }}
              >
                {p.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Métrica cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {metricCards.map((m) => (
          <div key={m.label} style={{ ...card, padding: "20px" }}>
            <div className="flex items-center gap-2 mb-3">
              {m.icon}
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#BBA870", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {m.label}
              </span>
            </div>
            <p style={{ fontSize: "24px", fontWeight: 700, color: "var(--foreground)", margin: "0 0 4px" }}>{m.value}</p>
            <p style={{ fontSize: "12px", color: "var(--muted-foreground)", margin: 0 }}>{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Top Serviços */}
      <div style={{ ...card, padding: "24px" }}>
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "16px",
            fontWeight: 600,
            color: "var(--foreground)",
            margin: "0 0 20px",
          }}
        >
          Serviços Mais Realizados
        </h2>

        {topServices.length === 0 ? (
          <p style={{ color: "var(--muted-foreground)", fontSize: "14px", textAlign: "center", padding: "32px 0" }}>
            Nenhum atendimento no período selecionado.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Serviço", "Atendimentos", "Receita"].map((col) => (
                    <th
                      key={col}
                      style={{
                        textAlign: col === "Serviço" ? "left" : "right",
                        padding: "8px 12px",
                        color: "#BBA870",
                        fontWeight: 600,
                        fontSize: "11px",
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topServices.map((svc, idx) => (
                  <tr
                    key={svc.name}
                    style={{ borderBottom: idx < topServices.length - 1 ? "1px solid #F0EBE0" : "none" }}
                  >
                    <td style={{ padding: "12px", fontWeight: 600, color: "var(--foreground)" }}>
                      {svc.name}
                    </td>
                    <td style={{ padding: "12px", color: "var(--foreground)", textAlign: "right" }}>
                      {svc.count}
                    </td>
                    <td style={{ padding: "12px", color: "#2D8C4E", fontWeight: 600, textAlign: "right" }}>
                      {currencyFmt.format(svc.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
