import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { EquipeClient } from "./EquipeClient";

export default async function EquipePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await supabase
        .from('users')
        .select('tenant_id, role')
        .eq('id', user.id)
        .single();

    if (!profile?.tenant_id || profile.role !== 'admin') {
        redirect('/');
    }

    const { data: members } = await supabase
        .from('users')
        .select('id, name, email, role, active, avatar_initials, must_change_password')
        .eq('tenant_id', profile.tenant_id)
        .order('name');

    return (
        <div style={{ padding: "24px", minHeight: "100%", background: "var(--background)" }}>
            <div style={{ marginBottom: "20px" }}>
                <Link href="/config" style={{
                    display: "inline-flex", alignItems: "center", gap: "4px",
                    fontSize: "13px", color: "var(--muted-foreground)", textDecoration: "none",
                }}>
                    <ChevronLeft size={14} strokeWidth={2} />
                    Configurações
                </Link>
            </div>
            <EquipeClient members={members ?? []} currentUserId={user.id} />
        </div>
    );
}
