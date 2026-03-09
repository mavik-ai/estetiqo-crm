import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, User, CalendarClock, Target, Layers, Plus } from "lucide-react";

interface Session {
  id: string;
  session_number: number;
  abs_cm: number | null;
  abi_cm: number | null;
  weight_kg: number | null;
  procedure_notes: string | null;
  performed_at: string | null;
}

interface Protocol {
  id: string;
  total_sessions: number;
  completed_sessions: number;
  status: string;
  expected_end_date: string | null;
  target_weight: number | null;
  clients: { id: string; name: string } | null;
  services: { id: string; name: string; duration_minutes: number | null } | null;
}

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  active:    { label: "Ativo",     bg: "rgba(45,140,78,0.10)",  color: "#2D8C4E" },
  completed: { label: "Concluído", bg: "rgba(58,123,213,0.10)", color: "#3A7BD5" },
  cancelled: { label: "Cancelado", bg: "rgba(217,68,68,0.10)",  color: "#D94444" },
};

const card = {
  background: "#FFFFFF",
  border: "1px solid #EDE5D3",
  borderRadius: "14px",
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? { label: status, bg: "rgba(166,144,96,0.10)", color: "#A69060" };
  return (
    <span
      style={{
        background: cfg.bg,
        color: cfg.color,
        borderRadius: "20px",
        padding: "3px 12px",
        fontSize: "11px",
        fontWeight: 600,
      }}
    >
      {cfg.label}
    </span>
  );
}

