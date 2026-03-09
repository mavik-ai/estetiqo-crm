import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

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

    return (
        <div className="min-h-screen flex" style={{ fontFamily: "var(--font-urbanist), sans-serif", background: "#F6F2EA" }}>
            <Sidebar userName={profile?.name ?? firstName} userInitials={initials} userRole={roleLabel} />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">
                <Topbar userName={firstName} />
                <div className="flex-1 overflow-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}
