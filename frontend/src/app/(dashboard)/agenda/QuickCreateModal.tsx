'use client'

import { useState, useEffect, useCallback, useTransition } from "react";
import { createClient } from "@/utils/supabase/client";
import { X, Search, ChevronLeft, ChevronRight, Check, Lock } from "lucide-react";
import { criarAgendamentoModal } from "./criarAgendamentoModal";

interface Room { id: string; name: string; }
interface Client { id: string; name: string; }
interface Service { id: string; name: string; duration_minutes: number | null; }
interface Protocol {
  id: string;
  service_id: string | null;
  services: { id: string; name: string; duration_minutes: number | null } | null;
  total_sessions: number;
  completed_sessions: number;
  interval_days: number | null;
}
interface SlotAppointment {
  id: string;
  starts_at: string;
  ends_at: string;
  room_id: string | null;
}

interface Props {
  date: string;
  time: string;
  roomId: string;
  rooms: Room[];
  preSelected: boolean; // true = veio de clique num slot específico da agenda
  onClose: () => void;
  onSuccess: () => void;
}

function addMinutes(t: string, min: number): string {
  const [h, m] = t.split(":").map(Number);
  const tot = h * 60 + m + min;
  return `${String(Math.floor(tot / 60) % 24).padStart(2, "0")}:${String(tot % 60).padStart(2, "0")}`;
}

