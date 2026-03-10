'use client'

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  X,
  Calendar,
} from "lucide-react";
import { QuickCreateModal } from "./QuickCreateModal";

interface Appointment {
  id: string;
  starts_at: string;
  ends_at: string;
  rsvp_status: string | null;
  no_show: boolean;
  room_id: string | null;
  notes: string | null;
  clients: { id: string; name: string } | null;
  services: { id: string; name: string } | null;
  rooms: { id: string; name: string } | null;
}

interface Room {
  id: string;
  name: string;
}

interface CreateSlot {
  date: string;
  time: string;
  roomId: string;
  preSelected: boolean; // true = clicou num slot específico da agenda
}

type ViewMode = "day" | "week";

const RSVP_ICONS: Record<string, { icon: React.ReactNode; bg: string; border: string }> = {
  confirmed: { icon: <CheckCircle size={13} strokeWidth={1.5} />, bg: "rgba(45,140,78,0.10)",  border: "rgba(45,140,78,0.25)"  },
  pending:   { icon: <Clock size={13} strokeWidth={1.5} />,       bg: "rgba(58,123,213,0.10)", border: "rgba(58,123,213,0.25)" },
  cancelled: { icon: <XCircle size={13} strokeWidth={1.5} />,     bg: "rgba(217,68,68,0.10)",  border: "rgba(217,68,68,0.25)"  },
};

const RSVP_COLORS: Record<string, { color: string }> = {
  confirmed: { color: "#2D8C4E" },
  pending:   { color: "#3A7BD5" },
  cancelled: { color: "#D94444" },
};

const RSVP_LABELS: Record<string, string> = {
  confirmed: "Confirmado",
  pending:   "Pendente",
  cancelled: "Cancelado",
};

function formatDateBR(date: Date): string {
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatWeekDay(date: Date): string {
  return date.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" });
}

function isoDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 7; h <= 20; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    if (h < 20) slots.push(`${String(h).padStart(2, "0")}:30`);
  }
  return slots;
}

function getSlotKey(startsAt: string): string {
  const d = new Date(startsAt);
  const h = String(d.getHours()).padStart(2, "0");
  const m = d.getMinutes() < 30 ? "00" : "30";
  return `${h}:${m}`;
}

