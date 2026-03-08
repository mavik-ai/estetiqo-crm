'use client'

import { Calendar, CalendarClock, CalendarOff, TrendingUp, TrendingDown } from "lucide-react";

export function DashboardMetrics() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            {/* 1. Atendimentos hoje — featured */}
            <div className="rounded-xl p-3.5 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #C4A43A, #B8960C)", boxShadow: "0 6px 20px rgba(184,150,12,0.2)" }}>
                <div className="absolute top-0 right-0 w-20 h-20 rounded-full" style={{ background: "rgba(255,255,255,0.1)", transform: "translate(40%, -50%)" }} />
                <div className="flex items-center justify-between mb-1">
                    <div className="uppercase" style={{ color: "rgba(255,255,255,0.7)", fontWeight: 700, letterSpacing: "0.1em", fontSize: "9px" }}>Atendimentos hoje</div>
                    <Calendar size={14} style={{ color: "rgba(255,255,255,0.5)" }} />
                </div>
                <div className="font-extrabold" style={{ color: "#FFFFFF", fontSize: "26px", lineHeight: "1" }}>12</div>
                <div className="mt-1" style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px", fontWeight: 500 }}>3 restantes</div>
            </div>

            {/* 2. Horários vagos */}
            <div className="rounded-xl p-3.5" style={{ background: "#FFFFFF", border: "1px solid #EDE5D3" }}>
                <div className="flex items-center justify-between mb-1">
                    <div className="uppercase" style={{ color: "#A69060", fontWeight: 700, letterSpacing: "0.1em", fontSize: "9px" }}>Horários vagos</div>
                    <CalendarClock size={14} style={{ color: "#C4880A", opacity: 0.5 }} />
                </div>
                <div className="font-extrabold" style={{ color: "#2D2319", fontSize: "26px", lineHeight: "1" }}>3</div>
                <div className="mt-1" style={{ color: "#BBA870", fontSize: "11px", fontWeight: 500 }}>próximo: 13:00</div>
            </div>

            {/* 3. No-shows */}
            <div className="rounded-xl p-3.5" style={{ background: "#FFFFFF", border: "1px solid #EDE5D3" }}>
                <div className="flex items-center justify-between mb-1">
                    <div className="uppercase" style={{ color: "#A69060", fontWeight: 700, letterSpacing: "0.1em", fontSize: "9px" }}>No-shows do mês</div>
                    <CalendarOff size={14} style={{ color: "#2D8C4E", opacity: 0.5 }} />
                </div>
                <div className="font-extrabold" style={{ color: "#2D2319", fontSize: "26px", lineHeight: "1" }}>2</div>
                <div className="mt-1 flex items-center gap-1" style={{ color: "#2D8C4E", fontSize: "11px", fontWeight: 500 }}><TrendingDown size={12} /> -60% vs fev</div>
            </div>

            {/* 4. Faturamento */}
            <div className="rounded-xl p-3.5" style={{ background: "#FFFFFF", border: "1px solid #EDE5D3" }}>
                <div className="flex items-center justify-between mb-1">
                    <div className="uppercase" style={{ color: "#A69060", fontWeight: 700, letterSpacing: "0.1em", fontSize: "9px" }}>Faturamento do mês</div>
                    <TrendingUp size={14} style={{ color: "#2D8C4E", opacity: 0.5 }} />
                </div>
                <div className="font-extrabold" style={{ color: "#2D2319", fontSize: "26px", lineHeight: "1" }}>R$4.820</div>
                <div className="mt-1 flex items-center gap-1" style={{ color: "#2D8C4E", fontSize: "11px", fontWeight: 500 }}><TrendingUp size={12} /> +12% · 72% da meta</div>
            </div>
        </div>
    );
}
