'use client'

import { useState, useEffect, useTransition } from "react";
import { createClient } from "@/utils/supabase/client";
import { X, ChevronLeft, ChevronRight, Check, CalendarDays } from "lucide-react";
import { reagendarAgendamento } from "./agendaActions";

interface Room { id: string; name: string; }
interface SlotAppointment { id: string; starts_at: string; ends_at: string; room_id: string | null; }

interface Props {
  appointment: {
    id: string;
    starts_at: string;
    ends_at: string;
    room_id: string | null;
    clients: { id: string; name: string } | null;
    services: { id: string; name: string } | null;
    rooms: { id: string; name: string } | null;
  };
  rooms: Room[];
  onClose: () => void;
  onSuccess: () => void;
}

const TIME_SLOTS: string[] = [];
for (let h = 7; h <= 20; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, "0")}:00`);
  if (h < 20) TIME_SLOTS.push(`${String(h).padStart(2, "0")}:30`);
}

function timeToMin(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function fmtDate(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("pt-BR", {
    weekday: "long", day: "2-digit", month: "long",
  });
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: "9px",
  border: "1px solid var(--border)", background: "var(--muted)",
  fontSize: "13px", color: "var(--foreground)", fontFamily: "inherit", outline: "none",
  boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "10px", fontWeight: 700, color: "#BBA870",
  letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "5px",
};

export function RescheduleModal({ appointment, rooms, onClose, onSuccess }: Props) {
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(1); // 1=Horário, 2=Sala
  const [error, setError] = useState<string | null>(null);

  // Duração original em minutos
  const durationMin = Math.round(
    (new Date(appointment.ends_at).getTime() - new Date(appointment.starts_at).getTime()) / 60000
  );

  // Inicializar com data/hora/sala atuais
  const initialDate = appointment.starts_at.split("T")[0];
  const initialTime = new Date(appointment.starts_at).toLocaleTimeString("pt-BR", {
    hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo",
  });

  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedTime, setSelectedTime] = useState(initialTime);
  const [selectedRoomId, setSelectedRoomId] = useState(appointment.room_id ?? "");
  const [dayAppointments, setDayAppointments] = useState<SlotAppointment[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Carregar agendamentos do dia
  useEffect(() => {
    setLoadingSlots(true);
    supabase.from("appointments")
      .select("id, starts_at, ends_at, room_id")
      .gte("starts_at", `${selectedDate}T00:00:00`)
      .lte("starts_at", `${selectedDate}T23:59:59`)
      .eq("is_block", false)
      .eq("no_show", false)
      .neq("rsvp_status", "cancelled")
      .neq("id", appointment.id) // excluir o próprio
      .then(({ data }) => {
        setDayAppointments((data ?? []) as SlotAppointment[]);
        setLoadingSlots(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  function isRoomFree(roomId: string, slotTime: string) {
    const s = timeToMin(slotTime);
    const e = s + durationMin;
    return !dayAppointments.some(a => {
      if (a.room_id !== roomId) return false;
      const as = timeToMin(new Date(a.starts_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" }));
      const ae = timeToMin(new Date(a.ends_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" }));
      return as < e && ae > s;
    });
  }

  const slotAvailability = TIME_SLOTS.map(slot => ({
    slot,
    freeRooms: rooms.filter(r => isRoomFree(r.id, slot)),
  }));

  const freeRooms = selectedTime ? rooms.filter(r => isRoomFree(r.id, selectedTime)) : [];
  const occupiedRooms = selectedTime ? rooms.filter(r => !freeRooms.find(fr => fr.id === r.id)) : [];

  function handleSubmit() {
    if (!selectedDate || !selectedTime || !selectedRoomId) {
      setError("Preencha todos os campos."); return;
    }
    setError(null);
    startTransition(async () => {
      const res = await reagendarAgendamento(appointment.id, selectedDate, selectedTime, selectedRoomId, durationMin);
      if (res.error) { setError(res.error); return; }
      onSuccess();
      onClose();
    });
  }

  function prevDay() {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split("T")[0]);
    setSelectedTime("");
  }
  function nextDay() {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split("T")[0]);
    setSelectedTime("");
  }

  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(45,35,25,0.35)",
        zIndex: 100, backdropFilter: "blur(2px)",
      }} />

      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "min(500px, 94vw)",
        background: "var(--card)", borderRadius: "18px",
        border: "1px solid var(--border)",
        boxShadow: "0 20px 60px rgba(45,35,25,0.18)",
        zIndex: 101, maxHeight: "90vh", display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{
          padding: "18px 22px 14px", borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <CalendarDays size={16} style={{ color: "#B8960C" }} />
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: 700, color: "var(--foreground)", margin: 0 }}>
                Reagendar
              </h2>
            </div>
            <p style={{ fontSize: "12px", color: "var(--muted-foreground)", margin: 0 }}>
              {appointment.clients?.name} · {appointment.services?.name}
              <span style={{ color: "#BBA870", margin: "0 6px" }}>·</span>
              {durationMin} min
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: "4px" }}>
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Steps */}
        <div style={{ padding: "10px 22px", borderBottom: "1px solid var(--border)", display: "flex", gap: "20px", flexShrink: 0 }}>
          {["Horário", "Sala"].map((label, i) => {
            const n = i + 1;
            const isActive = n === step;
            const isDone = n < step;
            return (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{
                  width: "20px", height: "20px", borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "10px", fontWeight: 700,
                  background: isDone ? "linear-gradient(135deg, #D4B86A, #B8960C)" : isActive ? "rgba(184,150,12,0.12)" : "#F5EDE0",
                  color: isDone ? "#161412" : isActive ? "#B8960C" : "#BBA870",
                  border: isActive ? "1.5px solid #B8960C" : "none",
                }}>
                  {isDone ? <Check size={10} strokeWidth={3} /> : n}
                </div>
                <span style={{ fontSize: "11px", fontWeight: isActive ? 700 : 500, color: isActive ? "#2D2319" : "#A69060" }}>{label}</span>
              </div>
            );
          })}
        </div>

        {/* Body */}
        <div style={{ padding: "20px 22px", overflowY: "auto", flex: 1 }}>

          {/* Step 1 — Horário */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <button onClick={prevDay} style={{ background: "#F5EDE0", border: "none", borderRadius: "8px", padding: "8px 10px", cursor: "pointer", color: "var(--muted-foreground)" }}>
                  <ChevronLeft size={16} strokeWidth={1.5} />
                </button>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--foreground)", margin: 0, textTransform: "capitalize" }}>
                    {fmtDate(selectedDate)}
                  </p>
                  <p style={{ fontSize: "11px", color: "var(--muted-foreground)", margin: "2px 0 0" }}>
                    duração: {durationMin} min
                  </p>
                </div>
                <button onClick={nextDay} style={{ background: "#F5EDE0", border: "none", borderRadius: "8px", padding: "8px 10px", cursor: "pointer", color: "var(--muted-foreground)" }}>
                  <ChevronRight size={16} strokeWidth={1.5} />
                </button>
              </div>

              {loadingSlots ? (
                <div style={{ textAlign: "center", padding: "20px", color: "var(--muted-foreground)", fontSize: "13px" }}>
                  Verificando disponibilidade...
                </div>
              ) : (
                <div>
                  <label style={labelStyle}>Horários disponíveis</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}>
                    {slotAvailability.map(({ slot, freeRooms: fr }) => {
                      const available = fr.length > 0;
                      const isSelected = selectedTime === slot;
                      return (
                        <button key={slot} type="button" disabled={!available}
                          onClick={() => setSelectedTime(isSelected ? "" : slot)}
                          style={{
                            padding: "8px 4px", borderRadius: "8px", textAlign: "center",
                            border: isSelected ? "2px solid var(--primary)" : "1.5px solid var(--border)",
                            background: isSelected ? "linear-gradient(135deg, #C9A84C, #A67E0A)" : "var(--card)",
                            color: isSelected ? "#0E0C0A" : available ? "var(--foreground)" : "var(--muted-foreground)",
                            fontSize: "12px", fontWeight: isSelected ? 700 : available ? 600 : 400,
                            cursor: available ? "pointer" : "not-allowed", fontFamily: "inherit",
                            opacity: available ? 1 : 0.45,
                          }}
                        >
                          {slot}
                          {available && (
                            <div style={{ fontSize: "9px", color: isSelected ? "rgba(22,20,18,0.6)" : "#A69060", marginTop: "1px" }}>
                              {fr.length} livre{fr.length !== 1 ? "s" : ""}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Campo manual de horário */}
              <div>
                <label style={labelStyle}>Ou digitar horário</label>
                <select
                  value={selectedTime}
                  onChange={e => setSelectedTime(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Selecionar horário...</option>
                  {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Step 2 — Sala */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{
                padding: "10px 14px", borderRadius: "9px",
                background: "rgba(184,150,12,0.06)", border: "1px solid rgba(184,150,12,0.15)",
              }}>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--foreground)", margin: "0 0 2px", textTransform: "capitalize" }}>
                  {fmtDate(selectedDate)} às {selectedTime}
                </p>
                <p style={{ fontSize: "12px", color: "var(--muted-foreground)", margin: 0 }}>
                  {appointment.services?.name} · {durationMin} min
                </p>
              </div>

              <div>
                <label style={labelStyle}>Salas disponíveis</label>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {freeRooms.length === 0 && (
                    <div style={{ padding: "12px", borderRadius: "9px", background: "rgba(217,68,68,0.06)", border: "1px solid rgba(217,68,68,0.2)", fontSize: "13px", color: "#D94444" }}>
                      Nenhuma sala disponível neste horário.
                    </div>
                  )}
                  {freeRooms.map(r => {
                    const isSelected = selectedRoomId === r.id;
                    return (
                      <button key={r.id} type="button"
                        onClick={() => setSelectedRoomId(isSelected ? "" : r.id)}
                        style={{
                          textAlign: "left", padding: "12px 14px", borderRadius: "10px",
                          border: isSelected ? "2px solid var(--primary)" : "1.5px solid var(--border)",
                          background: isSelected ? "rgba(201,168,76,0.08)" : "var(--card)",
                          cursor: "pointer", fontFamily: "inherit",
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "linear-gradient(135deg, #D4B86A, #B8960C)", flexShrink: 0 }} />
                          <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--foreground)" }}>{r.name}</span>
                        </div>
                        {isSelected && (
                          <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "linear-gradient(135deg, #D4B86A, #B8960C)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Check size={11} strokeWidth={3} style={{ color: "#161412" }} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                  {occupiedRooms.map(r => (
                    <div key={r.id} style={{
                      padding: "12px 14px", borderRadius: "10px",
                      border: "1.5px solid #EDE5D3", background: "#F8F5F0",
                      display: "flex", alignItems: "center", justifyContent: "space-between", opacity: 0.5,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#D94444", flexShrink: 0 }} />
                        <span style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>{r.name}</span>
                      </div>
                      <span style={{ fontSize: "10px", color: "#BBA870", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>Ocupada</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div style={{
              marginTop: "12px", padding: "9px 12px", borderRadius: "8px",
              background: "rgba(217,68,68,0.07)", border: "1px solid rgba(217,68,68,0.2)",
              color: "#D94444", fontSize: "12px",
            }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: "14px 22px 18px", borderTop: "1px solid var(--border)",
          display: "flex", justifyContent: "space-between", gap: "10px",
          flexShrink: 0,
        }}>
          <button
            onClick={step === 1 ? onClose : () => setStep(1)}
            style={{
              padding: "9px 18px", borderRadius: "9px", border: "1px solid var(--border)",
              background: "none", fontSize: "13px", color: "var(--muted-foreground)",
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            {step === 1 ? "Cancelar" : "← Voltar"}
          </button>
          <button
            onClick={step === 1 ? () => { if (selectedTime) setStep(2); } : handleSubmit}
            disabled={(step === 1 && !selectedTime) || (step === 2 && !selectedRoomId) || isPending}
            style={{
              padding: "9px 22px", borderRadius: "9px", border: "none",
              background: ((step === 1 && !selectedTime) || (step === 2 && !selectedRoomId) || isPending) ? "#EDE5D3" : "linear-gradient(135deg, #D4B86A, #B8960C)",
              color: "#161412", fontSize: "13px", fontWeight: 700,
              cursor: ((step === 1 && !selectedTime) || (step === 2 && !selectedRoomId) || isPending) ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
          >
            {step === 1 ? "Próximo →" : (isPending ? "Salvando..." : "Confirmar reagendamento")}
          </button>
        </div>
      </div>
    </>
  );
}