function fmtDateFull(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", {
    weekday: "long", day: "2-digit", month: "long",
  });
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function isRoomFree(roomId: string, slotTime: string, durationMin: number, appts: SlotAppointment[]): boolean {
  const s = timeToMinutes(slotTime);
  const e = s + durationMin;
  return !appts.some(a => {
    if (a.room_id !== roomId) return false;
    const as = timeToMinutes(new Date(a.starts_at).toTimeString().slice(0, 5));
    const ae = timeToMinutes(new Date(a.ends_at).toTimeString().slice(0, 5));
    return as < e && ae > s;
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

const TIME_SLOTS: string[] = [];
for (let h = 7; h <= 20; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, "0")}:00`);
  if (h < 20) TIME_SLOTS.push(`${String(h).padStart(2, "0")}:30`);
}

export function QuickCreateModal({ date, time, roomId, rooms, preSelected, onClose, onSuccess }: Props) {
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();

  // Fluxo: se preSelected = 3 passos (Paciente, Serviço, Obs+Confirmar)
  //        se !preSelected = 4 passos (Paciente, Serviço, Horário, Sala)
  const totalSteps = preSelected ? 3 : 4;

  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Step 1 — Paciente
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientResults, setClientResults] = useState<Client[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Step 2 — Serviço / Protocolo
  const [services, setServices] = useState<Service[]>([]);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedProtocolId, setSelectedProtocolId] = useState("");

  // Step 3 (apenas !preSelected) — Horário
  const [selectedDate, setSelectedDate] = useState(date);
  const [selectedTime, setSelectedTime] = useState("");
  const [dayAppointments, setDayAppointments] = useState<SlotAppointment[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Step 4 (apenas !preSelected) — Sala
  const [selectedRoomId, setSelectedRoomId] = useState("");

  // Último passo (sempre) — Observações
  const [notes, setNotes] = useState("");

  // Alerta de intervalo — última sessão do protocolo selecionado
  const [lastSessionDate, setLastSessionDate] = useState<Date | null>(null);

  // Carregar serviços
  useEffect(() => {
    supabase.from("services").select("id, name, duration_minutes")
      .eq("active", true).order("name")
      .then(({ data }) => setServices((data ?? []) as Service[]));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Carregar protocolos ao selecionar cliente
  useEffect(() => {
    if (!selectedClient) { setProtocols([]); setSelectedProtocolId(""); return; }
    supabase.from("protocols")
      .select("id, service_id, services(id, name, duration_minutes), total_sessions, completed_sessions, interval_days")
      .eq("client_id", selectedClient.id).eq("status", "active")
      .then(({ data }) => setProtocols((data ?? []) as unknown as Protocol[]));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClient]);

  // Carregar última sessão ao selecionar protocolo com interval_days
  useEffect(() => {
    setLastSessionDate(null);
    const proto = protocols.find(p => p.id === selectedProtocolId);
    if (!proto || !proto.interval_days) return;
    supabase.from("appointments")
      .select("starts_at")
      .eq("protocol_id", proto.id)
      .eq("no_show", false)
      .neq("rsvp_status", "cancelled")
      .order("starts_at", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) setLastSessionDate(new Date(data[0].starts_at));
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProtocolId]);

  // Carregar agendamentos do dia ao entrar no step de horário
  useEffect(() => {
    if (preSelected || step !== 3) return;
    setLoadingSlots(true);
    supabase.from("appointments")
      .select("id, starts_at, ends_at, room_id")
      .gte("starts_at", `${selectedDate}T00:00:00`)
      .lte("starts_at", `${selectedDate}T23:59:59`)
      .eq("is_block", false).eq("no_show", false).neq("rsvp_status", "cancelled")
      .then(({ data }) => { setDayAppointments((data ?? []) as SlotAppointment[]); setLoadingSlots(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, selectedDate, preSelected]);

  // Busca de clientes
  const searchClients = useCallback(async (q: string) => {
    if (q.length < 2) { setClientResults([]); return; }
    const { data } = await supabase.from("clients").select("id, name").ilike("name", `%${q}%`).limit(8);
    setClientResults((data ?? []) as Client[]);
  }, [supabase]);

  useEffect(() => {
    const t = setTimeout(() => searchClients(clientSearch), 250);
    return () => clearTimeout(t);
  }, [clientSearch, searchClients]);

  // Valores derivados
  const selectedProtocol = protocols.find(p => p.id === selectedProtocolId);
  const selectedService = selectedProtocol?.services ?? services.find(s => s.id === selectedServiceId) ?? null;
  const durationMin = selectedService?.duration_minutes ?? 60;
  const effectiveServiceId = selectedProtocol?.service_id ?? selectedServiceId;

  // Slot de horário efetivo (preSelected usa o da prop, senão usa o escolhido)
  const effectiveTime = preSelected ? time : selectedTime;
  const effectiveRoomId = preSelected ? roomId : selectedRoomId;
  const effectiveRoom = rooms.find(r => r.id === effectiveRoomId);

  // Disponibilidade de slots (apenas para fluxo sem preSelected)
  const slotAvailability = !preSelected ? TIME_SLOTS.map(slot => ({
    slot,
    freeRooms: rooms.filter(r => isRoomFree(r.id, slot, durationMin, dayAppointments)),
  })) : [];

  const freeRooms = !preSelected && selectedTime
    ? rooms.filter(r => isRoomFree(r.id, selectedTime, durationMin, dayAppointments))
    : [];
  const occupiedRooms = !preSelected && selectedTime
    ? rooms.filter(r => !freeRooms.find(fr => fr.id === r.id))
    : [];

  // Labels dos passos
  const stepLabels = preSelected
    ? ["Paciente", "Serviço", "Confirmar"]
    : ["Paciente", "Serviço", "Horário", "Sala"];

  function canNext(): boolean {
    if (step === 1) return !!selectedClient;
    if (step === 2) return !!(selectedServiceId || selectedProtocolId);
    if (!preSelected && step === 3) return !!selectedTime;
    if (!preSelected && step === 4) return !!selectedRoomId;
    return true; // último passo (obs) sempre pode confirmar
  }

  function handleNext() {
    setError(null);
    if (step < totalSteps) { setStep(s => s + 1); return; }
    // Submit
    if (!selectedClient || !effectiveServiceId || !effectiveRoomId || !effectiveTime) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }
    const fd = new FormData();
    fd.set("client_id", selectedClient.id);
    fd.set("service_id", effectiveServiceId);
    fd.set("room_id", effectiveRoomId);
    const d = preSelected ? date : selectedDate;
    fd.set("starts_at", `${d}T${effectiveTime}:00-03:00`);
    fd.set("ends_at", `${d}T${addMinutes(effectiveTime, durationMin)}:00-03:00`);
    fd.set("protocol_id", selectedProtocolId);
    fd.set("notes", notes);

    startTransition(async () => {
      const res = await criarAgendamentoModal(fd);
      if ("error" in res) { setError(res.error); return; }
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
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(45,35,25,0.35)",
        zIndex: 100, backdropFilter: "blur(2px)",
      }} />

      {/* Modal */}
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "min(520px, 94vw)",
        background: "var(--card)", borderRadius: "18px",
        border: "1px solid var(--border)",
        boxShadow: "0 20px 60px rgba(45,35,25,0.18)",
        zIndex: 101,
        maxHeight: "90vh", display: "flex", flexDirection: "column",
      }}>

        {/* Header */}
        <div style={{
          padding: "18px 22px 14px", borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          flexShrink: 0, borderRadius: "18px 18px 0 0", background: "var(--card)",
        }}>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: 700, color: "var(--foreground)", margin: 0 }}>
              Novo Agendamento
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px", flexWrap: "wrap" }}>
              <p style={{ fontSize: "12px", color: "#B8960C", margin: 0, fontWeight: 600, textTransform: "capitalize" }}>
                {fmtDateFull(preSelected ? date : selectedDate)}
              </p>
              {preSelected && (
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "4px",
                  padding: "2px 8px", borderRadius: "20px",
                  background: "rgba(184,150,12,0.10)", border: "1px solid rgba(184,150,12,0.2)",
                }}>
                  <Lock size={9} strokeWidth={2.5} style={{ color: "#B8960C" }} />
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#B8960C" }}>
                    {time} · {effectiveRoom?.name ?? "—"}
                  </span>
                </div>
              )}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: "4px", flexShrink: 0 }}>
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Steps indicator */}
        <div style={{
          padding: "12px 22px", borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", flexShrink: 0, background: "var(--card)",
        }}>
          {stepLabels.map((label, i) => {
            const n = i + 1;
            const isActive = n === step;
            const isDone = n < step;
            return (
              <div key={n} style={{ display: "flex", alignItems: "center", flex: i < stepLabels.length - 1 ? 1 : "none" as "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                  <div style={{
                    width: "22px", height: "22px", borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "10px", fontWeight: 700, flexShrink: 0,
                    background: isDone ? "linear-gradient(135deg, #D4B86A, #B8960C)" : isActive ? "rgba(184,150,12,0.12)" : "#F5EDE0",
                    color: isDone ? "#161412" : isActive ? "#B8960C" : "#BBA870",
                    border: isActive ? "1.5px solid #B8960C" : "none",
                  }}>
                    {isDone ? <Check size={11} strokeWidth={3} /> : n}
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: isActive ? 700 : 500, color: isActive ? "#2D2319" : "#A69060" }}>
                    {label}
                  </span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div style={{ flex: 1, height: "1px", background: "#EDE5D3", margin: "0 8px" }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Body — scrollável */}
        <div style={{ padding: "20px 22px", overflowY: "auto", flex: 1 }}>

          {/* ──── STEP 1 — Paciente ──── */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={labelStyle}>Nome da paciente</label>
                <div style={{ position: "relative" }}>
                  <Search size={13} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#BBA870", pointerEvents: "none" }} />
                  <input
                    type="text"
                    placeholder="Buscar pelo nome..."
                    value={selectedClient ? selectedClient.name : clientSearch}
                    onChange={e => { setClientSearch(e.target.value); setSelectedClient(null); setShowDropdown(true); }}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    style={{ ...inputStyle, paddingLeft: "32px" }}
                    autoFocus
                  />
                </div>

                {/* Dropdown IN-FLOW (sem position absolute — evita clipping) */}
                {showDropdown && clientSearch.length >= 2 && !selectedClient && (
                  <div style={{
                    marginTop: "4px",
                    background: "var(--card)", border: "1px solid var(--border)", borderRadius: "9px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)", overflow: "hidden",
                  }}>
                    {clientResults.length === 0 ? (
                      <div style={{ padding: "10px 12px", fontSize: "12px", color: "var(--muted-foreground)" }}>Nenhuma paciente encontrada.</div>
                    ) : clientResults.map(c => (
                      <button key={c.id} type="button"
                        onMouseDown={() => { setSelectedClient(c); setClientSearch(c.name); setShowDropdown(false); }}
                        style={{
                          width: "100%", textAlign: "left", padding: "10px 12px",
                          fontSize: "13px", color: "var(--foreground)", background: "none",
                          border: "none", cursor: "pointer", borderBottom: "1px solid #F0EBE0",
                          fontFamily: "inherit",
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#FBF5EA"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Card da paciente selecionada */}
              {selectedClient && (
                <div style={{
                  padding: "12px 14px", borderRadius: "10px",
                  background: "rgba(184,150,12,0.06)", border: "1px solid rgba(184,150,12,0.2)",
                  display: "flex", alignItems: "center", gap: "10px",
                }}>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "50%",
                    background: "linear-gradient(135deg, #D4B86A, #B8960C)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#FFFDF7", fontSize: "13px", fontWeight: 700, flexShrink: 0,
                  }}>
                    {selectedClient.name.split(" ").slice(0, 2).map(p => p[0]?.toUpperCase() ?? "").join("")}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--foreground)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {selectedClient.name}
                    </p>
                    <p style={{ fontSize: "11px", color: "var(--muted-foreground)", margin: 0 }}>Paciente selecionada</p>
                  </div>
                  <button
                    onClick={() => { setSelectedClient(null); setClientSearch(""); }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#BBA870", padding: "4px", flexShrink: 0 }}
                  >
                    <X size={14} strokeWidth={1.5} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ──── STEP 2 — Serviço / Protocolo ──── */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Protocolos ativos */}
              {protocols.length > 0 && (
                <div>
                  <label style={labelStyle}>Protocolos ativos</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {protocols.map(p => {
                      const isSelected = selectedProtocolId === p.id;
                      return (
                        <button key={p.id} type="button"
                          onClick={() => { setSelectedProtocolId(isSelected ? "" : p.id); setSelectedServiceId(""); }}
                          style={{
                            textAlign: "left", padding: "12px 14px", borderRadius: "10px",
                            border: isSelected ? "2px solid var(--primary)" : "1.5px solid var(--border)",
                            background: isSelected ? "rgba(201,168,76,0.08)" : "var(--card)",
                            cursor: "pointer", fontFamily: "inherit",
                            display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px",
                          }}
                        >
                          <div>
                            <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--foreground)", margin: "0 0 2px" }}>
                              {p.services?.name ?? "Protocolo"}
                            </p>
                            <p style={{ fontSize: "11px", color: "var(--muted-foreground)", margin: 0 }}>
                              Sessão {p.completed_sessions + 1}/{p.total_sessions}
                              {p.services?.duration_minutes ? ` · ${p.services.duration_minutes} min` : ""}
                            </p>
                          </div>
                          {isSelected && (
                            <div style={{
                              width: "20px", height: "20px", borderRadius: "50%",
                              background: "linear-gradient(135deg, #D4B86A, #B8960C)",
                              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                            }}>
                              <Check size={11} strokeWidth={3} style={{ color: "#161412" }} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {protocols.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ flex: 1, height: "1px", background: "#EDE5D3" }} />
                  <span style={{ fontSize: "11px", color: "#BBA870" }}>ou serviço avulso</span>
                  <div style={{ flex: 1, height: "1px", background: "#EDE5D3" }} />
                </div>
              )}

              <div>
                {protocols.length === 0 && <label style={labelStyle}>Serviço *</label>}
                <select
                  value={selectedServiceId}
                  onChange={e => { setSelectedServiceId(e.target.value); setSelectedProtocolId(""); }}
                  style={{ ...inputStyle, cursor: selectedProtocolId ? "not-allowed" : "pointer", opacity: selectedProtocolId ? 0.4 : 1 }}
                  disabled={!!selectedProtocolId}
                >
                  <option value="">Selecionar serviço avulso...</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}{s.duration_minutes ? ` (${s.duration_minutes} min)` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {selectedService?.duration_minutes && (
                <div style={{
                  padding: "8px 12px", borderRadius: "8px",
                  background: "rgba(184,150,12,0.06)", border: "1px solid rgba(184,150,12,0.15)",
                  fontSize: "12px", color: "#B8960C", fontWeight: 600,
                }}>
                  Duração: {selectedService.duration_minutes} minutos
                </div>
              )}
            </div>
          )}

          {/* ──── STEP 3 (sem preSelected) — Horário ──── */}
          {!preSelected && step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                <button onClick={prevDay} style={{ background: "#F5EDE0", border: "none", borderRadius: "8px", padding: "8px 10px", cursor: "pointer", color: "var(--muted-foreground)" }}>
                  <ChevronLeft size={16} strokeWidth={1.5} />
                </button>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--foreground)", margin: 0, textTransform: "capitalize" }}>
                    {fmtDateFull(selectedDate)}
                  </p>
                  {selectedService && (
                    <p style={{ fontSize: "11px", color: "var(--muted-foreground)", margin: "2px 0 0" }}>
                      {selectedService.name} · {durationMin} min
                    </p>
                  )}
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
                  <label style={labelStyle}>Horários disponíveis · {rooms.length} sala{rooms.length !== 1 ? "s" : ""}</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}>
                    {slotAvailability.map(({ slot, freeRooms: fr }) => {
                      const available = fr.length > 0;
                      const isSelected = selectedTime === slot;
                      return (
                        <button key={slot} type="button" disabled={!available}
                          onClick={() => setSelectedTime(isSelected ? "" : slot)}
                          style={{
                            padding: "8px 4px", borderRadius: "8px", textAlign: "center",
                            border: isSelected ? "2px solid var(--primary)" : available ? "1.5px solid var(--border)" : "1.5px solid var(--border)",
                            background: isSelected ? "linear-gradient(135deg, #C9A84C, #A67E0A)" : "var(--card)",
                            color: isSelected ? "#0E0C0A" : available ? "var(--foreground)" : "var(--muted-foreground)",
                            fontSize: "12px", fontWeight: isSelected ? 700 : available ? 600 : 400,
                            cursor: available ? "pointer" : "not-allowed", fontFamily: "inherit",
                            opacity: available ? 1 : 0.5,
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
            </div>
          )}

          {/* ──── STEP 4 (sem preSelected) — Sala ──── */}
          {!preSelected && step === 4 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{
                padding: "10px 14px", borderRadius: "9px",
                background: "rgba(184,150,12,0.06)", border: "1px solid rgba(184,150,12,0.15)",
              }}>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--foreground)", margin: "0 0 2px", textTransform: "capitalize" }}>
                  {fmtDateFull(selectedDate)} às {selectedTime}
                </p>
                <p style={{ fontSize: "12px", color: "var(--muted-foreground)", margin: 0 }}>
                  {selectedService?.name} · até {addMinutes(selectedTime, durationMin)}
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

          {/* ──── ÚLTIMO PASSO — Confirmar + Observações ──── */}
          {step === totalSteps && (() => {
            // Calcula aviso de intervalo
            const proto = protocols.find(p => p.id === selectedProtocolId);
            const intervalDays = proto?.interval_days ?? null;
            let intervalWarning: string | null = null;
            if (intervalDays && lastSessionDate) {
              const agendDate = new Date((preSelected ? date : selectedDate) + "T12:00:00");
              const diffDays = Math.round((agendDate.getTime() - lastSessionDate.getTime()) / 86400000);
              if (diffDays < intervalDays) {
                intervalWarning = `Intervalo recomendado: ${intervalDays} dias. Última sessão há ${diffDays} dia${diffDays !== 1 ? "s" : ""}.`;
              }
            }
            return (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Aviso de intervalo */}
              {intervalWarning && (
                <div style={{
                  padding: "10px 12px", borderRadius: "8px",
                  background: "rgba(224,123,0,0.07)", border: "1px solid rgba(224,123,0,0.25)",
                  color: "#C47000", fontSize: "12px", fontWeight: 600,
                  display: "flex", alignItems: "flex-start", gap: "6px",
                }}>
                  <span style={{ fontSize: "14px", flexShrink: 0 }}>⚠️</span>
                  <span>{intervalWarning}</span>
                </div>
              )}
              {/* Resumo do agendamento */}
              <div style={{
                padding: "14px 16px", borderRadius: "12px",
                background: "var(--muted)", border: "1px solid var(--border)",
                display: "flex", flexDirection: "column", gap: "8px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "50%",
                    background: "linear-gradient(135deg, #D4B86A, #B8960C)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#FFFDF7", fontSize: "11px", fontWeight: 700, flexShrink: 0,
                  }}>
                    {selectedClient?.name.split(" ").slice(0, 2).map(p => p[0]?.toUpperCase() ?? "").join("")}
                  </div>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--foreground)", margin: 0 }}>{selectedClient?.name}</p>
                    <p style={{ fontSize: "11px", color: "var(--muted-foreground)", margin: 0 }}>{selectedService?.name ?? "—"}</p>
                  </div>
                </div>
                <div style={{ height: "1px", background: "#EDE5D3" }} />
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <p style={{ fontSize: "10px", fontWeight: 700, color: "#BBA870", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 2px" }}>Horário</p>
                    <p style={{ fontSize: "12px", color: "var(--foreground)", margin: 0, fontWeight: 600 }}>
                      {effectiveTime} → {addMinutes(effectiveTime, durationMin)}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: "10px", fontWeight: 700, color: "#BBA870", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 2px" }}>Sala</p>
                    <p style={{ fontSize: "12px", color: "var(--foreground)", margin: 0, fontWeight: 600 }}>{effectiveRoom?.name ?? "—"}</p>
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div>
                <label style={labelStyle}>Observações (opcional)</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Alguma observação sobre este agendamento..."
                  style={{ ...inputStyle, resize: "none", lineHeight: "1.4" }}
                />
              </div>
            </div>
            );
          })()}

          {/* Erro */}
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
          flexShrink: 0, borderRadius: "0 0 18px 18px", background: "var(--card)",
        }}>
          <button
            onClick={step === 1 ? onClose : () => setStep(s => s - 1)}
            style={{
              padding: "9px 18px", borderRadius: "9px", border: "1px solid var(--border)",
              background: "none", fontSize: "13px", color: "var(--muted-foreground)",
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            {step === 1 ? "Cancelar" : "← Voltar"}
          </button>
          <button
            onClick={handleNext}
            disabled={!canNext() || isPending}
            style={{
              padding: "9px 22px", borderRadius: "9px", border: "none",
              background: !canNext() || isPending ? "#EDE5D3" : "linear-gradient(135deg, #D4B86A, #B8960C)",
              color: "#161412", fontSize: "13px", fontWeight: 700,
              cursor: !canNext() || isPending ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
          >
            {step === totalSteps
              ? (isPending ? "Agendando..." : "Confirmar agendamento")
              : "Próximo →"}
          </button>
        </div>
      </div>
    </>
  );
}
