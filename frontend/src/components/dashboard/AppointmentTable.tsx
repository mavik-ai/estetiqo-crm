'use client'

import React, { useState } from "react";
import { CheckCircle, Clock, AlertTriangle, XCircle, Send, ChevronRight } from "lucide-react";
import { AppointmentActions } from "./AppointmentActions";

export interface Appointment {
    id: string;
    hora: string;
    client_name: string;
    client_initials: string;
    service: string;
    protocol: string;
    room: string;
    professional: string;
    rsvp_status: 'confirmed' | 'pending' | 'noresponse' | 'cancelled';
    no_show: boolean;
}

const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    confirmed:  { color: "#2D8C4E", icon: <CheckCircle size={16} />,   label: "Confirmado" },
    pending:    { color: "#3A7BD5", icon: <Clock size={16} />,          label: "Pendente" },
    noresponse: { color: "#C4880A", icon: <AlertTriangle size={16} />,  label: "Sem resposta" },
    cancelled:  { color: "#D94444", icon: <XCircle size={16} />,        label: "Cancelou" },
};

export function AppointmentTable({ appointments }: { appointments: Appointment[] }) {
    const [activeFilter, setActiveFilter] = useState("all");
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);

    const filtered = activeFilter === "all"
        ? appointments
        : appointments.filter(a => a.rsvp_status === activeFilter);

    const filters = [
        { id: "all",        label: "Todos",        count: appointments.length },
        { id: "confirmed",  label: "Confirmados",  count: appointments.filter(a => a.rsvp_status === "confirmed").length },
        { id: "pending",    label: "Pendentes",    count: appointments.filter(a => a.rsvp_status === "pending").length },
        { id: "noresponse", label: "Sem resposta", count: appointments.filter(a => a.rsvp_status === "noresponse").length },
    ];

    const card  = { background: "#FFFFFF", border: "1px solid #EDE5D3", borderRadius: "14px" };
    const sTitle = { color: "#A69060", fontWeight: 700, letterSpacing: "0.12em", fontSize: "10px", textTransform: "uppercase" as const };
    const sLink  = { color: "#B8960C", fontWeight: 600, fontSize: "11px", display: "flex", alignItems: "center", gap: "2px", cursor: "pointer" };

    return (
        <div className="p-4" style={card}>
            <div className="flex justify-between items-center mb-3">
                <div style={sTitle}>Próximos atendimentos</div>
                <button style={sLink}>Ver agenda <ChevronRight size={13} /></button>
            </div>

            <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
                {filters.map((f) => (
                    <button
                        key={f.id}
                        onClick={() => setActiveFilter(f.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
                        style={{
                            background: activeFilter === f.id ? "#B8960C" : "#FBF5EA",
                            color: activeFilter === f.id ? "#FFFDF7" : "#8A7E60",
                            border: activeFilter === f.id ? "1px solid #B8960C" : "1px solid #EDE5D3",
                            fontSize: "11px", fontWeight: 600
                        }}
                    >
                        {f.label}
                        <span style={{
                            background: activeFilter === f.id ? "rgba(255,255,255,0.25)" : "#EDE5D3",
                            color: activeFilter === f.id ? "#FFFDF7" : "#A69060",
                            padding: "1px 6px", borderRadius: "8px", fontSize: "10px", fontWeight: 700
                        }}>
                            {f.count}
                        </span>
                    </button>
                ))}
            </div>

            <div className="grid items-center gap-2 pb-2" style={{ gridTemplateColumns: "30px 46px 1fr 1fr 52px 64px 56px 38px", borderBottom: "1px solid #F5EDE0" }}>
                {["", "Hora", "Paciente", "Serviço", "Protoc.", "Sala", "Prof.", ""].map((h, i) => (
                    <div key={i} className="font-bold" style={{ color: "#BBA870", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase" }}>{h}</div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="py-8 text-center" style={{ color: "#BBA870", fontSize: "13px" }}>
                    Nenhum atendimento neste filtro.
                </div>
            )}

            {filtered.map((a, i) => {
                const sc = statusConfig[a.rsvp_status] ?? statusConfig.pending;
                const isUnconfirmed = a.rsvp_status !== "confirmed";
                const isH = hoveredRow === i;
                return (
                    <div
                        key={a.id}
                        onMouseEnter={() => setHoveredRow(i)}
                        onMouseLeave={() => setHoveredRow(null)}
                        className="grid items-center gap-2 relative cursor-pointer"
                        style={{
                            gridTemplateColumns: "30px 46px 1fr 1fr 52px 64px 56px 38px",
                            paddingTop: "10px", paddingBottom: "10px",
                            borderBottom: i < filtered.length - 1 ? "1px solid #F9F4EA" : "none",
                            background: isH ? "#FBF5EA" : "transparent",
                            borderRadius: isH ? "8px" : "0",
                            marginLeft: isH ? "-4px" : "0",
                            marginRight: isH ? "-4px" : "0",
                            paddingLeft: isH ? "4px" : "0",
                            paddingRight: isH ? "4px" : "0",
                            transition: 'all 0.15s ease'
                        }}
                    >
                        <div className="flex justify-center" style={{ color: sc.color }}>{sc.icon}</div>
                        <div className="font-bold" style={{ color: "#B8960C", fontSize: "13px" }}>{a.hora}</div>
                        <div className="flex items-center gap-2 min-w-0">
                            <div
                                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{
                                    background: isUnconfirmed ? `${sc.color}10` : "#F5EDE0",
                                    border: isUnconfirmed ? `1px solid ${sc.color}20` : "1px solid #EDE5D3"
                                }}
                            >
                                <span style={{ fontSize: "9px", fontWeight: 800, color: isUnconfirmed ? sc.color : "#A69060" }}>
                                    {a.client_initials}
                                </span>
                            </div>
                            <span className="font-semibold truncate" style={{ color: isUnconfirmed ? "#B8860B" : "#2D2319", fontSize: "12px" }}>
                                {a.client_name}
                            </span>
                        </div>
                        <div className="truncate" style={{ color: "#8A7E60", fontSize: "12px" }}>{a.service}</div>
                        {a.protocol ? (
                            <span className="px-1.5 py-0.5 rounded font-bold text-center" style={{ background: "#FBF5EA", border: "1px solid #EDE5D3", color: "#B8960C", fontSize: "10px" }}>
                                {a.protocol}
                            </span>
                        ) : (
                            <span style={{ color: "#BBA870", fontSize: "10px" }}>—</span>
                        )}
                        <div style={{ color: "#A69060", fontSize: "11px" }}>{a.room}</div>
                        <div style={{ color: "#A69060", fontSize: "11px", fontWeight: 600 }}>{a.professional}</div>

                        {/* Coluna de acoes */}
                        <div style={{ display: "flex", justifyContent: "flex-end" }} onClick={(e) => e.stopPropagation()}>
                            <AppointmentActions
                                appointmentId={a.id}
                                rsvpStatus={a.rsvp_status}
                                noShow={a.no_show}
                            />
                        </div>

                        {isUnconfirmed && isH && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10 animate-in fade-in zoom-in duration-200">
                                <button
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:brightness-95 transition-all"
                                    style={{
                                        background: "#FFFFFF",
                                        border: `1px solid ${sc.color}30`,
                                        boxShadow: `0 2px 8px ${sc.color}15`,
                                        color: sc.color, fontSize: "10px", fontWeight: 700
                                    }}
                                >
                                    <Send size={10} /> Reenviar RSVP
                                </button>
                            </div>
                        )}
                    </div>
                );
            })}

            <div className="flex gap-5 mt-3 pt-3 flex-wrap" style={{ borderTop: "1px solid #F5EDE0" }}>
                {Object.entries(statusConfig).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-1.5" style={{ color: v.color }}>
                        {v.icon}
                        <span style={{ color: "#A69060", fontSize: "10px", fontWeight: 500 }}>{v.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
