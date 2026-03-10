'use client'

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, Pencil, Trash2, X, ChevronRight } from "lucide-react";
import { excluirCliente } from "@/app/(dashboard)/clientes/actions";

interface Client {
    id: string;
    name: string;
    phone: string | null;
    birth_date: string | null;
    sex: string | null;
    rating: number | null;
}

function calcularIdade(birth_date: string | null): string {
    if (!birth_date) return "—";
    const age = Math.floor(
        (Date.now() - new Date(birth_date).getTime()) / (365.25 * 24 * 3600 * 1000)
    );
    return `${age} anos`;
}

function getInitials(name: string): string {
    return name.split(" ").slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
}

function StarRating({ rating }: { rating: number | null }) {
    const value = rating ?? 1;
    return (
        <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
            {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={13} strokeWidth={1.5} style={{ fill: i <= value ? "#B8960C" : "#EDE5D3", color: i <= value ? "#B8960C" : "#EDE5D3" }} />
            ))}
        </div>
    );
}

interface ClientActionModalProps {
    client: Client;
    onClose: () => void;
}

function ClientActionModal({ client, onClose }: ClientActionModalProps) {
    const router = useRouter();
    const [confirming, setConfirming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    function handleDelete() {
        startTransition(async () => {
            const result = await excluirCliente(client.id);
            if (result.error) {
                setError(result.error);
                setConfirming(false);
            } else {
                onClose();
                router.refresh();
            }
        });
    }

    const initials = getInitials(client.name);

    return (
        <div
            style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(29,20,10,0.4)" }}
            onClick={onClose}
        >
            <div
                style={{
                    background: "var(--card)", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: "480px",
                    padding: "20px", boxShadow: "0 -8px 32px rgba(0,0,0,0.12)",
                    fontFamily: "var(--font-urbanist), sans-serif",
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Handle */}
                <div style={{ width: "36px", height: "4px", borderRadius: "2px", background: "#EDE5D3", margin: "0 auto 16px" }} />

                {/* Avatar + nome */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                    <div style={{
                        width: "44px", height: "44px", borderRadius: "50%",
                        background: "linear-gradient(135deg, #D4B86A, #B8960C)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#FFFDF7", fontSize: "14px", fontWeight: 700, flexShrink: 0,
                    }}>
                        {initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--foreground)" }}>{client.name}</div>
                        <div style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                            {client.phone ?? "Sem telefone"} · {calcularIdade(client.birth_date)}
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: "4px" }}>
                        <X size={18} strokeWidth={1.8} />
                    </button>
                </div>

                {/* Ações */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <Link
                        href={`/clientes/${client.id}`}
                        style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "12px 16px", borderRadius: "12px",
                            border: "1px solid var(--border)", background: "var(--muted)",
                            textDecoration: "none", color: "var(--foreground)",
                        }}
                    >
                        <span style={{ fontSize: "14px", fontWeight: 600 }}>Ver ficha completa</span>
                        <ChevronRight size={16} strokeWidth={1.8} style={{ color: "var(--muted-foreground)" }} />
                    </Link>

                    <Link
                        href={`/clientes/${client.id}/editar`}
                        style={{
                            display: "flex", alignItems: "center", gap: "10px",
                            padding: "12px 16px", borderRadius: "12px",
                            border: "1px solid var(--border)", background: "var(--card)",
                            textDecoration: "none", color: "var(--foreground)",
                        }}
                    >
                        <Pencil size={16} strokeWidth={1.8} style={{ color: "#B8960C" }} />
                        <span style={{ fontSize: "14px", fontWeight: 600 }}>Editar dados</span>
                    </Link>

                    {error && (
                        <div style={{ padding: "10px 14px", borderRadius: "10px", background: "rgba(217,68,68,0.07)", border: "1px solid rgba(217,68,68,0.2)", fontSize: "12px", color: "#D94444" }}>
                            {error}
                        </div>
                    )}

                    {confirming ? (
                        <div style={{ display: "flex", gap: "8px" }}>
                            <button
                                onClick={handleDelete}
                                disabled={isPending}
                                style={{
                                    flex: 1, padding: "12px", borderRadius: "12px", border: "1px solid rgba(217,68,68,0.35)",
                                    background: "rgba(217,68,68,0.1)", color: "#D94444", fontSize: "14px", fontWeight: 700,
                                    cursor: isPending ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: isPending ? 0.6 : 1,
                                }}
                            >
                                {isPending ? "Excluindo..." : "Confirmar exclusão"}
                            </button>
                            <button
                                onClick={() => setConfirming(false)}
                                style={{
                                    padding: "12px 20px", borderRadius: "12px", border: "1px solid var(--border)",
                                    background: "var(--card)", color: "var(--muted-foreground)", fontSize: "14px", fontWeight: 600,
                                    cursor: "pointer", fontFamily: "inherit",
                                }}
                            >
                                Cancelar
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setConfirming(true)}
                            style={{
                                display: "flex", alignItems: "center", gap: "10px",
                                padding: "12px 16px", borderRadius: "12px", width: "100%",
                                border: "1px solid rgba(217,68,68,0.2)", background: "rgba(217,68,68,0.04)",
                                cursor: "pointer", fontFamily: "inherit", color: "#D94444",
                            }}
                        >
                            <Trash2 size={16} strokeWidth={1.8} />
                            <span style={{ fontSize: "14px", fontWeight: 600 }}>Excluir cliente</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export function ClientesTable({ clients }: { clients: Client[] }) {
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    if (clients.length === 0) return null;

    return (
        <>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr>
                        {["Nome", "Telefone", "Idade", "Potencial"].map((col) => (
                            <th key={col} style={{
                                padding: "10px 16px", textAlign: "left",
                                fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em",
                                textTransform: "uppercase", color: "#BBA870",
                                borderBottom: "1px solid var(--border)", whiteSpace: "nowrap",
                            }}>
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {clients.map((client, index) => {
                        const initials = getInitials(client.name);
                        return (
                            <tr
                                key={client.id}
                                onClick={() => setSelectedClient(client)}
                                style={{
                                    borderBottom: index < clients.length - 1 ? "1px solid #F3EDE0" : "none",
                                    cursor: "pointer",
                                    transition: "background 0.1s",
                                }}
                                onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "#FBF5EA"}
                                onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}
                            >
                                <td style={{ padding: "12px 16px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <div style={{
                                            width: "34px", height: "34px", borderRadius: "50%", flexShrink: 0,
                                            background: "linear-gradient(135deg, #D4B86A, #B8960C)",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            color: "#FFFDF7", fontSize: "12px", fontWeight: 700, letterSpacing: "0.02em",
                                        }}>
                                            {initials}
                                        </div>
                                        <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--foreground)" }}>
                                            {client.name}
                                        </span>
                                    </div>
                                </td>
                                <td style={{ padding: "12px 16px", fontSize: "13px", color: "var(--muted-foreground)" }}>
                                    {client.phone ?? "—"}
                                </td>
                                <td style={{ padding: "12px 16px", fontSize: "13px", color: "var(--muted-foreground)" }}>
                                    {calcularIdade(client.birth_date)}
                                </td>
                                <td style={{ padding: "12px 16px" }}>
                                    <StarRating rating={client.rating} />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {selectedClient && (
                <ClientActionModal
                    client={selectedClient}
                    onClose={() => setSelectedClient(null)}
                />
            )}
        </>
    );
}