// Painel de detalhe do agendamento
function AppointmentDetail({ appt, onClose }: { appt: Appointment; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const rsvp = appt.rsvp_status ?? "pending";
  const rsvpCfg = RSVP_ICONS[rsvp] ?? RSVP_ICONS["pending"];
  const rsvpColor = RSVP_COLORS[rsvp] ?? RSVP_COLORS["pending"];
  const rsvpLabel = RSVP_LABELS[rsvp] ?? "—";

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <>
      {/* Backdrop leve */}
      <div style={{ position: "fixed", inset: 0, zIndex: 98 }} />
      {/* Painel */}
      <div
        ref={ref}
        style={{
          position: "fixed",
          top: "50%",
          right: "24px",
          transform: "translateY(-50%)",
          width: "300px",
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          boxShadow: "0 16px 48px rgba(45,35,25,0.16)",
          zIndex: 99,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "16px 18px 12px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}>
          <div>
            <p style={{ fontSize: "10px", fontWeight: 700, color: "#BBA870", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 4px" }}>
              Agendamento
            </p>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: 700, color: "var(--foreground)", margin: 0 }}>
              {appt.clients?.name ?? "—"}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: "2px" }}
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {/* RSVP status */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 10px",
            borderRadius: "20px",
            background: rsvpCfg.bg,
            border: `1px solid ${rsvpCfg.border}`,
            alignSelf: "flex-start",
          }}>
            <span style={{ color: rsvpColor.color }}>{rsvpCfg.icon}</span>
            <span style={{ fontSize: "11px", fontWeight: 700, color: rsvpColor.color }}>{rsvpLabel}</span>
          </div>

          {/* Serviço */}
          <div>
            <p style={{ fontSize: "10px", fontWeight: 700, color: "#BBA870", letterSpacing: "0.05em", textTransform: "uppercase", margin: "0 0 2px" }}>Serviço</p>
            <p style={{ fontSize: "13px", color: "var(--foreground)", margin: 0, fontWeight: 600 }}>{appt.services?.name ?? "—"}</p>
          </div>

          {/* Horário */}
          <div>
            <p style={{ fontSize: "10px", fontWeight: 700, color: "#BBA870", letterSpacing: "0.05em", textTransform: "uppercase", margin: "0 0 2px" }}>Horário</p>
            <p style={{ fontSize: "13px", color: "var(--foreground)", margin: 0 }}>
              {formatTime(appt.starts_at)} → {formatTime(appt.ends_at)}
            </p>
          </div>

          {/* Sala */}
          {appt.rooms && (
            <div>
              <p style={{ fontSize: "10px", fontWeight: 700, color: "#BBA870", letterSpacing: "0.05em", textTransform: "uppercase", margin: "0 0 2px" }}>Sala</p>
              <p style={{ fontSize: "13px", color: "var(--foreground)", margin: 0 }}>{appt.rooms.name}</p>
            </div>
          )}

          {/* Observações */}
          {appt.notes && (
            <div>
              <p style={{ fontSize: "10px", fontWeight: 700, color: "#BBA870", letterSpacing: "0.05em", textTransform: "uppercase", margin: "0 0 2px" }}>Observações</p>
              <p style={{ fontSize: "12px", color: "var(--muted-foreground)", margin: 0, lineHeight: "1.4" }}>{appt.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {appt.clients?.id && (
          <div style={{ padding: "10px 18px 16px", borderTop: "1px solid var(--border)" }}>
            <Link
              href={`/clientes/${appt.clients.id}`}
              onClick={onClose}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "9px",
                background: "linear-gradient(135deg, #D4B86A, #B8960C)",
                color: "#161412",
                fontSize: "12px",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              <Calendar size={13} strokeWidth={2} />
              Ver ficha da cliente
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

export default function AgendaPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<ViewMode>("day");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal de criação rápida
  const [createSlot, setCreateSlot] = useState<CreateSlot | null>(null);
  // Painel de detalhe
  const [detailAppt, setDetailAppt] = useState<Appointment | null>(null);
  // Hover no slot vazio (key = `${slot}-${roomId}`)
  const [hoverSlot, setHoverSlot] = useState<string | null>(null);

  const fetchData = useCallback(async (date: Date) => {
    setLoading(true);
    const supabase = createClient();

    let start: Date;
    let end: Date;

    if (view === "week") {
      const dow = date.getDay();
      start = new Date(date);
      start.setDate(date.getDate() - dow);
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else {
      start = new Date(date);
      start.setHours(0, 0, 0, 0);
      end = new Date(date);
      end.setHours(23, 59, 59, 999);
    }

    const [apptRes, roomsRes] = await Promise.all([
      supabase
        .from("appointments")
        .select("id, starts_at, ends_at, rsvp_status, no_show, room_id, notes, clients(id, name), services(id, name), rooms(id, name)")
        .eq("is_block", false)
        .gte("starts_at", start.toISOString())
        .lte("starts_at", end.toISOString())
        .order("starts_at"),
      supabase
        .from("rooms")
        .select("id, name")
        .eq("is_active", true)
        .order("name"),
    ]);

    setAppointments((apptRes.data ?? []) as unknown as Appointment[]);
    setRooms((roomsRes.data ?? []) as unknown as Room[]);
    setLoading(false);
  }, [view]);

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate, view, fetchData]);

  function prevDate() {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - (view === "week" ? 7 : 1));
    setSelectedDate(d);
  }

  function nextDate() {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + (view === "week" ? 7 : 1));
    setSelectedDate(d);
  }

  function openCreate(date: string, time: string, roomId: string, preSelected = false) {
    setDetailAppt(null);
    setCreateSlot({ date, time, roomId, preSelected });
  }

  const timeSlots = generateTimeSlots();

  // Map: slot -> roomId -> Appointment (day view)
  const slotRoomMap: Record<string, Record<string, Appointment>> = {};
  appointments.forEach((appt) => {
    const slot = getSlotKey(appt.starts_at);
    const roomId = appt.room_id ?? "sem-sala";
    if (!slotRoomMap[slot]) slotRoomMap[slot] = {};
    slotRoomMap[slot][roomId] = appt;
  });

  // Week view
  const weekDays: Date[] = [];
  if (view === "week") {
    const dow = selectedDate.getDay();
    for (let i = 0; i < 7; i++) {
      const d = new Date(selectedDate);
      d.setDate(selectedDate.getDate() - dow + i);
      weekDays.push(d);
    }
  }

  const weekApptMap: Record<string, Appointment[]> = {};
  if (view === "week") {
    appointments.forEach((appt) => {
      const ds = isoDate(new Date(appt.starts_at));
      if (!weekApptMap[ds]) weekApptMap[ds] = [];
      weekApptMap[ds].push(appt);
    });
  }

  const todayStr = isoDate(new Date());
  const selectedDateStr = isoDate(selectedDate);

  return (
    <div className="px-6 py-5" style={{ background: "var(--background)", minHeight: "100%" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "22px",
              fontWeight: 700,
              color: "var(--foreground)",
              margin: 0,
            }}
          >
            Agenda
          </h1>
          <p style={{ color: "var(--muted-foreground)", fontSize: "13px", marginTop: "2px", textTransform: "capitalize" }}>
            {view === "day" ? formatDateBR(selectedDate) : "Visão Semanal"}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Navegação de data */}
          <div
            className="flex items-center"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            <button
              onClick={prevDate}
              style={{ padding: "8px 10px", color: "var(--muted-foreground)", cursor: "pointer", border: "none", background: "transparent" }}
              aria-label="Data anterior"
            >
              <ChevronLeft size={16} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setSelectedDate(new Date())}
              style={{
                padding: "8px 12px",
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--foreground)",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                borderLeft: "1px solid var(--border)",
                borderRight: "1px solid var(--border)",
              }}
            >
              Hoje
            </button>
            <button
              onClick={nextDate}
              style={{ padding: "8px 10px", color: "var(--muted-foreground)", cursor: "pointer", border: "none", background: "transparent" }}
              aria-label="Próxima data"
            >
              <ChevronRight size={16} strokeWidth={1.5} />
            </button>
          </div>

          {/* Toggle Dia/Semana */}
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              padding: "3px",
              display: "flex",
              gap: "2px",
            }}
          >
            {(["day", "week"] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "7px",
                  fontSize: "12px",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  background: view === v ? "linear-gradient(135deg, #D4B86A, #B8960C)" : "transparent",
                  color: view === v ? "#161412" : "#A69060",
                  transition: "all 0.15s",
                }}
              >
                {v === "day" ? "Dia" : "Semana"}
              </button>
            ))}
          </div>

          {/* Botão novo agendamento */}
          <Link
            href="/agenda/novo"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "linear-gradient(135deg, #D4B86A, #B8960C)",
              color: "#161412",
              fontSize: "13px",
              fontWeight: 600,
              padding: "9px 16px",
              borderRadius: "10px",
              textDecoration: "none",
            }}
          >
            <Plus size={15} strokeWidth={2} />
            Novo Agendamento
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              border: "3px solid #EDE5D3",
              borderTopColor: "#B8960C",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : view === "day" ? (
        /* ---- VISÃO DIA ---- */
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "14px",
            overflow: "hidden",
          }}
        >
          {/* Cabeçalho de salas */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `80px repeat(${Math.max(rooms.length, 1)}, 1fr)`,
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div style={{ padding: "12px 10px", background: "var(--muted)" }} />
            {rooms.length > 0 ? (
              rooms.map((room) => (
                <div
                  key={room.id}
                  style={{
                    padding: "12px 16px",
                    background: "var(--muted)",
                    borderLeft: "1px solid var(--border)",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "var(--foreground)",
                    letterSpacing: "0.02em",
                    textTransform: "uppercase",
                  }}
                >
                  {room.name}
                </div>
              ))
            ) : (
              <div
                style={{
                  padding: "12px 16px",
                  background: "var(--muted)",
                  borderLeft: "1px solid var(--border)",
                  fontSize: "12px",
                  color: "var(--muted-foreground)",
                }}
              >
                Sem salas configuradas
              </div>
            )}
          </div>

          {/* Slots de hora */}
          <div style={{ maxHeight: "600px", overflowY: "auto" }}>
            {timeSlots.map((slot) => (
              <div
                key={slot}
                style={{
                  display: "grid",
                  gridTemplateColumns: `80px repeat(${Math.max(rooms.length, 1)}, 1fr)`,
                  borderBottom: "1px solid #F0EBE0",
                  minHeight: "52px",
                }}
              >
                {/* Horário */}
                <div
                  style={{
                    padding: "10px",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#BBA870",
                    display: "flex",
                    alignItems: "flex-start",
                    paddingTop: "8px",
                  }}
                >
                  {slot}
                </div>

                {/* Células por sala */}
                {rooms.length > 0 ? (
                  rooms.map((room) => {
                    const appt = slotRoomMap[slot]?.[room.id];
                    const rsvp = appt?.rsvp_status ?? "pending";
                    const rsvpCfg = RSVP_ICONS[rsvp] ?? RSVP_ICONS["pending"];
                    const rsvpColor = RSVP_COLORS[rsvp] ?? RSVP_COLORS["pending"];
                    const cellKey = `${slot}-${room.id}`;
                    const isHovered = hoverSlot === cellKey;

                    return (
                      <div
                        key={room.id}
                        style={{
                          borderLeft: "1px solid var(--border)",
                          padding: "6px 8px",
                          display: "flex",
                          alignItems: "stretch",
                        }}
                      >
                        {appt ? (
                          /* Agendamento existente — clicável */
                          <button
                            onClick={() => {
                              setCreateSlot(null);
                              setDetailAppt(detailAppt?.id === appt.id ? null : appt);
                            }}
                            style={{
                              flex: 1,
                              background: rsvpCfg.bg,
                              border: `1px solid ${rsvpCfg.border}`,
                              borderRadius: "8px",
                              padding: "8px 10px",
                              display: "flex",
                              flexDirection: "column",
                              gap: "3px",
                              cursor: "pointer",
                              textAlign: "left",
                              outline: "none",
                              transition: "opacity 0.1s",
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.8"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
                          >
                            <div className="flex items-center gap-1.5">
                              <span style={{ color: rsvpColor.color }}>{rsvpCfg.icon}</span>
                              <p
                                style={{
                                  fontSize: "12px",
                                  fontWeight: 700,
                                  color: "var(--foreground)",
                                  margin: 0,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {appt.clients?.name ?? "—"}
                              </p>
                            </div>
                            <p
                              style={{
                                fontSize: "11px",
                                color: "var(--muted-foreground)",
                                margin: 0,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {appt.services?.name ?? "—"}
                            </p>
                          </button>
                        ) : (
                          /* Slot vazio — hover mostra botão de agendar */
                          <button
                            onClick={() => openCreate(selectedDateStr, slot, room.id, true)}
                            onMouseEnter={() => setHoverSlot(cellKey)}
                            onMouseLeave={() => setHoverSlot(null)}
                            style={{
                              flex: 1,
                              borderRadius: "8px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: isHovered ? "center" : "flex-start",
                              paddingLeft: isHovered ? 0 : "8px",
                              cursor: "pointer",
                              border: isHovered ? "1.5px dashed #D4B86A" : "1.5px solid transparent",
                              background: isHovered ? "rgba(212,184,106,0.06)" : "transparent",
                              transition: "all 0.12s",
                              outline: "none",
                              gap: "4px",
                            }}
                          >
                            {isHovered ? (
                              <>
                                <Plus size={12} strokeWidth={2.5} style={{ color: "#B8960C" }} />
                                <span style={{ fontSize: "11px", fontWeight: 700, color: "#B8960C" }}>Agendar</span>
                              </>
                            ) : (
                              <span style={{ fontSize: "11px", color: "#EDE5D3" }}>—</span>
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div
                    style={{
                      borderLeft: "1px solid var(--border)",
                      padding: "6px 8px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: "11px", color: "#BBA870" }}>—</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ---- VISÃO SEMANA ---- */
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "14px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            {weekDays.map((day, idx) => {
              const isToday = isoDate(day) === todayStr;
              const ds = isoDate(day);
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedDate(new Date(ds + "T12:00:00"));
                    setView("day");
                  }}
                  style={{
                    padding: "12px 10px",
                    borderLeft: idx > 0 ? "1px solid #EDE5D3" : "none",
                    background: isToday ? "rgba(184,150,12,0.08)" : "transparent",
                    textAlign: "center",
                    cursor: "pointer",
                    border: "none",
                    borderLeft: idx > 0 ? "1px solid var(--border)" : "none",
                    outline: "none",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={e => { if (!isToday) (e.currentTarget as HTMLButtonElement).style.background = "var(--accent)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = isToday ? "rgba(184,150,12,0.08)" : "transparent"; }}
                >
                  <p
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: isToday ? "#B8960C" : "#BBA870",
                      margin: 0,
                      textTransform: "capitalize",
                    }}
                  >
                    {formatWeekDay(day)}
                  </p>
                </button>
              );
            })}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              minHeight: "300px",
            }}
          >
            {weekDays.map((day, idx) => {
              const ds = isoDate(day);
              const dayAppts = weekApptMap[ds] ?? [];
              const isToday = ds === todayStr;
              return (
                <div
                  key={idx}
                  style={{
                    borderLeft: idx > 0 ? "1px solid #EDE5D3" : "none",
                    padding: "10px 8px",
                    background: isToday ? "rgba(184,150,12,0.03)" : "transparent",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  {/* Botão agendar no dia */}
                  {rooms.length > 0 && (
                    <button
                      onClick={() => openCreate(ds, "09:00", rooms[0].id, false)}
                      style={{
                        width: "100%",
                        padding: "4px 0",
                        fontSize: "10px",
                        fontWeight: 700,
                        color: "#B8960C",
                        background: "rgba(212,184,106,0.08)",
                        border: "1px dashed #D4B86A",
                        borderRadius: "6px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "3px",
                        outline: "none",
                      }}
                    >
                      <Plus size={10} strokeWidth={2.5} /> Agendar
                    </button>
                  )}

                  {dayAppts.length === 0 ? (
                    <p style={{ fontSize: "11px", color: "#BBA870", textAlign: "center", marginTop: "4px" }}>
                      —
                    </p>
                  ) : (
                    dayAppts.map((appt) => {
                      const rsvp = appt.rsvp_status ?? "pending";
                      const rsvpCfg = RSVP_ICONS[rsvp] ?? RSVP_ICONS["pending"];
                      const rsvpColor = RSVP_COLORS[rsvp] ?? RSVP_COLORS["pending"];
                      const hora = formatTime(appt.starts_at);
                      return (
                        <button
                          key={appt.id}
                          onClick={() => {
                            setCreateSlot(null);
                            setDetailAppt(detailAppt?.id === appt.id ? null : appt);
                          }}
                          style={{
                            background: rsvpCfg.bg,
                            border: `1px solid ${rsvpCfg.border}`,
                            borderRadius: "7px",
                            padding: "6px 8px",
                            cursor: "pointer",
                            textAlign: "left",
                            outline: "none",
                            width: "100%",
                            transition: "opacity 0.1s",
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.75"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
                        >
                          <div className="flex items-center gap-1" style={{ color: rsvpColor.color }}>
                            {rsvpCfg.icon}
                            <p style={{ fontSize: "10px", fontWeight: 600, color: rsvpColor.color, margin: 0 }}>
                              {hora}
                            </p>
                          </div>
                          <p
                            style={{
                              fontSize: "11px",
                              fontWeight: 700,
                              color: "var(--foreground)",
                              margin: "2px 0 0",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {appt.clients?.name ?? "—"}
                          </p>
                          <p
                            style={{
                              fontSize: "10px",
                              color: "var(--muted-foreground)",
                              margin: 0,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {appt.services?.name ?? "—"}
                          </p>
                        </button>
                      );
                    })
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de criação rápida */}
      {createSlot && (
        <QuickCreateModal
          date={createSlot.date}
          time={createSlot.time}
          roomId={createSlot.roomId}
          rooms={rooms}
          preSelected={createSlot.preSelected}
          onClose={() => setCreateSlot(null)}
          onSuccess={() => {
            setCreateSlot(null);
            fetchData(selectedDate);
          }}
        />
      )}

      {/* Painel de detalhe do agendamento */}
      {detailAppt && (
        <AppointmentDetail
          appt={detailAppt}
          onClose={() => setDetailAppt(null)}
        />
      )}
    </div>
  );
}
