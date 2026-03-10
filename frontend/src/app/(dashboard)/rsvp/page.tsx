import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { MessageSquare, CheckCircle, Clock, XCircle, ArrowRight } from "lucide-react";

const rsvpConfig: Record<string, { label: string; icon: React.ReactNode; bg: string; color: string }> = {
  confirmed: { label: "Confirmado", icon: <CheckCircle size={14} strokeWidth={1.5} />, bg: "rgba(45,140,78,0.10)",  color: "#2D8C4E" },
  pending:   { label: "Pendente",   icon: <Clock      size={14} strokeWidth={1.5} />, bg: "rgba(184,150,12,0.10)", color: "#B8960C" },
  cancelled: { label: "Cancelado",  icon: <XCircle    size={14} strokeWidth={1.5} />, bg: "rgba(217,68,68,0.10)",  color: "#D94444" },
};

export default async function RSVPPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", user!.id)
    .single();

  const tenantId = profile!.tenant_id;

  // Próximos agendamentos pendentes de confirmação (futuros)
  const { data: pending } = await supabase
    .from("appointments")
    .select("id, starts_at, rsvp_status, clients(name), services(name)")
    .eq("tenant_id", tenantId)
    .eq("rsvp_status", "pending")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at")
    .limit(30);

  const appointments = pending ?? [];

  const card = {
    background: "#FFFFFF",
    border: "1px solid #EDE5D3",
    borderRadius: "14px",
  } as const;

  return (
    <div className="px-6 py-5" style={{ background: "#F6F2EA", minHeight: "100%" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
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
            RSVP
          </h1>
          <p style={{ color: "#A69060", fontSize: "13px", marginTop: "2px" }}>
            Confirmações de presença pendentes
          </p>
        </div>

        {/* Badge de pendentes */}
        {appointments.length > 0 && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              borderRadius: "99px",
              background: "rgba(184,150,12,0.10)",
              border: "1px solid rgba(184,150,12,0.25)",
              color: "#B8960C",
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            <Clock size={14} strokeWidth={2} />
            {appointments.length} pendente{appointments.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Info sobre Onda 6 */}
      <div
        style={{
          ...card,
          padding: "20px 24px",
          marginBottom: "20px",
          background: "linear-gradient(135deg, #FBF5EA, #F3E8CC)",
          border: "1px solid rgba(184,150,12,0.25)",
        }}
      >
        <div className="flex items-start gap-3">
          <MessageSquare size={20} strokeWidth={1.5} color="#B8960C" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "#2D2319", margin: "0 0 4px" }}>
              Automação WhatsApp em breve
            </p>
            <p style={{ fontSize: "12px", color: "#A69060", margin: 0 }}>
              A Onda 6 do sistema trará disparos automáticos via WhatsApp (Evolution API) assim que o agendamento for criado.
              Por enquanto, gerencie as confirmações manualmente pela Agenda.
            </p>
          </div>
        </div>
        <div className="flex justify-end mt-3">
          <Link
            href="/agenda"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              fontWeight: 700,
              color: "#B8960C",
              textDecoration: "none",
            }}
          >
            Ver na Agenda
            <ArrowRight size={12} strokeWidth={2.5} />
          </Link>
        </div>
      </div>

      {/* Lista de pendentes */}
      {appointments.length === 0 ? (
        <div
          style={{ ...card, padding: "60px 20px", display: "flex", flexDirection: "column", alignItems: "center" }}
        >
          <CheckCircle size={40} strokeWidth={1} color="#2D8C4E" />
          <p style={{ color: "#A69060", fontSize: "15px", marginTop: "12px", textAlign: "center" }}>
            Nenhuma confirmação pendente. Tudo em ordem!
          </p>
        </div>
      ) : (
        <div style={{ ...card, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #EDE5D3" }}>
                  {["Paciente", "Serviço", "Data/Hora", "Status"].map((col) => (
                    <th
                      key={col}
                      style={{
                        textAlign: "left",
                        padding: "12px 16px",
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
                {appointments.map((appt, idx) => {
                  const clientRaw  = Array.isArray(appt.clients)  ? appt.clients[0]  : appt.clients;
                  const serviceRaw = Array.isArray(appt.services) ? appt.services[0] : appt.services;
                  const clientName  = (clientRaw  as { name: string } | null)?.name  ?? "—";
                  const serviceName = (serviceRaw as { name: string } | null)?.name ?? "—";
                  const dateStr = appt.starts_at
                    ? new Date(appt.starts_at).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—";
                  const cfg = rsvpConfig[appt.rsvp_status] ?? rsvpConfig.pending;
                  return (
                    <tr
                      key={appt.id}
                      style={{ borderBottom: idx < appointments.length - 1 ? "1px solid #F0EBE0" : "none" }}
                    >
                      <td style={{ padding: "12px 16px", fontWeight: 600, color: "#2D2319" }}>{clientName}</td>
                      <td style={{ padding: "12px 16px", color: "#A69060" }}>{serviceName}</td>
                      <td style={{ padding: "12px 16px", color: "#2D2319", whiteSpace: "nowrap" }}>{dateStr}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            background: cfg.bg,
                            color: cfg.color,
                            borderRadius: "20px",
                            padding: "3px 10px",
                            fontSize: "11px",
                            fontWeight: 600,
                          }}
                        >
                          {cfg.icon}
                          {cfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
