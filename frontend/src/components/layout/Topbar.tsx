'use client'

import { Bell, Plus } from "lucide-react";
import Link from "next/link";

const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
};

interface TopbarProps {
    userName: string;
    notificationCount?: number;
}

export function Topbar({ userName, notificationCount = 0 }: TopbarProps) {
    return (
        <div className="flex justify-between items-center px-6 py-4 flex-shrink-0" style={{ background: "#FEFCF7", borderBottom: "1px solid #EDE5D3" }}>
            <div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, color: "#2D2319", fontSize: "22px" }}>
                    {getGreeting()}, {userName}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#B8960C" }} />
                    <span style={{ color: "#A69060", fontSize: "12px" }} className="capitalize">
                        {new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' }).format(new Date())}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Link
                    href="/agenda/novo"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                    style={{ background: "linear-gradient(135deg, #D4B86A, #B8960C)", color: "#FFFDF7", boxShadow: "0 3px 12px rgba(184,150,12,0.25)", fontSize: "12px", fontWeight: 700, textDecoration: "none" }}
                >
                    <Plus size={15} strokeWidth={2.5} /> Novo agendamento
                </Link>
                <Link
                    href="/agenda?rsvp=pending"
                    className="relative w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-[#F5EDE0]"
                    style={{ background: "#FFFFFF", border: "1px solid #EDE5D3" }}
                    title={notificationCount > 0 ? `${notificationCount} confirmações pendentes` : "Notificações"}
                >
                    <Bell size={18} style={{ color: "#B8960C" }} />
                    {notificationCount > 0 && (
                        <div
                            className="absolute -top-0.5 -right-0.5 rounded-full flex items-center justify-center border-2 border-[#FEFCF7]"
                            style={{ background: "#EF4444", width: "18px", height: "18px", boxShadow: "0 2px 6px rgba(239,68,68,0.4)" }}
                        >
                            <span className="text-white font-bold" style={{ fontSize: "9px" }}>{notificationCount > 9 ? "9+" : notificationCount}</span>
                        </div>
                    )}
                </Link>
            </div>
        </div>
    );
}
