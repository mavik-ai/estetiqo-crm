import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Activity, Calendar, Target, Plus } from "lucide-react";

interface Protocol {
  id: string;
  total_sessions: number;
  completed_sessions: number;
  status: string;
  expected_end_date: string | null;
  target_weight: number | null;
  clients: { id: string; name: string } | null;
  services: { id: string; name: string } | null;
}

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  active:    { label: "Ativo",     bg: "rgba(45,140,78,0.10)",  color: "#2D8C4E" },
  completed: { label: "Concluído", bg: "rgba(58,123,213,0.10)", color: "#3A7BD5" },
  cancelled: { label: "Cancelado", bg: "rgba(217,68,68,0.10)",  color: "#D94444" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? { label: status, bg: "rgba(166,144,96,0.10)", color: "var(--muted-foreground)" };
  return (
    <span
      style={{
        background: cfg.bg,
        color: cfg.color,
        borderRadius: "20px",
        padding: "2px 10px",
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "0.02em",
      }}
    >
      {cfg.label}
    </span>
  );
}

function ProgressBar({ completed, total }: { completed: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
  return (
    <div>
      <div
        style={{
          background: "#EDE5D3",
          borderRadius: "99px",
          height: "8px",
          overflow: "hidden",
          width: "100%",
        }}
      >
        <div
          style={{
            background: "linear-gradient(90deg, #D4B86A, #B8960C)",
            borderRadius: "99px",
            height: "100%",
            width: `${pct}%`,
            transition: "width 0.4s ease",
          }}
        />
      </div>
      <div className="flex justify-between items-center mt-1.5">
        <span style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
          {completed} de {total} sessões
        </span>
        <span style={{ fontSize: "12px", fontWeight: 600, color: "#B8960C" }}>{pct}%</span>
      </div>
    </div>
  );
}

async function getProtocols(tenantId: string, statusFilter?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("protocols")
    .select(
      "id, total_sessions, completed_sessions, status, expected_end_date, target_weight, clients(id, name), services(id, name)"
    )
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data } = await query;
  return (data ?? []) as unknown as Protocol[];
}

export default async function ProtocolosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", user!.id)
    .single();

  const tenantId = profile!.tenant_id;
  const params = await searchParams;
  const statusFilter = params.status ?? "all";

  const protocols = await getProtocols(tenantId, statusFilter);

  const activeCount = protocols.filter((p) => p.status === "active").length;

  const card = {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "14px",
  };

  const filterButtons = [
    { key: "all",       label: "Todos"      },
    { key: "active",    label: "Ativos"     },
    { key: "completed", label: "Concluídos" },
    { key: "cancelled", label: "Cancelados" },
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
            Protocolos
          </h1>
          <p style={{ color: "var(--muted-foreground)", fontSize: "13px", marginTop: "2px" }}>
            {statusFilter === "all" ? protocols.length : activeCount} protocolo
            {protocols.length !== 1 ? "s" : ""}{" "}
            {statusFilter === "active"
              ? "ativos"
              : statusFilter === "completed"
              ? "concluídos"
              : statusFilter === "cancelled"
              ? "cancelados"
              : "no total"}
          </p>
        </div>

        {/* Ações + Filtros */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/protocolos/novo"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "linear-gradient(135deg, #D4B86A, #B8960C)",
              color: "#161412",
              fontSize: "13px",
              fontWeight: 700,
              padding: "8px 16px",
              borderRadius: "10px",
              textDecoration: "none",
            }}
          >
            <Plus size={14} strokeWidth={2.5} />
            Novo Protocolo
          </Link>
        </div>

        {/* Filtros de status */}
        <div className="flex gap-2 flex-wrap">
          {filterButtons.map((btn) => {
            const isActive = statusFilter === btn.key;
            return (
              <Link
                key={btn.key}
                href={btn.key === "all" ? "/protocolos" : `/protocolos?status=${btn.key}`}
                style={{
                  padding: "6px 14px",
                  borderRadius: "99px",
                  fontSize: "12px",
                  fontWeight: 600,
                  border: isActive ? "1px solid #B8960C" : "1px solid #EDE5D3",
                  background: isActive
                    ? "linear-gradient(135deg, #D4B86A, #B8960C)"
                    : "#FFFFFF",
                  color: isActive ? "#161412" : "#A69060",
                  textDecoration: "none",
                  transition: "all 0.15s ease",
                }}
              >
                {btn.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Grid de cards */}
      {protocols.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20"
          style={{ ...card, padding: "60px 20px" }}
        >
          <Activity size={40} strokeWidth={1} color="#BBA870" />
          <p
            style={{
              color: "var(--muted-foreground)",
              fontSize: "15px",
              marginTop: "12px",
              textAlign: "center",
            }}
          >
            Nenhum protocolo encontrado
            {statusFilter !== "all" ? ` com status "${filterButtons.find(b => b.key === statusFilter)?.label}"` : ""}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {protocols.map((protocol) => {
            const clientName = protocol.clients?.name ?? "—";
            const serviceName = protocol.services?.name ?? "—";

            let endDateStr = "—";
            if (protocol.expected_end_date) {
              endDateStr = new Date(protocol.expected_end_date).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              });
            }

            return (
              <div
                key={protocol.id}
                style={{ ...card, padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}
              >
                {/* Topo do card */}
                <div className="flex items-start justify-between">
                  <div>
                    <p
                      style={{
                        fontWeight: 600,
                        fontSize: "15px",
                        color: "var(--foreground)",
                        margin: 0,
                      }}
                    >
                      {clientName}
                    </p>
                    <p style={{ color: "var(--muted-foreground)", fontSize: "13px", marginTop: "2px" }}>
                      {serviceName}
                    </p>
                  </div>
                  <StatusBadge status={protocol.status} />
                </div>

                {/* Barra de progresso */}
                <ProgressBar
                  completed={protocol.completed_sessions}
                  total={protocol.total_sessions}
                />

                {/* Rodapé */}
                <div
                  className="flex items-center justify-between pt-2"
                  style={{ borderTop: "1px solid #F0EBE0" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5" style={{ color: "var(--muted-foreground)", fontSize: "12px" }}>
                      <Calendar size={13} strokeWidth={1.5} />
                      <span>{endDateStr}</span>
                    </div>
                    {protocol.target_weight && (
                      <div className="flex items-center gap-1.5" style={{ color: "var(--muted-foreground)", fontSize: "12px" }}>
                        <Target size={13} strokeWidth={1.5} />
                        <span>{protocol.target_weight} kg</span>
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/protocolos/${protocol.id}`}
                    style={{
                      color: "#B8960C",
                      fontSize: "12px",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    Ver detalhe →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
