'use client'

import { useState, useRef, useCallback, useTransition } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Camera, X, Check, ChevronLeft } from "lucide-react";
import { SignatureCanvas } from "@/components/ui/SignatureCanvas";
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

type Step = 1 | 2 | 3 | 4;
const STEP_LABELS = ["Antes", "Procedimento", "Depois", "Assinatura"];

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: "10px",
  border: "1px solid #EDE5D3", background: "#FAFAF8",
  color: "#2D2319", fontSize: "14px", fontFamily: "inherit", outline: "none",
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
            style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "10px", border: "1px solid #EDE5D3" }}
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

  // Step 1 — Antes
  const [photosBefore, setPhotosBefore] = useState<File[]>([]);
  const [weightBefore, setWeightBefore] = useState("");
  const beforeInputRef = useRef<HTMLInputElement>(null);

  // Step 2 — Procedimento
  const [performedAt, setPerformedAt] = useState(() => new Date().toISOString().split("T")[0]);
  const [absCm, setAbsCm] = useState("");
  const [abiCm, setAbiCm] = useState("");
  const [procedureNotes, setProcedureNotes] = useState("");

  // Step 3 — Depois
  const [photosAfter, setPhotosAfter] = useState<File[]>([]);
  const [weightAfter, setWeightAfter] = useState("");
  const afterInputRef = useRef<HTMLInputElement>(null);

  // Step 4 — Assinatura
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const handleSignatureChange = useCallback((data: string | null) => {
    setSignatureData(data);
    if (!data) setConfirmed(false);
  }, []);

  function addPhotos(files: FileList | null, target: "before" | "after") {
    if (!files) return;
    const arr = Array.from(files);
    if (target === "before") setPhotosBefore(p => [...p, ...arr]);
    else setPhotosAfter(p => [...p, ...arr]);
  }

  function removePhoto(i: number, target: "before" | "after") {
    if (target === "before") setPhotosBefore(p => p.filter((_, idx) => idx !== i));
    else setPhotosAfter(p => p.filter((_, idx) => idx !== i));
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
      // Upload fotos
      const [beforePaths, afterPaths] = await Promise.all([
        uploadPhotos(photosBefore, "before"),
        uploadPhotos(photosAfter, "after"),
      ]);

      const result = await registrarSessaoCompleta(protocol.id, {
        weightBefore: weightBefore ? Number(weightBefore) : null,
        weightAfter:  weightAfter  ? Number(weightAfter)  : null,
        absCm:        absCm        ? Number(absCm)        : null,
        abiCm:        abiCm        ? Number(abiCm)        : null,
        procedureNotes: procedureNotes || null,
        performedAt,
        signatureData,
        photosBefore: beforePaths,
        photosAfter:  afterPaths,
      });

      if ("error" in result) {
        setError(result.error);
        return;
      }

      router.push(`/protocolos/${protocol.id}?saved=1`);
    });
  }

  function canNext(): boolean {
    if (step === 4) return !!signatureData && confirmed;
    return true;
  }

  function goNext() {
    setError(null);
    if (step < 4) setStep((s) => (s + 1) as Step);
    else handleSubmit();
  }

  function goPrev() {
    if (step > 1) setStep((s) => (s - 1) as Step);
  }

  const progressPct = Math.round(((protocol.completed_sessions) / protocol.total_sessions) * 100);

  return (
    <div style={{ maxWidth: "560px" }}>
      {/* Barra de progresso do protocolo */}
      <div style={{
        background: "#FFFFFF", border: "1px solid #EDE5D3", borderRadius: "12px",
        padding: "14px 18px", marginBottom: "16px",
        display: "flex", alignItems: "center", gap: "12px",
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#2D2319" }}>
              Sessão #{nextSession} de {protocol.total_sessions}
            </span>
            <span style={{ fontSize: "12px", color: "#A69060" }}>{progressPct}% concluído</span>
          </div>
          <div style={{ height: "6px", background: "#F0EBE0", borderRadius: "3px" }}>
            <div style={{
              height: "100%", borderRadius: "3px",
              background: "linear-gradient(90deg, #D4B86A, #B8960C)",
              width: `${progressPct}%`, transition: "width 0.3s",
            }} />
          </div>
        </div>
      </div>

      {/* Card principal */}
      <div style={{
        background: "#FFFFFF", border: "1px solid #EDE5D3", borderRadius: "14px", overflow: "hidden",
      }}>
        {/* Steps indicator */}
        <div style={{
          padding: "14px 20px", borderBottom: "1px solid #F5EDE0",
          display: "flex", alignItems: "center",
        }}>
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

          {/* STEP 1 — Antes */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <label style={labelStyle}>Fotos antes do procedimento</label>
                <input
                  ref={beforeInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  style={{ display: "none" }}
                  onChange={e => addPhotos(e.target.files, "before")}
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
                  <span style={{ fontSize: "11px", color: "#A69060" }}>Câmera traseira · múltiplas fotos</span>
                </button>
                <PhotoGrid files={photosBefore} onRemove={i => removePhoto(i, "before")} />
              </div>

              <div>
                <label style={labelStyle} htmlFor="weight_before">Peso antes (kg)</label>
                <input
                  id="weight_before"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="Ex: 72.5"
                  value={weightBefore}
                  onChange={e => setWeightBefore(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          {/* STEP 2 — Procedimento */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <label style={labelStyle} htmlFor="performed_at">Data da sessão *</label>
                <input
                  id="performed_at"
                  type="date"
                  value={performedAt}
                  onChange={e => setPerformedAt(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle} htmlFor="abs_cm">ABS (cm)</label>
                  <input
                    id="abs_cm"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="Ex: 90.5"
                    value={absCm}
                    onChange={e => setAbsCm(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle} htmlFor="abi_cm">ABI (cm)</label>
                  <input
                    id="abi_cm"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="Ex: 95.0"
                    value={abiCm}
                    onChange={e => setAbiCm(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle} htmlFor="procedure_notes">Procedimento realizado</label>
                <textarea
                  id="procedure_notes"
                  placeholder="Descreva o procedimento realizado nesta sessão..."
                  rows={4}
                  value={procedureNotes}
                  onChange={e => setProcedureNotes(e.target.value)}
                  style={{ ...inputStyle, resize: "vertical", lineHeight: "1.5" }}
                />
              </div>
            </div>
          )}

          {/* STEP 3 — Depois */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <label style={labelStyle}>Fotos depois do procedimento</label>
                <input
                  ref={afterInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  style={{ display: "none" }}
                  onChange={e => addPhotos(e.target.files, "after")}
                />
                <button
                  type="button"
                  onClick={() => afterInputRef.current?.click()}
                  style={{
                    width: "100%", padding: "20px", borderRadius: "10px",
                    border: "2px dashed #D4B86A", background: "rgba(212,184,106,0.04)",
                    cursor: "pointer", display: "flex", flexDirection: "column",
                    alignItems: "center", gap: "8px", fontFamily: "inherit",
                  }}
                >
                  <Camera size={24} strokeWidth={1.5} style={{ color: "#B8960C" }} />
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#B8960C" }}>Tirar foto / selecionar</span>
                  <span style={{ fontSize: "11px", color: "#A69060" }}>Câmera traseira · múltiplas fotos</span>
                </button>
                <PhotoGrid files={photosAfter} onRemove={i => removePhoto(i, "after")} />
              </div>

              <div>
                <label style={labelStyle} htmlFor="weight_after">Peso depois (kg)</label>
                <input
                  id="weight_after"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="Ex: 72.0"
                  value={weightAfter}
                  onChange={e => setWeightAfter(e.target.value)}
                  style={inputStyle}
                />
              </div>

              {/* Resumo de variação */}
              {weightBefore && weightAfter && (
                <div style={{
                  padding: "10px 14px", borderRadius: "9px",
                  background: "rgba(184,150,12,0.06)", border: "1px solid rgba(184,150,12,0.15)",
                  fontSize: "13px", color: "#2D2319",
                }}>
                  Variação de peso:{" "}
                  <strong style={{ color: Number(weightAfter) < Number(weightBefore) ? "#2D8C4E" : "#D94444" }}>
                    {(Number(weightAfter) - Number(weightBefore)).toFixed(1)} kg
                  </strong>
                </div>
              )}
            </div>
          )}

          {/* STEP 4 — Assinatura */}
          {step === 4 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Instrução + canvas */}
              <div>
                <label style={labelStyle}>Assinatura da cliente *</label>
                <p style={{ fontSize: "12px", color: "#A69060", marginBottom: "10px", marginTop: 0 }}>
                  Entregue o celular para a cliente assinar abaixo
                </p>
                <SignatureCanvas onChange={handleSignatureChange} />
              </div>

              {/* Comprovante — aparece após assinar */}
              {signatureData && (
                <div style={{ border: "1px solid #EDE5D3", borderRadius: "12px", overflow: "hidden" }}>
                  {/* Preview da assinatura */}
                  <div style={{ padding: "14px 16px", background: "#FEFCF7", borderBottom: "1px solid #F0EBE0" }}>
                    <p style={{ fontSize: "10px", fontWeight: 700, color: "#BBA870", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 10px" }}>
                      Comprovante de Assinatura
                    </p>
                    <img
                      src={signatureData}
                      alt="Assinatura"
                      style={{ width: "100%", height: "72px", objectFit: "contain", background: "#fff", borderRadius: "8px", border: "1px solid #EDE5D3", display: "block" }}
                    />
                  </div>

                  {/* Dados do atendimento */}
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid #F0EBE0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    {[
                      { label: "Cliente",     value: protocol.clientName },
                      { label: "Data e Hora", value: new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) },
                      { label: "Sessão",      value: `#${nextSession} de ${protocol.total_sessions}` },
                      { label: "Serviço",     value: protocol.serviceName },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <span style={{ fontSize: "10px", color: "#BBA870", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "2px" }}>{label}</span>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "#2D2319" }}>{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Checkbox de confirmação */}
                  <label style={{ padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={confirmed}
                      onChange={(e) => setConfirmed(e.target.checked)}
                      style={{ marginTop: "2px", accentColor: "#B8960C", width: "16px", height: "16px", flexShrink: 0, cursor: "pointer" }}
                    />
                    <span style={{ fontSize: "12px", color: "#2D2319", lineHeight: "1.55" }}>
                      Li o comprovante acima e confirmo que a assinatura é de minha autoria e que a sessão <strong>#{nextSession} de {protocol.serviceName}</strong> foi realizada conforme o procedimento.
                    </span>
                  </label>
                </div>
              )}
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
          padding: "14px 20px 18px", borderTop: "1px solid #F5EDE0",
          display: "flex", justifyContent: "space-between", gap: "10px",
        }}>
          <button
            type="button"
            onClick={step === 1 ? () => router.back() : goPrev}
            style={{
              display: "flex", alignItems: "center", gap: "4px",
              padding: "10px 16px", borderRadius: "10px",
              border: "1px solid #EDE5D3", background: "none",
              fontSize: "13px", color: "#A69060", cursor: "pointer", fontFamily: "inherit",
            }}
          >
            <ChevronLeft size={14} strokeWidth={1.5} />
            {step === 1 ? "Cancelar" : "Voltar"}
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={!canNext() || isPending}
            style={{
              padding: "10px 24px", borderRadius: "10px", border: "none",
              background: !canNext() || isPending ? "#EDE5D3" : "linear-gradient(135deg, #D4B86A, #B8960C)",
              color: "#161412", fontSize: "13px", fontWeight: 700,
              cursor: !canNext() || isPending ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
          >
            {step === 4
              ? (isPending ? "Salvando..." : "Confirmar sessão")
              : `Próximo →`}
          </button>
        </div>
      </div>
    </div>
  );
}
