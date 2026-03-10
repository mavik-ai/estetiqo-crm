'use client'

import { useState, useRef, useEffect, useTransition } from "react";
import { Send } from "lucide-react";
import { marcarNoShow, cancelarAgendamento, confirmarRSVPAdmin } from "@/app/(dashboard)/agenda/agendaActions";

interface AppointmentActionsProps {
    appointmentId: string;
    rsvpStatus: string;
    noShow: boolean;
}

export function AppointmentActions({ appointmentId, rsvpStatus, noShow }: AppointmentActionsProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [feedback, setFeedback] = useState<string | null>(null);
    const ref = useRef<HTMLDivElement>(null);

    // Fecha o dropdown ao clicar fora
    useEffect(() => {
        function handler(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    function handleAction(fn: () => Promise<{ error?: string }>, successMsg: string) {
        setOpen(false);
        startTransition(async () => {
            const result = await fn();
            if (result.error) {
                setFeedback("Erro: " + result.error);
            } else {
                setFeedback(successMsg);
            }
            setTimeout(() => setFeedback(null), 3000);
        });
    }

    const isConfirmed = rsvpStatus === 'confirmed';
    const isCancelled = rsvpStatus === 'cancelled';

    return (
        <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
            {/* Feedback toast */}
            {feedback && (
                <div style={{
                    position: "fixed",
                    bottom: "24px",
                    right: "24px",
                    background: "#2D2319",
                    color: "#D4B86A",
                    fontSize: "13px",
                    fontWeight: 600,
                    padding: "10px 18px",
                    borderRadius: "10px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
                    zIndex: 9999,
                    fontFamily: "var(--font-urbanist), sans-serif",
                }}>
                    {feedback}
                </div>
            )}

            {/* Botao "..." */}
            <button
                onClick={() => setOpen((prev) => !prev)}
                disabled={isPending}
                title="Acoes"
                style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "7px",
                    border: "1px solid var(--border)",
                    background: open ? "var(--accent)" : "var(--card)",
                    cursor: isPending ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    color: "var(--muted-foreground)",
                    fontWeight: 700,
                    lineHeight: 1,
                    transition: "all 0.15s",
                    opacity: isPending ? 0.5 : 1,
                    letterSpacing: "0.05em",
                }}
            >
                •••
            </button>

            {/* Dropdown */}
            {open && (
                <div style={{
                    position: "absolute",
                    top: "32px",
                    right: 0,
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "10px",
                    boxShadow: "0 8px 24px rgba(45,35,25,0.12)",
                    zIndex: 200,
                    minWidth: "150px",
                    overflow: "hidden",
                    padding: "4px",
                }}>
                    {/* Reenviar RSVP — só para pendentes */}
                    {!isConfirmed && !isCancelled && (
                        <button
                            onClick={() => { setOpen(false); setFeedback("RSVP reenviado!"); setTimeout(() => setFeedback(null), 3000); }}
                            style={{ width: "100%", padding: "8px 12px", background: "none", border: "none", borderRadius: "7px", cursor: "pointer", fontSize: "12px", fontWeight: 600, color: "#3A7BD5", textAlign: "left", display: "flex", alignItems: "center", gap: "8px", fontFamily: "var(--font-urbanist), sans-serif" }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#EEF4FE"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
                        >
                            <Send size={13} strokeWidth={1.8} />
                            Reenviar RSVP
                        </button>
                    )}

                    {/* Confirmar — so aparece se nao estiver confirmado e nao cancelado */}
                    {!isConfirmed && !isCancelled && (
                        <button
                            onClick={() => handleAction(
                                () => confirmarRSVPAdmin(appointmentId),
                                "Agendamento confirmado!"
                            )}
                            style={{ width: "100%", padding: "8px 12px", background: "none", border: "none", borderRadius: "7px", cursor: "pointer", fontSize: "12px", fontWeight: 600, color: "#2D8C4E", textAlign: "left", display: "flex", alignItems: "center", gap: "8px", fontFamily: "var(--font-urbanist), sans-serif" }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#F0FBF4"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
                        >
                            <span style={{ fontSize: "14px" }}>✓</span>
                            Confirmar
                        </button>
                    )}

                    {/* No-show — so aparece se nao tiver no_show marcado */}
                    {!noShow && !isCancelled && (
                        <button
                            onClick={() => handleAction(
                                () => marcarNoShow(appointmentId),
                                "No-show registrado."
                            )}
                            style={{
                                width: "100%",
                                padding: "8px 12px",
                                background: "none",
                                border: "none",
                                borderRadius: "7px",
                                cursor: "pointer",
                                fontSize: "12px",
                                fontWeight: 600,
                                color: "#C4880A",
                                textAlign: "left",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                fontFamily: "var(--font-urbanist), sans-serif",
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#FEF7E6"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
                        >
                            <span style={{ fontSize: "14px" }}>✗</span>
                            No-show
                        </button>
                    )}

                    {/* Cancelar — sempre visivel (exceto se ja cancelado) */}
                    {!isCancelled && (
                        <button
                            onClick={() => handleAction(
                                () => cancelarAgendamento(appointmentId),
                                "Agendamento cancelado."
                            )}
                            style={{
                                width: "100%",
                                padding: "8px 12px",
                                background: "none",
                                border: "none",
                                borderRadius: "7px",
                                cursor: "pointer",
                                fontSize: "12px",
                                fontWeight: 600,
                                color: "#D94444",
                                textAlign: "left",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                fontFamily: "var(--font-urbanist), sans-serif",
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#FDF2F2"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
                        >
                            <span style={{ fontSize: "14px" }}>⊘</span>
                            Cancelar
                        </button>
                    )}

                    {/* Se ja cancelado, mostra mensagem */}
                    {isCancelled && (
                        <div style={{
                            padding: "8px 12px",
                            fontSize: "12px",
                            color: "#BBA870",
                            fontStyle: "italic",
                        }}>
                            Ja cancelado
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
