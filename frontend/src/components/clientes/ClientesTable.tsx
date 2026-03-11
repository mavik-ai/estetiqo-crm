'use client'

import { useRouter } from "next/navigation";


interface Client {
    id: string;
    name: string;
    phone: string | null;
    birth_date: string | null;
    last_appointment: string | null;
    next_appointment: string | null;
}

function formatarAniversario(iso: string | null): string {
    if (!iso) return "—";
    const parts = iso.split("-");
    return `${parts[2]}/${parts[1]}`;
}

function formatarData(iso: string | null): string {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function getInitials(name: string): string {
    return name.split(" ").slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
}

export function ClientesTable({ clients }: { clients: Client[] }) {
    const router = useRouter();

    if (clients.length === 0) return null;

    const thStyle: React.CSSProperties = {
        padding: "10px 14px", textAlign: "left",
        fontSize: "10px", fontWeight: 700, letterSpacing: "0.07em",
        textTransform: "uppercase", color: "#BBA870",
        borderBottom: "1px solid var(--border)", whiteSpace: "nowrap",
    };

    return (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
                <tr>
                    <th style={{ ...thStyle, width: "40px", textAlign: "center" }}>#</th>
                    <th style={thStyle}>Nome</th>
                    <th style={thStyle}>Telefone</th>
                    <th style={thStyle}>Último Atend.</th>
                    <th style={thStyle}>Próximo Atend.</th>
                    <th style={thStyle}>Aniversário</th>
                </tr>
            </thead>
            <tbody>
                {clients.map((client, index) => {
                    const initials = getInitials(client.name);
                    return (
                        <tr
                            key={client.id}
                            onClick={() => router.push("/clientes/" + client.id)}
                            style={{
                                borderBottom: index < clients.length - 1 ? "1px solid #F3EDE0" : "none",
                                cursor: "pointer", transition: "background 0.1s",
                            }}
                            onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "#FBF5EA"}
                            onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}
                        >
                            {/* # */}
                            <td style={{ padding: "12px 14px", textAlign: "center", fontSize: "12px", color: "var(--muted-foreground)", fontWeight: 600 }}>
                                {index + 1}
                            </td>

                            {/* Nome */}
                            <td style={{ padding: "12px 14px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <div style={{
                                        width: "34px", height: "34px", borderRadius: "50%", flexShrink: 0,
                                        background: "linear-gradient(135deg, #D4B86A, #B8960C)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        color: "#FFFDF7", fontSize: "12px", fontWeight: 700,
                                    }}>
                                        {initials}
                                    </div>
                                    <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--foreground)" }}>
                                        {client.name}
                                    </span>
                                </div>
                            </td>

                            {/* Telefone */}
                            <td style={{ padding: "12px 14px", fontSize: "13px", color: "var(--muted-foreground)" }}>
                                {client.phone ?? "—"}
                            </td>

                            {/* Último Atend. */}
                            <td style={{ padding: "12px 14px", fontSize: "13px", color: client.last_appointment ? "var(--foreground)" : "var(--muted-foreground)" }}>
                                {formatarData(client.last_appointment)}
                            </td>

                            {/* Próximo Atend. */}
                            <td style={{ padding: "12px 14px", fontSize: "13px" }}>
                                {client.next_appointment ? (
                                    <span style={{ color: "#2D8C4E", fontWeight: 600 }}>
                                        {formatarData(client.next_appointment)}
                                    </span>
                                ) : (
                                    <span style={{ color: "var(--muted-foreground)" }}>—</span>
                                )}
                            </td>

                            {/* Aniversário */}
                            <td style={{ padding: "12px 14px", fontSize: "13px", color: "var(--muted-foreground)" }}>
                                {formatarAniversario(client.birth_date)}
                            </td>

                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}
