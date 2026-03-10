import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Search, UserCircle2 } from "lucide-react";
import { ClientesTable } from "@/components/clientes/ClientesTable";

interface Client {
    id: string;
    name: string;
    phone: string | null;
    birth_date: string | null;
    sex: string | null;
    rating: number | null;
}

export default async function ClientesPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const { q } = await searchParams;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

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
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "14px",
    };

    return (
        <div style={{ padding: "24px", minHeight: "100%", background: "var(--background)", fontFamily: "var(--font-urbanist), sans-serif" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                    <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 700, color: "var(--foreground)", margin: 0, lineHeight: 1.2 }}>
                        Clientes
                    </h1>
                    <p style={{ color: "var(--muted-foreground)", fontSize: "13px", margin: "4px 0 0" }}>
                        {list.length} paciente{list.length !== 1 ? "s" : ""} cadastrada{list.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <Link
                    href="/clientes/novo"
                    style={{
                        display: "inline-flex", alignItems: "center", gap: "6px",
                        background: "linear-gradient(135deg, #D4B86A, #B8960C)",
                        color: "#161412", fontWeight: 700, fontSize: "13px",
                        padding: "9px 18px", borderRadius: "9px",
                        textDecoration: "none", letterSpacing: "0.01em",
                    }}
                >
                    + Nova Cliente
                </Link>
            </div>

            {/* Search */}
            <form method="GET" style={{ marginBottom: "16px" }}>
                <div style={{ position: "relative", maxWidth: "420px" }}>
                    <Search size={15} strokeWidth={1.8} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#BBA870", pointerEvents: "none" }} />
                    <input
                        type="text" name="q" defaultValue={q ?? ""}
                        placeholder="Buscar por nome ou telefone..."
                        style={{
                            width: "100%", paddingLeft: "36px", paddingRight: "14px",
                            paddingTop: "9px", paddingBottom: "9px",
                            background: "var(--card)", border: "1px solid var(--border)",
                            borderRadius: "9px", fontSize: "13px", color: "var(--foreground)",
                            outline: "none", fontFamily: "var(--font-urbanist), sans-serif", boxSizing: "border-box",
                        }}
                    />
                </div>
            </form>

            {/* Table card */}
            <div style={{ ...card, overflowX: "auto" }}>
                {list.length === 0 ? (
                    <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--muted-foreground)", fontSize: "14px" }}>
                        <UserCircle2 size={40} strokeWidth={1.2} style={{ color: "#EDE5D3", marginBottom: "10px" }} />
                        <p style={{ margin: 0 }}>Nenhuma cliente encontrada.</p>
                    </div>
                ) : (
                    <ClientesTable clients={list} />
                )}
            </div>
        </div>
    );
}
