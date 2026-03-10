'use client'

import { useState, useRef, useTransition } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Camera, X, Check, ChevronLeft, Weight, CalendarDays, StickyNote, Ruler } from "lucide-react";
import { registrarSessaoCompleta } from "./actions";

interface Protocol {
  id: string;
  total_sessions: number;
  completed_sessions: number;
  clientName: string;
  serviceName: string;
}

interface Props {
  protocol: Protocol;
  nextSession: number;
}

type Step = 1 | 2;
const STEP_LABELS = ["Info da Sessão", "Antes"];

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: "10px",
  border: "1px solid var(--border)", background: "var(--card)",
  color: "var(--foreground)", fontSize: "14px", fontFamily: "inherit", outline: "none",
  boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "11px", fontWeight: 700, color: "#BBA870",
  letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px",
};

function PhotoGrid({ files, onRemove }: { files: File[]; onRemove: (i: number) => void }) {
  if (files.length === 0) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
      {files.map((f, i) => (
        <div key={i} style={{ position: "relative", width: "80px", height: "80px" }}>
          <img
            src={URL.createObjectURL(f)}
            alt=""
            style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "10px", border: "1px solid var(--border)" }}
          />
          <button
            type="button"
            onClick={() => onRemove(i)}
            style={{
              position: "absolute", top: "-6px", right: "-6px",
              width: "20px", height: "20px", borderRadius: "50%",
              background: "#D94444", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <X size={11} strokeWidth={2.5} style={{ color: "#fff" }} />
          </button>
        </div>
      ))}
    </div>
  );
}

