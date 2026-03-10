'use client'

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { excluirCliente } from "@/app/(dashboard)/clientes/actions";
import { useRouter } from "next/navigation";

interface ExcluirClienteButtonProps {
    clientId: string;
    clientName: string;
}

export function ExcluirClienteButton({ clientId, clientName }: ExcluirClienteButtonProps) {
    const [confirming, setConfirming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    function handleClickDelete(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        setError(null);
        setConfirming(true);
    }

    function handleCancelar(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        setConfirming(false);
        setError(null);
    }

    function handleConfirmar(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        startTransition(async () => {
            const result = await excluirCliente(clientId);
            if (result.error) {
                setError(result.error);
                setConfirming(false);
            } else {
                router.refresh();
            }
        });
    }

    if (error) {
        return (
            <div
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 10px",
                    borderRadius: "7px",
                    background: "rgba(217,68,68,0.08)",
                    border: "1px solid rgba(217,68,68,0.25)",
                    maxWidth: "240px",
                }}
            >
                <span style={{ fontSize: "11px", color: "#D94444", fontWeight: 500, lineHeight: 1.3 }}>
                    {error}
                </span>
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setError(null); }}
                    style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#D94444",
                        fontSize: "14px",
                        lineHeight: 1,
                        padding: "0 2px",
                        flexShrink: 0,
                    }}
                >
                    ×
                </button>
            </div>
        );
    }

    if (confirming) {
        return (
            <div
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
                title={`Excluir ${clientName}`}
            >
                <span style={{ fontSize: "11px", color: "#D94444", fontWeight: 600, whiteSpace: "nowrap" }}>
                    Excluir?
                </span>
                <button
                    onClick={handleConfirmar}
                    disabled={isPending}
                    style={{
                        padding: "4px 9px",
                        borderRadius: "6px",
                        border: "1px solid rgba(217,68,68,0.35)",
                        background: "rgba(217,68,68,0.1)",
                        color: "#D94444",
                        fontSize: "11px",
                        fontWeight: 700,
                        cursor: isPending ? "not-allowed" : "pointer",
                        fontFamily: "var(--font-urbanist), sans-serif",
                        opacity: isPending ? 0.6 : 1,
                        whiteSpace: "nowrap",
                    }}
                >
                    {isPending ? "..." : "Sim"}
                </button>
                <button
                    onClick={handleCancelar}
                    style={{
                        padding: "4px 9px",
                        borderRadius: "6px",
                        border: "1px solid #EDE5D3",
                        background: "#FFFFFF",
                        color: "#A69060",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "var(--font-urbanist), sans-serif",
                        whiteSpace: "nowrap",
                    }}
                >
                    Nao
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={handleClickDelete}
            title={`Excluir ${clientName}`}
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "30px",
                height: "30px",
                borderRadius: "7px",
                border: "1px solid #EDE5D3",
                background: "#FFFFFF",
                cursor: "pointer",
                color: "#D94444",
                transition: "all 0.15s",
                flexShrink: 0,
            }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(217,68,68,0.06)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(217,68,68,0.3)";
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "#FFFFFF";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#EDE5D3";
            }}
        >
            <Trash2 size={13} strokeWidth={1.8} />
        </button>
    );
}
