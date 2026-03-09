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

    // Bloqueia acesso ao dashboard até o usuário definir sua senha pessoal
    const { data: profile } = await supabase
        .from('users')
        .select('must_change_password')
        .eq('id', user.id)
        .single();
    if (profile?.must_change_password) {
        redirect('/primeiro-acesso');
    }

    return (
        <div className="min-h-screen flex" style={{ fontFamily: "var(--font-urbanist), sans-serif", background: "#F6F2EA" }}>
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">
                <Topbar />
                <div className="flex-1 overflow-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}