function BigProgressBar({ completed, total }: { completed: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
  return (
    <div>
      <div className="flex justify-between items-end mb-2">
        <p style={{ fontSize: "13px", color: "#A69060", margin: 0 }}>Progresso do protocolo</p>
        <p style={{ fontSize: "28px", fontWeight: 700, color: "#B8960C", margin: 0 }}>{pct}%</p>
      </div>
      <div
        style={{
          background: "#EDE5D3",
          borderRadius: "99px",
          height: "12px",
          overflow: "hidden",
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
      <p style={{ color: "#A69060", fontSize: "13px", marginTop: "8px", margin: "8px 0 0" }}>
        <span style={{ fontWeight: 600, color: "#2D2319" }}>{completed}</span> de{" "}
        <span style={{ fontWeight: 600, color: "#2D2319" }}>{total}</span> sessões completadas
      </p>
    </div>
  );
}

export default async function ProtocoloDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  const [protocolRes, sessionsRes] = await Promise.all([
    supabase
      .from("protocols")
      .select("*, clients(id, name), services(id, name, duration_minutes)")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .single(),

    supabase
      .from("sessions")
      .select("*")
      .eq("protocol_id", id)
      .order("session_number"),
  ]);

  if (!protocolRes.data) notFound();

  const protocol = protocolRes.data as Protocol;
  const sessions = (sessionsRes.data ?? []) as Session[];

  const clientName = protocol.clients?.name ?? "—";
  const serviceName = protocol.services?.name ?? "—";

  const endDateStr = protocol.expected_end_date
    ? new Date(protocol.expected_end_date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Não definida";

  const statusCfg = statusConfig[protocol.status] ?? {
    label: protocol.status,
    bg: "rgba(166,144,96,0.10)",
    color: "#A69060",
  };

  return (
    <div className="px-6 py-5" style={{ background: "#F6F2EA", minHeight: "100%" }}>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/protocolos"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "#A69060",
            fontSize: "13px",
            textDecoration: "none",
            marginBottom: "12px",
          }}
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Protocolos
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "22px",
                fontWeight: 700,
                color: "#2D2319",
                margin: 0,
              }}
            >
              {clientName}
            </h1>
            <p style={{ color: "#A69060", fontSize: "14px", marginTop: "2px" }}>{serviceName}</p>
          </div>
          <StatusBadge status={protocol.status} />
        </div>
      </div>

      {/* Grid 2 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Coluna principal — 2/3 */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Card Progresso */}
          <div style={{ ...card, padding: "24px" }}>
            <BigProgressBar
              completed={protocol.completed_sessions}
              total={protocol.total_sessions}
            />
          </div>

          {/* Card Histórico de Sessões */}
          <div style={{ ...card, padding: "24px" }}>
            <div className="flex items-center justify-between mb-4">
              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#2D2319",
                  margin: 0,
                }}
              >
                Histórico de Sessões
              </h2>
              <Link
                href={`/protocolos/${id}/sessoes/nova`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "linear-gradient(135deg, #D4B86A, #B8960C)",
                  color: "#161412",
                  fontSize: "12px",
                  fontWeight: 600,
                  padding: "7px 14px",
                  borderRadius: "8px",
                  textDecoration: "none",
                }}
              >
                <Plus size={13} strokeWidth={2} />
                Registrar Sessão
              </Link>
            </div>

            {sessions.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-12"
                style={{ color: "#A69060" }}
              >
                <Layers size={36} strokeWidth={1} color="#BBA870" />
                <p style={{ marginTop: "10px", fontSize: "14px" }}>
                  Nenhuma sessão registrada ainda.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #EDE5D3" }}>
                      {["Sessão #", "ABS (cm)", "ABI (cm)", "Peso (kg)", "Procedimento", "Data"].map(
                        (col) => (
                          <th
                            key={col}
                            style={{
                              textAlign: "left",
                              padding: "8px 10px",
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
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((session, idx) => {
                      const dateStr = session.performed_at
                        ? new Date(session.performed_at).toLocaleDateString("pt-BR")
                        : "—";
                      return (
                        <tr
                          key={session.id}
                          style={{
                            borderBottom:
                              idx < sessions.length - 1 ? "1px solid #F0EBE0" : "none",
                          }}
                        >
                          <td style={{ padding: "10px", fontWeight: 600, color: "#2D2319" }}>
                            {session.session_number}
                          </td>
                          <td style={{ padding: "10px", color: "#2D2319" }}>
                            {session.abs_cm ?? "—"}
                          </td>
                          <td style={{ padding: "10px", color: "#2D2319" }}>
                            {session.abi_cm ?? "—"}
                          </td>
                          <td style={{ padding: "10px", color: "#2D2319" }}>
                            {session.weight_kg ?? "—"}
                          </td>
                          <td
                            style={{
                              padding: "10px",
                              color: "#A69060",
                              maxWidth: "200px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {session.procedure_notes ?? "—"}
                          </td>
                          <td style={{ padding: "10px", color: "#A69060", whiteSpace: "nowrap" }}>
                            {dateStr}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Coluna lateral — 1/3 */}
        <div className="flex flex-col gap-4">
          {/* Card Dados do Protocolo */}
          <div style={{ ...card, padding: "20px" }}>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "15px",
                fontWeight: 600,
                color: "#2D2319",
                margin: "0 0 16px",
              }}
            >
              Dados do Protocolo
            </h2>
            <div className="flex flex-col gap-3">
              <div>
                <p style={{ fontSize: "11px", color: "#BBA870", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", margin: 0 }}>
                  Serviço
                </p>
                <p style={{ fontSize: "13px", color: "#2D2319", margin: "3px 0 0", fontWeight: 500 }}>
                  {serviceName}
                </p>
              </div>
              <div style={{ borderTop: "1px solid #F0EBE0", paddingTop: "12px" }}>
                <p style={{ fontSize: "11px", color: "#BBA870", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", margin: 0 }}>
                  Total de Sessões
                </p>
                <p style={{ fontSize: "13px", color: "#2D2319", margin: "3px 0 0", fontWeight: 500 }}>
                  {protocol.total_sessions} sessões
                </p>
              </div>
              {protocol.target_weight && (
                <div style={{ borderTop: "1px solid #F0EBE0", paddingTop: "12px" }}>
                  <p style={{ fontSize: "11px", color: "#BBA870", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", margin: 0 }}>
                    Peso-Alvo
                  </p>
                  <div className="flex items-center gap-1.5" style={{ marginTop: "3px" }}>
                    <Target size={13} strokeWidth={1.5} color="#B8960C" />
                    <p style={{ fontSize: "13px", color: "#2D2319", margin: 0, fontWeight: 500 }}>
                      {protocol.target_weight} kg
                    </p>
                  </div>
                </div>
              )}
              <div style={{ borderTop: "1px solid #F0EBE0", paddingTop: "12px" }}>
                <p style={{ fontSize: "11px", color: "#BBA870", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", margin: 0 }}>
                  Data Prevista de Término
                </p>
                <div className="flex items-center gap-1.5" style={{ marginTop: "3px" }}>
                  <CalendarClock size={13} strokeWidth={1.5} color="#A69060" />
                  <p style={{ fontSize: "13px", color: "#2D2319", margin: 0, fontWeight: 500 }}>
                    {endDateStr}
                  </p>
                </div>
              </div>
              <div style={{ borderTop: "1px solid #F0EBE0", paddingTop: "12px" }}>
                <p style={{ fontSize: "11px", color: "#BBA870", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", margin: 0 }}>
                  Status
                </p>
                <div style={{ marginTop: "6px" }}>
                  <StatusBadge status={protocol.status} />
                </div>
              </div>
            </div>
          </div>

          {/* Card Paciente */}
          <div style={{ ...card, padding: "20px" }}>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "15px",
                fontWeight: 600,
                color: "#2D2319",
                margin: "0 0 12px",
              }}
            >
              Paciente
            </h2>
            <div className="flex items-center gap-3">
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #D4B86A, #B8960C)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <User size={16} strokeWidth={1.5} color="#161412" />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#2D2319",
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {clientName}
                </p>
                {protocol.clients?.id && (
                  <Link
                    href={`/clientes/${protocol.clients.id}`}
                    style={{
                      fontSize: "12px",
                      color: "#B8960C",
                      textDecoration: "none",
                      fontWeight: 600,
                    }}
                  >
                    Ver ficha da paciente
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
