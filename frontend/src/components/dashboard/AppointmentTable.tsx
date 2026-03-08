'use client'

import React, { useState } from "react";
import { CheckCircle, Clock, AlertTriangle, XCircle, Send, ChevronRight } from "lucide-react";

const appointments = [
    { time: "08:30", name: "Maria Silva", initials: "MS", service: "Drenagem Linfática", protocol: "6/10", sala: "Sala 1", prof: "Ana Paula", status: "confirmed" },
    { time: "09:00", name: "Ana Costa", initials: "AC", service: "Criolipólise", protocol: "3/8", sala: "Sala 2", prof: "Michele", status: "pending" },
    { time: "10:00", name: "Julia Ramos", initials: "JR", service: "Laser Corporal", protocol: "2/6", sala: "Sala 1", prof: "Ana Paula", status: "noresponse" },
    { time: "11:00", name: "Carla Melo", initials: "CM", service: "Massagem Modelad.", protocol: "1/4", sala: "Sala 2", prof: "Michele", status: "confirmed" },
    { time: "14:00", name: "Paula Nunes", initials: "PN", service: "Radiofrequência", protocol: "4/5", sala: "Sala 1", prof: "Ana Paula", status: "pending" },
    { time: "15:30", name: "Renata Luz", initials: "RL", service: "Drenagem Linfática", protocol: "2/10", sala: "Sala 2", prof: "Michele", status: "confirmed" },
];

const statusConfig: Record<string, { color: string, icon: React.ReactNode, label: string }> = {
    confirmed: { color: "#2D8C4E", icon: <CheckCircle size={16} />, label: "Confirmado" },
    pending: { color: "#3A7BD5", icon: <Clock size={16} />, label: "Pendente" },
    noresponse: { color: "#C4880A", icon: <AlertTriangle size={16} />, label: "Sem resposta" },
    cancelled: { color: "#D94444", icon: <XCircle size={16} />, label: "Cancelou" },
};

export function AppointmentTable() {
    const [activeFilter, setActiveFilter] = useState("all");
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);

    const filtered = activeFilter === "all" ? appointments : appointments.filter(a => a.status === activeFilter);
    const filters = [
        { id: "all", label: "Todos", count: appointments.length },
        { id: "confirmed", label: "Confirmados", count: appointments.filter(a => a.status === "confirmed").length },
        { id: "pending", label: "Pendentes", count: appointments.filter(a => a.status === "pending").length },
        { id: "noresponse", label: "Sem resposta", count: appointments.filter(a => a.status === "noresponse").length },
    ];

    const card = { background: "#FFFFFF", border: "1px solid #EDE5D3", borderRadius: "14px" };
    const sTitle = { color: "#A69060", fontWeight: 700, letterSpacing: "0.12em", fontSize: "10px", textTransform: "uppercase" as const };
    const sLink = { color: "#B8960C", fontWeight: 600, fontSize: "11px", display: "flex", alignItems: "center", gap: "2px", cursor: "pointer" };


    return (
        <div className="p-4" style={card}>
            <div className="flex justify-between items-center mb-3">
                <div style={sTitle}>Próximos atendimentos</div>
                <button style={sLink}>Ver agenda <ChevronRight size={13} /></button>
            </div>

            <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
                {filters.map((f) => (
                    <button key={f.id} onClick={() => setActiveFilter(f.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap" style={{ background: activeFilter === f.id ? "#B8960C" : "#FBF5EA", color: activeFilter === f.id ? "#FFFDF7" : "#8A7E60", border: activeFilter === f.id ? "1px solid #B8960C" : "1px solid #EDE5D3", fontSize: "11px", fontWeight: 600 }}>
                        {f.label}<span style={{ background: activeFilter === f.id ? "rgba(255,255,255,0.25)" : "#EDE5D3", color: activeFilter === f.id ? "#FFFDF7" : "#A69060", padding: "1px 6px", borderRadius: "8px", fontSize: "10px", fontWeight: 700 }}>{f.count}</span>
                    </button>
                ))}
            </div>

            <div className="grid items-center gap-2 pb-2" style={{ gridTemplateColumns: "30px 46px 1fr 1fr 52px 64px 56px", borderBottom: "1px solid #F5EDE0" }}>
                {["", "Hora", "Paciente", "Serviço", "Protoc.", "Sala", "Prof."].map((h, i) => (<div key={i} className="font-bold" style={{ color: "#BBA870", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase" }}>{h}</div>))}
            </div>

            {filtered.map((a, i) => {
                const sc = statusConfig[a.status];
                const isU = a.status !== "confirmed";
                const isH = hoveredRow === i;
                return (
                    <div key={i} onMouseEnter={() => setHoveredRow(i)} onMouseLeave={() => setHoveredRow(null)} className="grid items-center gap-2 relative cursor-pointer" style={{ gridTemplateColumns: "30px 46px 1fr 1fr 52px 64px 56px", paddingTop: "10px", paddingBottom: "10px", borderBottom: i < filtered.length - 1 ? "1px solid #F9F4EA" : "none", background: isH ? "#FBF5EA" : "transparent", borderRadius: isH ? "8px" : "0", marginLeft: isH ? "-4px" : "0", marginRight: isH ? "-4px" : "0", paddingLeft: isH ? "4px" : "0", paddingRight: isH ? "4px" : "0", transition: 'all 0.15s ease' }}>
                        <div className="flex justify-center" style={{ color: sc.color }}>{sc.icon}</div>
                        <div className="font-bold" style={{ color: "#B8960C", fontSize: "13px" }}>{a.time}</div>
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: isU ? `${sc.color}10` : "#F5EDE0", border: isU ? `1px solid ${sc.color}20` : "1px solid #EDE5D3" }}><span style={{ fontSize: "9px", fontWeight: 800, color: isU ? sc.color : "#A69060" }}>{a.initials}</span></div>
                            <span className="font-semibold truncate" style={{ color: isU ? "#B8860B" : "#2D2319", fontSize: "12px" }}>{a.name}</span>
                        </div>
                        <div className="truncate" style={{ color: "#8A7E60", fontSize: "12px" }}>{a.service}</div>
                        <span className="px-1.5 py-0.5 rounded font-bold text-center" style={{ background: "#FBF5EA", border: "1px solid #EDE5D3", color: "#B8960C", fontSize: "10px" }}>{a.protocol}</span>
                        <div style={{ color: "#A69060", fontSize: "11px" }}>{a.sala}</div>
                        <div style={{ color: "#A69060", fontSize: "11px", fontWeight: 600 }}>{a.prof}</div>
                        {isU && isH && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10 animate-in fade-in zoom-in duration-200">
                                <button onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:brightness-95 transition-all" style={{ background: "#FFFFFF", border: `1px solid ${sc.color}30`, boxShadow: `0 2px 8px ${sc.color}15`, color: sc.color, fontSize: "10px", fontWeight: 700 }}>
                                    <Send size={10} /> Reenviar RSVP
                                </button>
                            </div>
                        )}
                    </div>
                );
            })}

            <div className="flex gap-5 mt-3 pt-3 flex-wrap" style={{ borderTop: "1px solid #F5EDE0" }}>
                {Object.entries(statusConfig).map(([k, v]) => (<div key={k} className="flex items-center gap-1.5" style={{ color: v.color }}>{v.icon}<span style={{ color: "#A69060", fontSize: "10px", fontWeight: 500 }}>{v.label}</span></div>))}
            </div>
        </div>
    );
}
