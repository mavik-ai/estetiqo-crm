import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/login');
    }

    const { data: profile } = await supabase
        .from('users')
        .select('must_change_password, name, role, avatar_initials')
        .eq('id', user.id)
        .single();

    if (profile?.must_change_password) {
        redirect('/primeiro-acesso');
    }

    const firstName   = (profile?.name ?? '').split(' ')[0] || 'Bem-vinda';
    const nameInitials = (profile?.name ?? '').split(' ').slice(0, 2).map((p: string) => p[0]?.toUpperCase() ?? '').join('');
    const initials    = (profile?.avatar_initials) ?? (nameInitials || '??');
    const roleLabel   = profile?.role === 'superadmin' ? 'Superadmin' : profile?.role === 'admin' ? 'Admin' : 'Operadora';

    const { data: tenantRow } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

    // Busca agendamentos pendentes de RSVP com detalhes para o dropdown
    const { data: pendingAppointments } = await supabase
        .from('appointments')
        .select('id, starts_at, clients(name), services(name)')
        .eq('tenant_id', tenantRow!.tenant_id)
        .eq('rsvp_status', 'pending')
        .gte('starts_at', new Date().toISOString())
        .order('starts_at')
        .limit(5);

    return (
        <div className="min-h-screen flex bg-background" style={{ fontFamily: "var(--font-urbanist), sans-serif" }}>
            <Sidebar userName={profile?.name ?? firstName} userInitials={initials} userRole={roleLabel} userEmail={user.email ?? ''} />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">
                <Topbar
                    userName={firstName}
                    notificationCount={pendingAppointments?.length ?? 0}
                    pendingAppointments={pendingAppointments ?? []}
                />
                <div className="flex-1 overflow-auto">
                    {children}
                </div>
            </div>
            <Toaster
                position="bottom-right"
                toastOptions={{
                    style: {
                        fontFamily: "var(--font-urbanist), sans-serif",
                        fontSize: "14px",
                        borderRadius: "12px",
                        border: "1px solid #EDE5D3",
                    },
                    classNames: {
                        success: "bg-white text-[#2D2319]",
                        error: "bg-white text-[#D94444]",
                    },
                }}
            />
        </div>
    );
}
