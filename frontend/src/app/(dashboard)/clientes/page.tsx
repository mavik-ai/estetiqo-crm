import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Search, Star, UserCircle2 } from "lucide-react";

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
    return name
        .split(" ")
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() ?? "")
        .join("");
}

function StarRating({ rating }: { rating: number | null }) {
    const value = rating ?? 0;
    return (
        <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    size={13}
                    strokeWidth={1.5}
                    style={{
                        fill: i <= value ? "#B8960C" : "#EDE5D3",
                        color: i <= value ? "#B8960C" : "#EDE5D3",
                    }}
                />
            ))}
        </div>
    );
}

export default async function ClientesPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const { q } = await searchParams;

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data: profile } = await supabase
        .from("users")
        .select("tenant_id")
        .eq("id", user!.id)
        .single();

    const tenantId = profile!.tenant_id;

    let query = supabase
        .from("clients")
        .select("id, name, phone, birth_date, sex, rating")
        .eq("tenant_id", tenantId)
        .order("name");

    if (q && q.trim() !== "") {
        query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%`);
    }

    const { data: clients } = await query;
    const list: Client[] = clients ?? [];

    const card = {
        background: "#FFFFFF",
        border: "1px solid #EDE5D3",
        borderRadius: "14px",
    };

    return (
        <div
            style={{
                padding: "24px",
                minHeight: "100%",
                background: "#F6F2EA",
                fontFamily: "var(--font-urbanist), sans-serif",
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: "20px",
                    flexWrap: "wrap",
                    gap: "12px",
                }}
            >
                <div>
                    <h1
                        style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "22px",
                            fontWeight: 700,
                            color: "#2D2319",
                            margin: 0,
                            lineHeight: 1.2,
                        }}
                    >
                        Clientes
                    </h1>
                    <p style={{ color: "#A69060", fontSize: "13px", margin: "4px 0 0" }}>
                        {list.length} paciente{list.length !== 1 ? "s" : ""} cadastrada{list.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <Link
                    href="/clientes/novo"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "linear-gradient(135deg, #D4B86A, #B8960C)",
                        color: "#161412",
                        fontWeight: 700,
                        fontSize: "13px",
                        padding: "9px 18px",
                        borderRadius: "9px",
                        textDecoration: "none",
                        letterSpacing: "0.01em",
                    }}
                >
                    + Nova Cliente
                </Link>
            </div>

            {/* Search */}
            <form method="GET" style={{ marginBottom: "16px" }}>
                <div style={{ position: "relative", maxWidth: "420px" }}>
                    <Search
                        size={15}
                        strokeWidth={1.8}
                        style={{
                            position: "absolute",
                            left: "12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "#BBA870",
                            pointerEvents: "none",
                        }}
                    />
                    <input
                        type="text"
                        name="q"
                        defaultValue={q ?? ""}
                        placeholder="Buscar por nome ou telefone..."
                        style={{
                            width: "100%",
                            paddingLeft: "36px",
                            paddingRight: "14px",
                            paddingTop: "9px",
                            paddingBottom: "9px",
                            background: "#FFFFFF",
                            border: "1px solid #EDE5D3",
                            borderRadius: "9px",
                            fontSize: "13px",
                            color: "#2D2319",
                            outline: "none",
                            fontFamily: "var(--font-urbanist), sans-serif",
                            boxSizing: "border-box",
                        }}
                    />
                </div>
            </form>

            {/* Table card */}
            <style>{`.client-row:hover { background: #FBF5EA; }`}</style>
            <div style={{ ...card, overflowX: "auto" }}>
                {list.length === 0 ? (
                    <div
                        style={{
                            padding: "48px 24px",
                            textAlign: "center",
                            color: "#A69060",
                            fontSize: "14px",
                        }}
                    >
                        <UserCircle2
                            size={40}
                            strokeWidth={1.2}
                            style={{ color: "#EDE5D3", marginBottom: "10px" }}
                        />
                        <p style={{ margin: 0 }}>Nenhuma cliente encontrada.</p>
                    </div>
                ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr>
                                {["Nome", "Telefone", "Idade", "Avaliação"].map(
                                    (col) => (
                                        <th
                                            key={col}
                                            style={{
                                                padding: "10px 16px",
                                                textAlign: "left",
                                                fontSize: "9px",
                                                fontWeight: 700,
                                                letterSpacing: "0.08em",
                                                textTransform: "uppercase",
                                                color: "#BBA870",
                                                borderBottom: "1px solid #EDE5D3",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {col}
                                        </th>
                                    )
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {list.map((client, index) => {
                                const initials = getInitials(client.name);
                                const href = `/clientes/${client.id}`;
                                const cellLink: React.CSSProperties = {
                                    display: "block",
                                    textDecoration: "none",
                                    color: "inherit",
                                };
                                return (
                                    <tr
                                        key={client.id}
                                        className="client-row"
                                        style={{
                                            borderBottom: index < list.length - 1 ? "1px solid #F3EDE0" : "none",
                                        }}
                                    >
                                        {/* Nome */}
                                        <td style={{ padding: 0 }}>
                                            <Link href={href} style={{ ...cellLink, padding: "12px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
                                                <div style={{
                                                    width: "34px", height: "34px", borderRadius: "50%",
                                                    background: "linear-gradient(135deg, #D4B86A, #B8960C)",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    color: "#FFFDF7", fontSize: "12px", fontWeight: 700,
                                                    flexShrink: 0, letterSpacing: "0.02em",
                                                }}>
                                                    {initials}
                                                </div>
                                                <span style={{ fontSize: "14px", fontWeight: 600, color: "#2D2319" }}>
                                                    {client.name}
                                                </span>
                                            </Link>
                                        </td>
                                        {/* Telefone */}
                                        <td style={{ padding: 0 }}>
                                            <Link href={href} style={{ ...cellLink, padding: "12px 16px", fontSize: "13px", color: "#A69060" }}>
                                                {client.phone ?? "—"}
                                            </Link>
                                        </td>
                                        {/* Idade */}
                                        <td style={{ padding: 0 }}>
                                            <Link href={href} style={{ ...cellLink, padding: "12px 16px", fontSize: "13px", color: "#A69060" }}>
                                                {calcularIdade(client.birth_date)}
                                            </Link>
                                        </td>
                                        {/* Avaliação */}
                                        <td style={{ padding: 0 }}>
                                            <Link href={href} style={{ ...cellLink, padding: "12px 16px" }}>
                                                <StarRating rating={client.rating} />
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
