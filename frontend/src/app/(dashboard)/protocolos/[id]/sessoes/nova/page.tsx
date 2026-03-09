import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { registrarSessao } from "./actions";

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid #EDE5D3",
  background: "#FAFAF8",
  color: "#2D2319",
  fontSize: "14px",
  fontFamily: "inherit",
  outline: "none",
} as const;

const labelStyle = {
  display: "block",
  fontSize: "12px",
  fontWeight: 600,
  color: "#BBA870",
  textTransform: "uppercase" as const,
  letterSpacing: "0.04em",
  marginBottom: "6px",
};

export default async function NovaSessaoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", user!.id)
    .single();

  const tenantId = profile!.tenant_id;

  const { data: protocol } = await supabase
    .from("protocols")
    .select("id, total_sessions, completed_sessions, clients(name), services(name)")
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .single();

  if (!protocol) notFound();

  const clientRaw   = Array.isArray(protocol.clients)  ? protocol.clients[0]  : protocol.clients;
  const serviceRaw  = Array.isArray(protocol.services) ? protocol.services[0] : protocol.services;
  const clientName  = (clientRaw  as { name: string } | null)?.name  ?? "—";
  const serviceName = (serviceRaw as { name: string } | null)?.name ?? "—";
  const nextSession = (protocol.completed_sessions ?? 0) + 1;

  const sp      = await searchParams;
  const hasError = sp.error === "save";

  // Data de hoje no formato YYYY-MM-DD para o input date
  const today = new Date().toISOString().split("T")[0];

  const registrarSessaoComId = registrarSessao.bind(null, id);

  return (
    <div className="px-6 py-5" style={{ background: "#F6F2EA", minHeight: "100%" }}>
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/protocolos/${id}`}
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
          {clientName}
        </Link>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "22px",
            fontWeight: 700,
            color: "#2D2319",
            margin: 0,
          }}
        >
          Registrar Sessão #{nextSession}
        </h1>
        <p style={{ color: "#A69060", fontSize: "14px", marginTop: "2px" }}>
          {serviceName} · {protocol.completed_sessions}/{protocol.total_sessions} sessões concluídas
        </p>
      </div>

      {/* Card formulário */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #EDE5D3",
          borderRadius: "14px",
          padding: "28px",
          maxWidth: "560px",
        }}
      >
        {hasError && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              background: "rgba(217,68,68,0.08)",
              border: "1px solid rgba(217,68,68,0.2)",
              color: "#D94444",
              fontSize: "13px",
              marginBottom: "20px",
            }}
          >
            Erro ao registrar sessão. Tente novamente.
          </div>
        )}

        <form
          action={registrarSessaoComId}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          {/* Data da sessão */}
          <div>
            <label style={labelStyle} htmlFor="performed_at">Data da Sessão *</label>
            <input
              id="performed_at"
              name="performed_at"
              type="date"
              defaultValue={today}
              required
              style={inputStyle}
            />
          </div>

          {/* Medidas corporais */}
          <div>
            <p
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#BBA870",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                margin: "0 0 12px",
              }}
            >
              Medidas Corporais
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label style={labelStyle} htmlFor="abs_cm">ABS (cm)</label>
                <input
                  id="abs_cm"
                  name="abs_cm"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="Ex: 90.5"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle} htmlFor="abi_cm">ABI (cm)</label>
                <input
                  id="abi_cm"
                  name="abi_cm"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="Ex: 95.0"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle} htmlFor="weight_kg">Peso (kg)</label>
                <input
                  id="weight_kg"
                  name="weight_kg"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="Ex: 72.3"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Procedimento realizado */}
          <div>
            <label style={labelStyle} htmlFor="procedure_notes">Procedimento Realizado</label>
            <textarea
              id="procedure_notes"
              name="procedure_notes"
              placeholder="Descreva o procedimento realizado nesta sessão..."
              rows={4}
              style={{ ...inputStyle, resize: "vertical", lineHeight: "1.5" }}
            />
          </div>

          {/* Botões */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href={`/protocolos/${id}`}
              style={{
                padding: "10px 20px",
                borderRadius: "10px",
                border: "1px solid #EDE5D3",
                background: "transparent",
                color: "#A69060",
                fontSize: "14px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Cancelar
            </Link>
            <button
              type="submit"
              style={{
                background: "linear-gradient(135deg, #D4B86A, #B8960C)",
                color: "#161412",
                fontSize: "14px",
                fontWeight: 700,
                padding: "10px 28px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Registrar Sessão
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
