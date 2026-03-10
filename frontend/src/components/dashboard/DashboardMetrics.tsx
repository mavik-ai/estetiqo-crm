'use client'

import { Calendar, CalendarClock, CalendarOff, TrendingUp, TrendingDown } from "lucide-react";

export interface DashboardMetricsData {
    atendimentos_hoje: number;
    restantes_hoje: number;
    noshows_mes: number;
    faturamento_mes: number;
}

export function DashboardMetrics({ data }: { data: DashboardMetricsData }) {
    const fmt = (v: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            {/* 1. Atendimentos hoje */}
            <div className="rounded-xl p-3.5 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #C4A43A, #B8960C)", boxShadow: "0 6px 20px rgba(184,150,12,0.2)" }}>
                <div className="absolute top-0 right-0 w-20 h-20 rounded-full" style={{ background: "rgba(255,255,255,0.1)", transform: "translate(40%, -50%)" }} />
                <div className="flex items-center justify-between mb-1">
                    <div className="uppercase" style={{ color: "rgba(255,255,255,0.7)", fontWeight: 700, letterSpacing: "0.1em", fontSize: "9px" }}>Atendimentos hoje</div>
                    <Calendar size={14} style={{ color: "rgba(255,255,255,0.5)" }} />
                </div>
                <div className="font-extrabold" style={{ color: "#FFFFFF", fontSize: "26px", lineHeight: "1" }}>{data.atendimentos_hoje}</div>
                <div className="mt-1" style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px", fontWeight: 500 }}>
                    {data.restantes_hoje} restante{data.restantes_hoje !== 1 ? 's' : ''}
                </div>
            </div>

            {/* 2. Horários vagos */}
            <div className="rounded-xl p-3.5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between mb-1">
                    <div className="uppercase" style={{ color: "var(--muted-foreground)", fontWeight: 700, letterSpacing: "0.1em", fontSize: "9px" }}>Horários vagos</div>
                    <CalendarClock size={14} style={{ color: "#C4880A", opacity: 0.5 }} />
                </div>
                <div className="font-extrabold" style={{ color: "var(--foreground)", fontSize: "26px", lineHeight: "1" }}>
                    {Math.max(0, 8 - data.atendimentos_hoje)}
                </div>
                <div className="mt-1" style={{ color: "#BBA870", fontSize: "11px", fontWeight: 500 }}>de 8 slots disponíveis</div>
            </div>

            {/* 3. No-shows */}
            <div className="rounded-xl p-3.5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between mb-1">
                    <div className="uppercase" style={{ color: "var(--muted-foreground)", fontWeight: 700, letterSpacing: "0.1em", fontSize: "9px" }}>No-shows do mês</div>
                    <CalendarOff size={14} style={{ color: "#D94444", opacity: 0.5 }} />
                </div>
                <div className="font-extrabold" style={{ color: "var(--foreground)", fontSize: "26px", lineHeight: "1" }}>{data.noshows_mes}</div>
                <div className="mt-1 flex items-center gap-1" style={{ color: data.noshows_mes === 0 ? "#2D8C4E" : "#D94444", fontSize: "11px", fontWeight: 500 }}>
                    {data.noshows_mes === 0
                        ? <><TrendingDown size={12} /> Nenhum este mês</>
                        : <><TrendingUp size={12} /> {data.noshows_mes} este mês</>
                    }
                </div>
            </div>

            {/* 4. Faturamento */}
            <div className="rounded-xl p-3.5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between mb-1">
                    <div className="uppercase" style={{ color: "var(--muted-foreground)", fontWeight: 700, letterSpacing: "0.1em", fontSize: "9px" }}>Faturamento do mês</div>
                    <TrendingUp size={14} style={{ color: "#2D8C4E", opacity: 0.5 }} />
                </div>
                <div className="font-extrabold" style={{ color: "var(--foreground)", fontSize: "26px", lineHeight: "1" }}>
                    {fmt(data.faturamento_mes)}
                </div>
                <div className="mt-1 flex items-center gap-1" style={{ color: "#2D8C4E", fontSize: "11px", fontWeight: 500 }}>
                    <TrendingUp size={12} /> mês em andamento
                </div>
            </div>
        </div>
    );
}
