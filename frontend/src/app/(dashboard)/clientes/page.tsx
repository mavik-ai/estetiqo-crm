import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { UserCircle2 } from "lucide-react";
import { ClientesTable } from "@/components/clientes/ClientesTable";

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

    // Busca clientes com búsqueda de último e próximo agendamento em uma única query via RPC
    let query = supabase
        .from("clients")
        .select(`
            id, name, phone, birth_date, rating,
            last_appointment:appointments!client_id(starts_at)
        `)
        .eq("tenant_id", tenantId)
        .order("name");

    if (q && q.trim() !== "") {
        query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%`);
    }

    // Busca principal de clientes
    const { data: rawClients } = await query;

    // Busca último e próximo agendamento por cliente via SQL direto
    const { data: appointmentStats } = await supabase
        .rpc("get_client_appointment_stats", { p_tenant_id: tenantId });

    // Mapear as stats por client_id para lookup O(1)
    const statsMap = new Map<string, { last_appointment: string | null; next_appointment: string | null }>();
    if (appointmentStats) {
        for (const row of appointmentStats) {
            statsMap.set(row.client_id, {
                last_appointment: row.last_appointment,
                next_appointment: row.next_appointment,
            });
        }
    }

    const list = (rawClients ?? []).map((c: any) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        birth_date: c.birth_date,
        rating: c.rating,
        last_appointment: statsMap.get(c.id)?.last_appointment ?? null,
        next_appointment: statsMap.get(c.id)?.next_appointment ?? null,
    }));

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
                        Pacientes
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
                    + Nova Paciente
                </Link>
            </div>

            {/* Search */}
            <form method="GET" style={{ marginBottom: "16px" }}>
                <div style={{ position: "relative", maxWidth: "420px" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#BBA870" strokeWidth="2" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    </svg>
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
                        <p style={{ margin: 0 }}>Nenhuma paciente encontrada.</p>
                    </div>
                ) : (
                    <ClientesTable clients={list} />
                )}
            </div>
        </div>
    );
}
