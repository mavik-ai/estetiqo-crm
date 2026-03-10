'use client'

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClienteSearch } from "@/components/ui/ClienteSearch";
import { criarProtocolo } from "./actions";

interface Service { id: string; name: string; }

interface Props {
  services: Service[];
  errorMsg?: string | null;
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: "10px",
  border: "1px solid var(--border)", background: "#FAFAF8",
  color: "var(--foreground)", fontSize: "14px", fontFamily: "inherit", outline: "none",
  boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "12px", fontWeight: 600, color: "#BBA870",
  textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px",
};

export function NovoProtocoloForm({ services, errorMsg }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [clientId, setClientId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [totalSessions, setTotalSessions] = useState("10");
  const [endDate, setEndDate] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clientId || !serviceId || !totalSessions) {
      setLocalError("Preencha os campos obrigatórios (cliente, serviço e número de sessões).");
      return;
    }
    setLocalError(null);
    const fd = new FormData();
    fd.set("client_id", clientId);
    fd.set("service_id", serviceId);
    fd.set("total_sessions", totalSessions);
    if (endDate)      fd.set("expected_end_date", endDate);
    if (targetWeight) fd.set("target_weight", targetWeight);

    startTransition(async () => {
      const result = await criarProtocolo(fd);
      // criarProtocolo faz redirect interno — se chegou aqui é por erro retornado via searchParams
      // mas como a action faz redirect, isso não ocorre normalmente
      void result;
      router.refresh();
    });
  }

  const error = localError || errorMsg;

  return (
    <div
      style={{
        background: "var(--card)", border: "1px solid var(--border)",
        borderRadius: "14px", padding: "28px", maxWidth: "600px",
      }}
    >
      {error && (
        <div style={{
          padding: "10px 14px", borderRadius: "8px",
          background: "rgba(217,68,68,0.08)", border: "1px solid rgba(217,68,68,0.2)",
          color: "#D94444", fontSize: "13px", marginBottom: "20px",
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* Paciente — busca por digitação */}
        <div>
          <label style={labelStyle}>Paciente *</label>
          <ClienteSearch
            value={clientId}
            onChange={(id) => setClientId(id)}
            placeholder="Digite o nome da paciente..."
          />
        </div>

        {/* Serviço */}
        <div>
          <label style={labelStyle} htmlFor="service_id">Serviço *</label>
          <select
            id="service_id"
            value={serviceId}
            onChange={e => setServiceId(e.target.value)}
            required
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            <option value="">Selecionar serviço...</option>
            {services.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Total de Sessões */}
        <div>
          <label style={labelStyle} htmlFor="total_sessions">Total de Sessões *</label>
          <input
            id="total_sessions"
            type="number"
            min="1"
            max="100"
            value={totalSessions}
            onChange={e => setTotalSessions(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        {/* Data Prevista de Término */}
        <div>
          <label style={labelStyle} htmlFor="expected_end_date">Data Prevista de Término</label>
          <input
            id="expected_end_date"
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Peso-Alvo */}
        <div>
          <label style={labelStyle} htmlFor="target_weight">Peso-Alvo (kg)</label>
          <input
            id="target_weight"
            type="number"
            min="30"
            max="300"
            step="0.1"
            placeholder="Ex: 65.5"
            value={targetWeight}
            onChange={e => setTargetWeight(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Botões */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "12px", paddingTop: "8px" }}>
          <Link
            href="/protocolos"
            style={{
              padding: "10px 20px", borderRadius: "10px",
              border: "1px solid var(--border)", background: "transparent",
              color: "var(--muted-foreground)", fontSize: "14px", fontWeight: 600, textDecoration: "none",
            }}
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isPending}
            style={{
              background: isPending ? "#EDE5D3" : "linear-gradient(135deg, #D4B86A, #B8960C)",
              color: "#161412", fontSize: "14px", fontWeight: 700,
              padding: "10px 28px", borderRadius: "10px", border: "none",
              cursor: isPending ? "not-allowed" : "pointer", fontFamily: "inherit",
            }}
          >
            {isPending ? "Criando..." : "Criar Protocolo"}
          </button>
        </div>
      </form>
    </div>
  );
}
