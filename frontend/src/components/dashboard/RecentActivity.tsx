'use client'

import { CheckCircle, Send, FileText, XCircle } from "lucide-react";

const activities = [
    { time: "08:45", text: "Maria Silva confirmou", icon: <CheckCircle size={11} />, color: "#2D8C4E" },
    { time: "08:30", text: "RSVP enviado — Ana Costa", icon: <Send size={11} />, color: "#3A7BD5" },
    { time: "08:15", text: "Protocolo #47 criado", icon: <FileText size={11} />, color: "#B8960C" },
    { time: "07:50", text: "Julia Ramos cancelou 09:30", icon: <XCircle size={11} />, color: "#D94444" },
    { time: "07:30", text: "Carla Melo confirmou", icon: <CheckCircle size={11} />, color: "#2D8C4E" },
    { time: "07:10", text: "Paula Nunes — RSVP enviado", icon: <Send size={11} />, color: "#3A7BD5" },
];

export function RecentActivity() {
    const card = { background: "#FFFFFF", border: "1px solid #EDE5D3", borderRadius: "14px" };
    const sTitle = { color: "#A69060", fontWeight: 700, letterSpacing: "0.12em", fontSize: "10px", textTransform: "uppercase" as const };

    return (
        <div className="p-3.5" style={card}>
            <div style={sTitle} className="mb-2.5">Atividade recente</div>
            {activities.map((a, i) => (
                <div key={i} className="flex items-start gap-2 py-1.5" style={{ borderBottom: i < activities.length - 1 ? "1px solid #F9F4EA" : "none" }}>
                    <div className="rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${a.color}10`, color: a.color, width: "18px", height: "18px" }}>
                        {a.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="truncate" style={{ color: a.color === "#D94444" ? "#D94444" : "#2D2319", fontSize: "11px", fontWeight: a.color === "#D94444" ? 600 : 500 }}>
                            {a.text}
                        </div>
                        <div style={{ color: "#BBA870", fontSize: "9px" }}>{a.time}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
