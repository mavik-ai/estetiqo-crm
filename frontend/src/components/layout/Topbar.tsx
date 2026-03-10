'use client'

import { Bell, Plus, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
};

interface PendingAppointment {
    id: string;
    starts_at: string;
    clients: { name: string } | null;
    services: { name: string } | null;
}

interface TopbarProps {
    userName: string;
    notificationCount?: number;
    pendingAppointments?: PendingAppointment[];
}

function formatNotifDate(iso: string): string {
    const d = new Date(iso);
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit', month: 'short',
        hour: '2-digit', minute: '2-digit',
    }).format(d);
}

export function Topbar({ userName, notificationCount = 0, pendingAppointments = [] }: TopbarProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className="flex justify-between items-center px-6 py-4 flex-shrink-0" style={{ background: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
            <div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, color: "var(--foreground)", fontSize: "22px" }}>
                    {getGreeting()}, {userName}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#B8960C" }} />
                    <span style={{ color: "var(--muted-foreground)", fontSize: "12px" }} className="capitalize">
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

                {/* Bell com dropdown */}
                <div ref={ref} style={{ position: "relative" }}>
                    <button
                        onClick={() => setOpen(v => !v)}
                        className="relative w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-accent"
                        style={{ background: open ? "var(--accent)" : "var(--card)", border: "1px solid var(--border)" }}
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
                    </button>

                    {open && (
                        <div
                            style={{
                                position: "absolute",
                                top: "calc(100% + 8px)",
                                right: 0,
                                width: "320px",
                                background: "var(--card)",
                                border: "1px solid var(--border)",
                                borderRadius: "14px",
                                boxShadow: "0 8px 32px rgba(45,35,25,0.12)",
                                overflow: "hidden",
                                zIndex: 50,
                            }}
                        >
                            {/* Cabeçalho */}
                            <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--foreground)" }}>Confirmações pendentes</span>
                                {notificationCount > 0 && (
                                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#B8960C", background: "rgba(184,150,12,0.08)", padding: "2px 8px", borderRadius: "20px" }}>
                                        {notificationCount}
                                    </span>
                                )}
                            </div>

                            {/* Lista */}
                            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                                {pendingAppointments.length === 0 ? (
                                    <div style={{ padding: "28px 16px", textAlign: "center" }}>
                                        <CheckCircle size={28} strokeWidth={1.2} style={{ color: "#A8D5B5", margin: "0 auto 8px" }} />
                                        <p style={{ fontSize: "13px", color: "var(--muted-foreground)", margin: 0 }}>Tudo em dia! Sem pendências.</p>
                                    </div>
                                ) : (
                                    pendingAppointments.map((appt) => (
                                        <Link
                                            key={appt.id}
                                            href="/rsvp"
                                            onClick={() => setOpen(false)}
                                            style={{ textDecoration: "none" }}
                                        >
                                            <div
                                                style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", transition: "background 0.1s" }}
                                                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "#FBF5EA"; }}
                                                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                                            >
                                                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--foreground)", marginBottom: "3px" }}>
                                                    {appt.clients?.name ?? "Cliente"}
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                    <Clock size={11} strokeWidth={1.5} color="#BBA870" />
                                                    <span style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>
                                                        {formatNotifDate(appt.starts_at)} · {appt.services?.name ?? "Serviço"}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>

                            {/* Rodapé */}
                            {notificationCount > 0 && (
                                <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border)" }}>
                                    <Link
                                        href="/rsvp"
                                        onClick={() => setOpen(false)}
                                        style={{ fontSize: "12px", fontWeight: 600, color: "#B8960C", textDecoration: "none" }}
                                    >
                                        Ver todas as confirmações →
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
