'use client'

import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { AppointmentTable } from "@/components/dashboard/AppointmentTable";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { PopularServices } from "@/components/dashboard/PopularServices";
import { AlertCircle, ChevronRight } from "lucide-react";

export default function DashboardPage() {
    const card = { background: "#FFFFFF", border: "1px solid #EDE5D3", borderRadius: "14px" };

    return (
        <div className="px-6 py-5 bg-[#F6F2EA] min-h-full">
            {/* 1. BANNER DE ALERTA DINÂMICO (V8) */}
            <div className="rounded-xl px-4 py-2.5 flex items-center gap-3 mb-4 relative overflow-hidden bg-white"
                style={{ ...card, border: "1px solid rgba(196, 136, 10, 0.2)" }}>
                <div className="absolute top-0 left-0 bottom-0 w-1" style={{ background: "#C4880A" }} />
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-[#C4880A10] text-[#C4880A]">
                    <AlertCircle size={14} />
                </div>
                <div className="flex-1 text-[#2D2319] text-[13px] font-medium">
                    2 clientes ainda não confirmaram presença para hoje.
                </div>
                <button className="flex items-center gap-0.5 text-[#C4880A] text-[11px] font-bold hover:underline">
                    Ver pendentes <ChevronRight size={12} />
                </button>
            </div>

            {/* 2. GRADE DE MÉTRICAS */}
            <DashboardMetrics />

            {/* 3. CONTEÚDO PRINCIPAL (3 colunas : 1 coluna) */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Lado Esquerdo: Tabela de Agendamentos (Ocupa 3/4 no LG) */}
                <div className="lg:col-span-3">
                    <AppointmentTable />
                </div>

                {/* Lado Direito: Atividade e Serviços (Ocupa 1/4 no LG) */}
                <div className="flex flex-col gap-4">
                    <RecentActivity />
                    <PopularServices />
                </div>
            </div>
        </div>
    );
}
