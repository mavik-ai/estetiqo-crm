'use client'

import { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";

interface Appointment {
  id: string;
  starts_at: string;
  ends_at: string;
  rsvp_status: string | null;
  no_show: boolean;
  room_id: string | null;
  clients: { id: string; name: string } | null;
  services: { id: string; name: string } | null;
  rooms: { id: string; name: string } | null;
}

interface Room {
  id: string;
  name: string;
}

type ViewMode = "day" | "week";

const RSVP_ICONS: Record<string, { icon: React.ReactNode; bg: string; border: string }> = {
  confirmed:  { icon: <CheckCircle size={13} strokeWidth={1.5} />, bg: "rgba(45,140,78,0.10)",   border: "rgba(45,140,78,0.25)"   },
  pending:    { icon: <Clock size={13} strokeWidth={1.5} />,        bg: "rgba(58,123,213,0.10)",  border: "rgba(58,123,213,0.25)"  },
  noresponse: { icon: <AlertCircle size={13} strokeWidth={1.5} />,  bg: "rgba(196,136,10,0.10)",  border: "rgba(196,136,10,0.25)"  },
  cancelled:  { icon: <XCircle size={13} strokeWidth={1.5} />,      bg: "rgba(217,68,68,0.10)",   border: "rgba(217,68,68,0.25)"   },
};

const RSVP_COLORS: Record<string, { color: string }> = {
  confirmed:  { color: "#2D8C4E" },
  pending:    { color: "#3A7BD5" },
  noresponse: { color: "#C4880A" },
  cancelled:  { color: "#D94444" },
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

export default function AgendaPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<ViewMode>("day");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (date: Date) => {
    setLoading(true);
    const supabase = createClient();
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

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
      start = dayStart;
      end = dayEnd;
    }

    const [apptRes, roomsRes] = await Promise.all([
      supabase
        .from("appointments")
        .select("id, starts_at, ends_at, rsvp_status, no_show, room_id, clients(id, name), services(id, name), rooms(id, name)")
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

  const timeSlots = generateTimeSlots();

  // Map: slot -> roomId -> Appointment
  const slotRoomMap: Record<string, Record<string, Appointment>> = {};
  appointments.forEach((appt) => {
    const slot = getSlotKey(appt.starts_at);
    const roomId = appt.room_id ?? "sem-sala";
    if (!slotRoomMap[slot]) slotRoomMap[slot] = {};
    slotRoomMap[slot][roomId] = appt;
  });

  // Week view: map dateStr -> appointments
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

  return (
    <div className="px-6 py-5" style={{ background: "#F6F2EA", minHeight: "100%" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "22px",
              fontWeight: 700,
              color: "#2D2319",
              margin: 0,
            }}
          >
            Agenda
          </h1>
          <p style={{ color: "#A69060", fontSize: "13px", marginTop: "2px", textTransform: "capitalize" }}>
            {view === "day" ? formatDateBR(selectedDate) : "Visão Semanal"}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Navegação de data */}
          <div
            className="flex items-center"
            style={{
              background: "#FFFFFF",
              border: "1px solid #EDE5D3",
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            <button
              onClick={prevDate}
              style={{ padding: "8px 10px", color: "#A69060", cursor: "pointer", border: "none", background: "transparent" }}
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
                color: "#2D2319",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                borderLeft: "1px solid #EDE5D3",
                borderRight: "1px solid #EDE5D3",
              }}
            >
              Hoje
            </button>
            <button
              onClick={nextDate}
              style={{ padding: "8px 10px", color: "#A69060", cursor: "pointer", border: "none", background: "transparent" }}
              aria-label="Próxima data"
            >
              <ChevronRight size={16} strokeWidth={1.5} />
            </button>
          </div>

          {/* Toggle Dia/Semana */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #EDE5D3",
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
            background: "#FFFFFF",
            border: "1px solid #EDE5D3",
            borderRadius: "14px",
            overflow: "hidden",
          }}
        >
          {/* Cabeçalho de salas */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `80px repeat(${Math.max(rooms.length, 1)}, 1fr)`,
              borderBottom: "1px solid #EDE5D3",
            }}
          >
            <div style={{ padding: "12px 10px", background: "#FAFAF8" }} />
            {rooms.length > 0 ? (
              rooms.map((room) => (
                <div
                  key={room.id}
                  style={{
                    padding: "12px 16px",
                    background: "#FAFAF8",
                    borderLeft: "1px solid #EDE5D3",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#2D2319",
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
                  background: "#FAFAF8",
                  borderLeft: "1px solid #EDE5D3",
                  fontSize: "12px",
                  color: "#A69060",
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
                    const rsvp = appt?.rsvp_status ?? "noresponse";
                    const rsvpCfg = RSVP_ICONS[rsvp] ?? RSVP_ICONS["noresponse"];
                    const rsvpColor = RSVP_COLORS[rsvp] ?? RSVP_COLORS["noresponse"];
                    const clientName = appt?.clients?.name ?? "";
                    const serviceName = appt?.services?.name ?? "";

                    return (
                      <div
                        key={room.id}
                        style={{
                          borderLeft: "1px solid #EDE5D3",
                          padding: "6px 8px",
                          display: "flex",
                          alignItems: "stretch",
                        }}
                      >
                        {appt ? (
                          <div
                            style={{
                              flex: 1,
                              background: rsvpCfg.bg,
                              border: `1px solid ${rsvpCfg.border}`,
                              borderRadius: "8px",
                              padding: "8px 10px",
                              display: "flex",
                              flexDirection: "column",
                              gap: "3px",
                            }}
                          >
                            <div className="flex items-center gap-1.5">
                              <span style={{ color: rsvpColor.color }}>{rsvpCfg.icon}</span>
                              <p
                                style={{
                                  fontSize: "12px",
                                  fontWeight: 700,
                                  color: "#2D2319",
                                  margin: 0,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {clientName}
                              </p>
                            </div>
                            <p
                              style={{
                                fontSize: "11px",
                                color: "#A69060",
                                margin: 0,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {serviceName}
                            </p>
                          </div>
                        ) : (
                          <div
                            style={{
                              flex: 1,
                              borderRadius: "8px",
                              display: "flex",
                              alignItems: "center",
                              paddingLeft: "8px",
                            }}
                          >
                            <span style={{ fontSize: "11px", color: "#BBA870" }}>Disponível</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div
                    style={{
                      borderLeft: "1px solid #EDE5D3",
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
            background: "#FFFFFF",
            border: "1px solid #EDE5D3",
            borderRadius: "14px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              borderBottom: "1px solid #EDE5D3",
            }}
          >
            {weekDays.map((day, idx) => {
              const isToday = isoDate(day) === isoDate(new Date());
              return (
                <div
                  key={idx}
                  style={{
                    padding: "12px 10px",
                    borderLeft: idx > 0 ? "1px solid #EDE5D3" : "none",
                    background: isToday ? "rgba(184,150,12,0.06)" : "#FAFAF8",
                    textAlign: "center",
                  }}
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
                </div>
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
              const isToday = ds === isoDate(new Date());
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
                  {dayAppts.length === 0 ? (
                    <p style={{ fontSize: "11px", color: "#BBA870", textAlign: "center", marginTop: "8px" }}>
                      —
                    </p>
                  ) : (
                    dayAppts.map((appt) => {
                      const rsvp = appt.rsvp_status ?? "noresponse";
                      const rsvpCfg = RSVP_ICONS[rsvp] ?? RSVP_ICONS["noresponse"];
                      const rsvpColor = RSVP_COLORS[rsvp] ?? RSVP_COLORS["noresponse"];
                      const hora = new Date(appt.starts_at).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                      return (
                        <div
                          key={appt.id}
                          style={{
                            background: rsvpCfg.bg,
                            border: `1px solid ${rsvpCfg.border}`,
                            borderRadius: "7px",
                            padding: "6px 8px",
                          }}
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
                              color: "#2D2319",
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
                              color: "#A69060",
                              margin: 0,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {appt.services?.name ?? "—"}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