export function SessaoForm({ protocol, nextSession }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();

  const [step, setStep] = useState<Step>(1);
  const [error, setError] = useState<string | null>(null);

  // Step 1 — Info da Sessão
  const [performedAt, setPerformedAt] = useState(() => new Date().toISOString().split("T")[0]);
  const [absCm, setAbsCm] = useState("");
  const [abiCm, setAbiCm] = useState("");
  const [procedureNotes, setProcedureNotes] = useState("");

  // Step 2 — Antes
  const [photosBefore, setPhotosBefore] = useState<File[]>([]);
  const [weightBefore, setWeightBefore] = useState("");
  const beforeInputRef = useRef<HTMLInputElement>(null);

  function addPhotosBefore(files: FileList | null) {
    if (!files) return;
    setPhotosBefore(p => [...p, ...Array.from(files)]);
  }

  async function uploadPhotos(files: File[], folder: string): Promise<string[]> {
    const paths: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${protocol.id}/${folder}/${Date.now()}_${i}.${ext}`;
      const { error } = await supabase.storage.from("session-photos").upload(path, file);
      if (!error) paths.push(path);
    }
    return paths;
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const beforePaths = await uploadPhotos(photosBefore, "before");

      const result = await registrarSessaoCompleta(protocol.id, {
        weightBefore:    weightBefore ? Number(weightBefore) : null,
        weightAfter:     null,
        absCm:           absCm ? Number(absCm) : null,
        abiCm:           abiCm ? Number(abiCm) : null,
        procedureNotes:  procedureNotes || null,
        performedAt,
        signatureData:   null,
        photosBefore:    beforePaths,
        photosAfter:     [],
      });

      if ("error" in result) {
        setError(result.error);
        setStep(1); // Volta para o step 1 para mostrar o erro de data
        return;
      }

      router.push(`/protocolos/${protocol.id}?saved=1`);
    });
  }

  const progressPct = Math.round((protocol.completed_sessions / protocol.total_sessions) * 100);

  return (
    <div style={{ maxWidth: "560px" }}>
      {/* Barra de progresso do protocolo */}
      <div style={{
        background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px",
        padding: "14px 18px", marginBottom: "16px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--foreground)" }}>
            Sessão #{nextSession} de {protocol.total_sessions}
          </span>
          <span style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>{progressPct}% concluído</span>
        </div>
        <div style={{ height: "6px", background: "#F0EBE0", borderRadius: "3px" }}>
          <div style={{
            height: "100%", borderRadius: "3px",
            background: "linear-gradient(90deg, #D4B86A, #B8960C)",
            width: `${progressPct}%`, transition: "width 0.3s",
          }} />
        </div>
      </div>

      {/* Card principal */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden" }}>

        {/* Steps indicator */}
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center" }}>
          {STEP_LABELS.map((label, i) => {
            const n = (i + 1) as Step;
            const isActive = n === step;
            const isDone = n < step;
            return (
              <div key={n} style={{ display: "flex", alignItems: "center", flex: i < STEP_LABELS.length - 1 ? 1 : "none" as "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", flexShrink: 0 }}>
                  <div style={{
                    width: "22px", height: "22px", borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "10px", fontWeight: 700,
                    background: isDone ? "linear-gradient(135deg, #D4B86A, #B8960C)" : isActive ? "rgba(184,150,12,0.12)" : "#F5EDE0",
                    color: isDone ? "#161412" : isActive ? "#B8960C" : "#BBA870",
                    border: isActive ? "1.5px solid #B8960C" : "none",
                    flexShrink: 0,
                  }}>
                    {isDone ? <Check size={11} strokeWidth={3} /> : n}
                  </div>
                  <span style={{ fontSize: "10px", fontWeight: isActive ? 700 : 500, color: isActive ? "#2D2319" : "#A69060" }}>
                    {label}
                  </span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div style={{ flex: 1, height: "1px", background: "#EDE5D3", margin: "0 6px" }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Body */}
        <div style={{ padding: "22px 20px" }}>

          {/* STEP 1 — Info da Sessão */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <label style={labelStyle}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                    <CalendarDays size={11} /> Data da sessão *
                  </span>
                </label>
                <input
                  type="date"
                  value={performedAt}
                  onChange={e => setPerformedAt(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                      <Ruler size={11} /> ABS (cm)
                    </span>
                  </label>
                  <input
                    type="number" step="0.1" min="0"
                    placeholder="Ex: 90.5"
                    value={absCm}
                    onChange={e => setAbsCm(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                      <Ruler size={11} /> ABI (cm)
                    </span>
                  </label>
                  <input
                    type="number" step="0.1" min="0"
                    placeholder="Ex: 95.0"
                    value={abiCm}
                    onChange={e => setAbiCm(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                    <StickyNote size={11} /> Observações
                  </span>
                </label>
                <textarea
                  placeholder="Descreva o procedimento realizado, observações da sessão..."
                  rows={3}
                  value={procedureNotes}
                  onChange={e => setProcedureNotes(e.target.value)}
                  style={{ ...inputStyle, resize: "vertical", lineHeight: "1.5" }}
                />
              </div>
            </div>
          )}

          {/* STEP 2 — Antes */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <label style={labelStyle}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                    <Weight size={11} /> Peso antes (kg)
                  </span>
                </label>
                <input
                  type="number" step="0.1" min="0"
                  placeholder="Ex: 72.5"
                  value={weightBefore}
                  onChange={e => setWeightBefore(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                    <Camera size={11} /> Foto antes do procedimento
                  </span>
                </label>
                <input
                  ref={beforeInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  style={{ display: "none" }}
                  onChange={e => addPhotosBefore(e.target.files)}
                />
                <button
                  type="button"
                  onClick={() => beforeInputRef.current?.click()}
                  style={{
                    width: "100%", padding: "20px", borderRadius: "10px",
                    border: "2px dashed #D4B86A", background: "rgba(212,184,106,0.04)",
                    cursor: "pointer", display: "flex", flexDirection: "column",
                    alignItems: "center", gap: "8px", fontFamily: "inherit",
                  }}
                >
                  <Camera size={24} strokeWidth={1.5} style={{ color: "#B8960C" }} />
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#B8960C" }}>Tirar foto / selecionar</span>
                  <span style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>Câmera traseira · múltiplas fotos</span>
                </button>
                <PhotoGrid files={photosBefore} onRemove={i => setPhotosBefore(p => p.filter((_, idx) => idx !== i))} />
              </div>

              <div style={{
                padding: "10px 14px", borderRadius: "9px",
                background: "rgba(184,150,12,0.05)", border: "1px solid rgba(184,150,12,0.15)",
                fontSize: "12px", color: "var(--muted-foreground)", lineHeight: 1.5,
              }}>
                💡 O <strong>registro pós-sessão</strong> (peso e foto depois) pode ser feito diretamente na ficha do protocolo após o procedimento.
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              marginTop: "14px", padding: "9px 12px", borderRadius: "8px",
              background: "rgba(217,68,68,0.07)", border: "1px solid rgba(217,68,68,0.2)",
              color: "#D94444", fontSize: "12px",
            }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: "14px 20px 18px", borderTop: "1px solid var(--border)",
          display: "flex", justifyContent: "space-between", gap: "10px",
        }}>
          <button
            type="button"
            onClick={step === 1 ? () => router.back() : () => setStep(1)}
            style={{
              display: "flex", alignItems: "center", gap: "4px",
              padding: "10px 16px", borderRadius: "10px",
              border: "1px solid var(--border)", background: "none",
              fontSize: "13px", color: "var(--muted-foreground)", cursor: "pointer", fontFamily: "inherit",
            }}
          >
            <ChevronLeft size={14} strokeWidth={1.5} />
            {step === 1 ? "Cancelar" : "Voltar"}
          </button>
          <button
            type="button"
            onClick={step === 1 ? () => { setError(null); setStep(2); } : handleSubmit}
            disabled={isPending}
            style={{
              padding: "10px 24px", borderRadius: "10px", border: "none",
              background: isPending ? "#EDE5D3" : "linear-gradient(135deg, #D4B86A, #B8960C)",
              color: "#161412", fontSize: "13px", fontWeight: 700,
              cursor: isPending ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
          >
            {step === 2
              ? (isPending ? "Salvando..." : "Salvar sessão →")
              : "Próximo →"}
          </button>
        </div>
      </div>
    </div>
  );
}
