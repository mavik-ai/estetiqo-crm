import { createClient } from "@/utils/supabase/server";
import { Suspense } from "react";
import { SavedToast } from "@/components/ui/SavedToast";
import { ClienteFichaClient } from "./ClienteFichaClient";

export default async function ClienteFichaView({ id, isModal = false }: { id: string, isModal?: boolean }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile } = await supabase
        .from("users")
        .select("tenant_id")
        .eq("id", user!.id)
        .single();

    const tenantId = profile!.tenant_id;

    const [clientRes, healthRes, apptRes, protocolsRes, notesRes] = await Promise.all([
        supabase
            .from("clients")
            .select("*")
            .eq("id", id)
            .eq("tenant_id", tenantId)
            .single(),
        supabase
            .from("health_records")
            .select("*")
            .eq("client_id", id)
            .single(),
        supabase
            .from("appointments")
            .select(
                "id, starts_at, rsvp_status, services(name), protocols(total_sessions, completed_sessions)"
            )
            .eq("client_id", id)
            .eq("tenant_id", tenantId)
            .order("starts_at", { ascending: false })
            .limit(20),
        supabase
            .from("protocols")
            .select("id, status, total_sessions, completed_sessions, created_at, services(name)")
            .eq("client_id", id)
            .eq("tenant_id", tenantId)
            .order("created_at", { ascending: false }),
        supabase
            .from("client_notes")
            .select("id, content, created_at")
            .eq("client_id", id)
            .eq("tenant_id", tenantId)
            .order("created_at", { ascending: false }),
    ]);

    if (!clientRes.data) return (
        <div style={{ padding: "40px", textAlign: "center", fontFamily: "var(--font-urbanist), sans-serif" }}>
            Cliente não encontrada.
        </div>
    );

    return (
        <div
            style={{
                background: isModal ? "transparent" : "var(--background)",
                width: "100%",
                height: isModal ? "100%" : "auto",
            }}
        >
            {!isModal && (
                <Suspense fallback={null}>
                    <SavedToast message="Dados da cliente salvos com sucesso!" />
                </Suspense>
            )}

            <ClienteFichaClient
                id={id}
                isModal={isModal}
                client={clientRes.data}
                health={healthRes.data}
                appointments={apptRes.data ?? []}
                protocols={protocolsRes.data ?? []}
                notes={notesRes.data ?? []}
            />
        </div>
    );
}
