import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import Link from "next/link";

// Calcula se o tenant tem acesso ativo e quantos dias de carência restam
function calcAccess(tenant: {
    subscription_status?: string | null;
    trial_ends_at?: string | null;
    grace_ends_at?: string | null;
    courtesy_days?: number | null;
    courtesy_starts_at?: string | null;
} | null): { allowed: boolean; graceDaysLeft: number | null } {
    if (!tenant) return { allowed: false, graceDaysLeft: null };

    const now = new Date();
    const status = tenant.subscription_status ?? 'trial';

    if (status === 'active') return { allowed: true, graceDaysLeft: null };

    if (status === 'courtesy') {
        if (tenant.courtesy_days === -1) return { allowed: true, graceDaysLeft: null };
        if (tenant.courtesy_days && tenant.courtesy_starts_at) {
            const expiresAt = new Date(tenant.courtesy_starts_at);
            expiresAt.setDate(expiresAt.getDate() + tenant.courtesy_days);
            if (now < expiresAt) return { allowed: true, graceDaysLeft: null };
        }
        return { allowed: false, graceDaysLeft: null };
    }

    if (status === 'trial') {
        if (tenant.trial_ends_at && now < new Date(tenant.trial_ends_at)) return { allowed: true, graceDaysLeft: null };
        return { allowed: false, graceDaysLeft: null };
    }

    if (status === 'grace') {
        if (tenant.grace_ends_at) {
            const graceEnd = new Date(tenant.grace_ends_at);
            if (now < graceEnd) {
                const daysLeft = Math.ceil((graceEnd.getTime() - now.getTime()) / 86400000);
                return { allowed: true, graceDaysLeft: daysLeft };
            }
        }
        return { allowed: false, graceDaysLeft: null };
    }

    return { allowed: false, graceDaysLeft: null };
}

export default async function DashboardLayout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/login');
    }

    const { data: profile } = await supabase
        .from('users')
        .select('must_change_password, name, role, avatar_initials, tenant_id, tenants(name, onboarding_completed_at, subscription_status, trial_ends_at, grace_ends_at, courtesy_days, courtesy_starts_at)')
        .eq('id', user.id)
        .single();

    if (profile?.must_change_password) {
        redirect('/primeiro-acesso');
    }

    const firstName    = (profile?.name ?? '').split(' ')[0] || 'Bem-vinda';
    const nameInitials = (profile?.name ?? '').split(' ').slice(0, 2).map((p: string) => p[0]?.toUpperCase() ?? '').join('');
    const initials     = (profile?.avatar_initials) ?? (nameInitials || '??');
    const roleLabel    = profile?.role === 'superadmin' ? 'Superadmin' : profile?.role === 'admin' ? 'Admin' : 'Operadora';

    // @ts-ignore - nested join type
    const tenantRow  = profile?.tenants as {
        name?: string;
        onboarding_completed_at?: string | null;
        subscription_status?: string | null;
        trial_ends_at?: string | null;
        grace_ends_at?: string | null;
        courtesy_days?: number | null;
        courtesy_starts_at?: string | null;
    } | null;

    const tenantName        = tenantRow?.name ?? '';
    const onboardingPending = !tenantRow?.onboarding_completed_at && profile?.role !== 'operator';
    const tenantId          = profile?.tenant_id;

    // Guard de acesso por assinatura (superadmin nunca é bloqueado)
    if (profile?.role !== 'superadmin' && tenantId) {
        const { allowed } = calcAccess(tenantRow);
        if (!allowed) redirect('/planos');
    }

    const { graceDaysLeft } = calcAccess(tenantRow);

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

                {/* Banner de carência */}
                {graceDaysLeft !== null && (
                    <div style={{
                        background: "#FFFBEB",
                        borderBottom: "1px solid #F59E0B",
                        padding: "10px 24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "12px",
                        flexShrink: 0,
                    }}>
                        <p style={{ fontSize: "13px", color: "#92400E", margin: 0 }}>
                            Seu período de carência termina em <strong>{graceDaysLeft} {graceDaysLeft === 1 ? 'dia' : 'dias'}</strong>. Assine para continuar usando.
                        </p>
                        <Link href="/planos" style={{
                            fontSize: "12px", fontWeight: 700, color: "#92400E",
                            background: "#FEF3C7", border: "1px solid #F59E0B",
                            padding: "5px 14px", borderRadius: "8px", textDecoration: "none", whiteSpace: "nowrap",
                        }}>
                            Ver planos
                        </Link>
                    </div>
                )}

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
