import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { criarProtocolo } from "./actions";

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

const errorMessages: Record<string, string> = {
  campos: "Preencha os campos obrigatórios (cliente, serviço e número de sessões).",
  save:   "Erro ao salvar protocolo. Tente novamente.",
};

export default async function NovoProtocoloPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", user!.id)
    .single();

  const tenantId = profile!.tenant_id;

  const [clientsRes, servicesRes] = await Promise.all([
    supabase
      .from("clients")
      .select("id, name")
      .eq("tenant_id", tenantId)
      .order("name")
      .limit(200),
    supabase
      .from("services")
      .select("id, name")
      .eq("tenant_id", tenantId)
      .eq("is_active", true)
      .order("name"),
  ]);

  const clients  = clientsRes.data  ?? [];
  const services = servicesRes.data ?? [];

  const params = await searchParams;
  const errorKey = params.error;
  const errorMsg = errorKey ? (errorMessages[errorKey] ?? "Erro inesperado.") : null;

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
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "22px",
            fontWeight: 700,
            color: "#2D2319",
            margin: 0,
          }}
        >
          Novo Protocolo
        </h1>
      </div>

      {/* Card formulário */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #EDE5D3",
          borderRadius: "14px",
          padding: "28px",
          maxWidth: "600px",
        }}
      >
        {errorMsg && (
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
            {errorMsg}
          </div>
        )}

        <form action={criarProtocolo} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Paciente */}
          <div>
            <label style={labelStyle} htmlFor="client_id">Paciente *</label>
            <select
              id="client_id"
              name="client_id"
              required
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              <option value="">Selecionar paciente...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Serviço */}
          <div>
            <label style={labelStyle} htmlFor="service_id">Serviço *</label>
            <select
              id="service_id"
              name="service_id"
              required
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              <option value="">Selecionar serviço...</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Total de Sessões */}
          <div>
            <label style={labelStyle} htmlFor="total_sessions">Total de Sessões *</label>
            <input
              id="total_sessions"
              name="total_sessions"
              type="number"
              min="1"
              max="100"
              defaultValue="10"
              required
              style={inputStyle}
            />
          </div>

          {/* Data Prevista de Término */}
          <div>
            <label style={labelStyle} htmlFor="expected_end_date">Data Prevista de Término</label>
            <input
              id="expected_end_date"
              name="expected_end_date"
              type="date"
              style={inputStyle}
            />
          </div>

          {/* Peso-Alvo */}
          <div>
            <label style={labelStyle} htmlFor="target_weight">Peso-Alvo (kg)</label>
            <input
              id="target_weight"
              name="target_weight"
              type="number"
              min="30"
              max="300"
              step="0.1"
              placeholder="Ex: 65.5"
              style={inputStyle}
            />
          </div>

          {/* Botões */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/protocolos"
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
              Criar Protocolo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
