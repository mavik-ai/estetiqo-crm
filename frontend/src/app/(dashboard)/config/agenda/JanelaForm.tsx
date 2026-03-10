'use client'

import { useState, useTransition } from "react";
import { Check, Copy } from "lucide-react";
import { salvarJanelaAtendimento, DayHours } from "./actions";

const DIAS = [
  { key: 1, label: "Segunda-feira",  short: "Seg" },
  { key: 2, label: "Terça-feira",    short: "Ter" },
  { key: 3, label: "Quarta-feira",   short: "Qua" },
  { key: 4, label: "Quinta-feira",   short: "Qui" },
  { key: 5, label: "Sexta-feira",    short: "Sex" },
  { key: 6, label: "Sábado",         short: "Sáb" },
  { key: 0, label: "Domingo",        short: "Dom" },
];

const DEFAULT_HOURS: DayHours[] = DIAS.map(d => ({
  day_of_week: d.key,
  is_open:     d.key >= 1 && d.key <= 6,
  open_time:   "08:00",
  close_time:  "18:00",
}));

const inputStyle: React.CSSProperties = {
  padding: "7px 10px", borderRadius: "8px",
  border: "1px solid #EDE5D3", background: "#FAFAF8",
  color: "#2D2319", fontSize: "13px", fontFamily: "inherit",
  outline: "none", width: "90px",
};

export function JanelaForm({ initial }: { initial: DayHours[] }) {
  const [hours, setHours] = useState<DayHours[]>(() => {
    if (!initial.length) return DEFAULT_HOURS;
    return DIAS.map(d => {
      const found = initial.find(h => h.day_of_week === d.key);
      return found ?? { day_of_week: d.key, is_open: false, open_time: "08:00", close_time: "18:00" };
    });
  });

  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(day: number, field: keyof DayHours, value: string | boolean) {
    setHours(prev => prev.map(h => h.day_of_week === day ? { ...h, [field]: value } : h));
    setSaved(false);
  }

  function copyToAll(sourceDayOfWeek: number) {
    const source = hours.find(h => h.day_of_week === sourceDayOfWeek);
    if (!source) return;
    setHours(prev => prev.map(h =>
      h.day_of_week === sourceDayOfWeek ? h : { ...h, open_time: source.open_time, close_time: source.close_time }
    ));
  }

  function handleSave() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await salvarJanelaAtendimento(hours);
      if ('error' in result) setError(result.error);
      else setSaved(true);
    });
  }

  return (
    <div>
      <div style={{ background: "#FFFFFF", border: "1px solid #EDE5D3", borderRadius: "14px", overflow: "hidden" }}>
        {DIAS.map((dia, idx) => {
          const h = hours.find(x => x.day_of_week === dia.key)!;
          return (
            <div
              key={dia.key}
              style={{
                padding: "14px 20px",
                borderBottom: idx < DIAS.length - 1 ? "1px solid #F0EBE0" : "none",
                display: "flex", alignItems: "center", gap: "14px",
                background: h.is_open ? "#FFFFFF" : "#FAFAF8",
                opacity: h.is_open ? 1 : 0.6,
              }}
            >
              {/* Toggle */}
              <button
                type="button"
                onClick={() => update(dia.key, "is_open", !h.is_open)}
                title={h.is_open ? "Fechar este dia" : "Abrir este dia"}
                style={{
                  width: "40px", height: "22px", borderRadius: "11px",
                  background: h.is_open ? "linear-gradient(135deg, #D4B86A, #B8960C)" : "#D4C8A8",
                  border: "none", cursor: "pointer", position: "relative",
                  flexShrink: 0, transition: "background 0.2s",
                }}
              >
                <span style={{
                  position: "absolute", top: "2px",
                  left: h.is_open ? "20px" : "2px",
                  width: "18px", height: "18px", borderRadius: "50%",
                  background: "#fff", transition: "left 0.15s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
                }} />
              </button>

              {/* Dia da semana */}
              <span style={{
                width: "108px", flexShrink: 0,
                fontSize: "13px", fontWeight: h.is_open ? 600 : 400, color: "#2D2319",
              }}>
                {dia.label}
              </span>

              {/* Horários */}
              {h.is_open ? (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                  <input
                    type="time"
                    value={h.open_time}
                    onChange={e => update(dia.key, "open_time", e.target.value)}
                    style={inputStyle}
                  />
                  <span style={{ fontSize: "12px", color: "#A69060" }}>até</span>
                  <input
                    type="time"
                    value={h.close_time}
                    onChange={e => update(dia.key, "close_time", e.target.value)}
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={() => copyToAll(dia.key)}
                    title="Copiar este horário para todos os dias"
                    style={{
                      display: "flex", alignItems: "center", gap: "4px",
                      background: "none", border: "1px solid #EDE5D3",
                      borderRadius: "6px", padding: "5px 8px",
                      fontSize: "11px", color: "#A69060", cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    <Copy size={11} strokeWidth={2} />
                    Copiar p/ todos
                  </button>
                </div>
              ) : (
                <span style={{ fontSize: "12px", color: "#BBA870", fontStyle: "italic" }}>Fechado</span>
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <div style={{
          marginTop: "12px", padding: "10px 14px", borderRadius: "8px",
          background: "rgba(217,68,68,0.07)", border: "1px solid rgba(217,68,68,0.2)",
          color: "#D94444", fontSize: "13px",
        }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          style={{
            padding: "10px 24px", borderRadius: "10px", border: "none",
            background: isPending ? "#EDE5D3" : "linear-gradient(135deg, #D4B86A, #B8960C)",
            color: "#161412", fontSize: "13px", fontWeight: 700,
            cursor: isPending ? "not-allowed" : "pointer", fontFamily: "inherit",
          }}
        >
          {isPending ? "Salvando..." : "Salvar Horários"}
        </button>
        {saved && (
          <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "#2D8C4E" }}>
            <Check size={14} strokeWidth={2.5} /> Salvo com sucesso!
          </span>
        )}
      </div>
    </div>
  );
}
