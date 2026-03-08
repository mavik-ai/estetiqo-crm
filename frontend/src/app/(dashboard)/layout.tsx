import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    // // Autenticação bloqueando a Rota Global (descomente em breve)
    // const supabase = await createClient();
    // const { data: { user } } = await supabase.auth.getUser();
    // if (!user) {
    //     redirect('/login');
    // }

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
