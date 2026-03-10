'use client'

import { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SignatureCanvas } from "@/components/ui/SignatureCanvas";
import { assinarProtocolo } from "./actions";
import { CheckCircle2 } from "lucide-react";

interface Props {
  protocolId: string;
  clientName: string;
  serviceName: string;
  totalSessions: number;
}

export function AssinarForm({ protocolId, clientName, serviceName, totalSessions }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [signature, setSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = useCallback((d: string | null) => setSignature(d), []);

  function handleSubmit() {
    if (!signature) return;
    setError(null);
    startTransition(async () => {
      const result = await assinarProtocolo(protocolId, signature);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.push(`/protocolos/${protocolId}?assinado=1`);
    });
  }

  return (
    <div>
      {/* Termo de autorização */}
      <div style={{
        background: "#FBF5EA", border: "1px solid rgba(184,150,12,0.2)",
        borderRadius: "12px", padding: "18px", marginBottom: "24px",
      }}>
        <p style={{ fontSize: "13px", color: "#5C4A1E", lineHeight: "1.8", margin: 0 }}>
          Autorizo o início do protocolo de <strong>{serviceName}</strong> composto por{" "}
          <strong>{totalSessions} sessões</strong>, conforme acordado com a profissional.
          Declaro que fui orientada sobre os procedimentos a serem realizados e concordo
          com os termos e condições do tratamento.
        </p>
      </div>

      {/* Canvas de assinatura */}
      <div style={{
        background: "var(--card)", border: "1px solid var(--border)", borderRadius: "14px", padding: "20px",
      }}>
        <p style={{
          fontSize: "11px", fontWeight: 700, color: "#BBA870",
          letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "8px",
        }}>
          Assinatura de {clientName}
        </p>
        <p style={{ fontSize: "12px", color: "var(--muted-foreground)", marginBottom: "12px" }}>
          Entregue o dispositivo para a cliente assinar abaixo
        </p>
        <SignatureCanvas onChange={handleChange} />
      </div>

      {error && (
        <div style={{
          marginTop: "12px", padding: "9px 12px", borderRadius: "8px",
          background: "rgba(217,68,68,0.07)", border: "1px solid rgba(217,68,68,0.2)",
          color: "#D94444", fontSize: "12px",
        }}>
          {error}
        </div>
      )}

      {/* Ações */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px", marginTop: "20px" }}>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!signature || isPending}
          style={{
            padding: "13px 28px", borderRadius: "10px", border: "none",
            background: !signature || isPending ? "#EDE5D3" : "linear-gradient(135deg, #D4B86A, #B8960C)",
            color: "#161412", fontSize: "14px", fontWeight: 700,
            cursor: !signature || isPending ? "not-allowed" : "pointer",
            fontFamily: "inherit", display: "flex", alignItems: "center", gap: "6px",
          }}
        >
          {isPending ? "Salvando..." : <><CheckCircle2 size={16} /> Confirmar Assinatura</>}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/protocolos/${protocolId}`)}
          disabled={isPending}
          style={{
            background: "none", border: "none", color: "#BBA870", fontSize: "12px",
            cursor: "pointer", textDecoration: "underline", padding: 0, fontFamily: "inherit",
          }}
        >
          Pular — coletar assinatura depois
        </button>
      </div>
    </div>
  );
}
