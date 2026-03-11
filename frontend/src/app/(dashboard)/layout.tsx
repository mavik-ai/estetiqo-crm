import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";

export default async function DashboardLayout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/login');
    }

    const { data: profile } = await supabase
        .from('users')
        .select('must_change_password, name, role, avatar_initials, tenant_id, tenants(name, onboarding_completed_at)')
        .eq('id', user.id)
        .single();

    if (profile?.must_change_password) {
        redirect('/primeiro-acesso');
    }

    const firstName   = (profile?.name ?? '').split(' ')[0] || 'Bem-vinda';
    const nameInitials = (profile?.name ?? '').split(' ').slice(0, 2).map((p: string) => p[0]?.toUpperCase() ?? '').join('');
    const initials    = (profile?.avatar_initials) ?? (nameInitials || '??');
    const roleLabel   = profile?.role === 'superadmin' ? 'Superadmin' : profile?.role === 'admin' ? 'Admin' : 'Operadora';
    // @ts-ignore - nested join type
    const tenantRow   = profile?.tenants as { name?: string; onboarding_completed_at?: string | null } | null;
    const tenantName  = tenantRow?.name ?? '';
    const onboardingPending = !tenantRow?.onboarding_completed_at && profile?.role !== 'operator';

    const tenantId = profile?.tenant_id;

    // Busca agendamentos pendentes de RSVP com detalhes para o dropdown
    const { data: pendingAppointmentsData } = tenantId ? await supabase
        .from('appointments')
        .select('id, starts_at, clients(name), services(name)')
        .eq('tenant_id', tenantId)
        .eq('rsvp_status', 'pending')
        .gte('starts_at', new Date().toISOString())
        .order('starts_at')
        .limit(5) : { data: [] };

    const pendingAppointments = (pendingAppointmentsData ?? []).map(appt => ({
        id: appt.id,
        starts_at: appt.starts_at,
        clients: Array.isArray(appt.clients) ? appt.clients[0] : appt.clients,
        services: Array.isArray(appt.services) ? appt.services[0] : appt.services
    })) as { id: string; starts_at: string; clients: { name: string } | null; services: { name: string } | null }[];

    return (
        <div className="min-h-screen flex bg-background" style={{ fontFamily: "var(--font-urbanist), sans-serif" }}>
            <Sidebar
                userName={profile?.name ?? firstName}
                userInitials={initials}
                userRole={roleLabel}
                userEmail={user.email ?? ''}
                tenantName={tenantName}
                role={profile?.role as 'admin' | 'operator' | 'superadmin' | undefined}
                onboardingPending={onboardingPending}
            />
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
            {modal}
            <Toaster
                position="bottom-right"
                toastOptions={{
                    style: {
                        fontFamily: "var(--font-urbanist), sans-serif",
                        fontSize: "14px",
                        borderRadius: "12px",
                        border: "1px solid var(--border)",
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
