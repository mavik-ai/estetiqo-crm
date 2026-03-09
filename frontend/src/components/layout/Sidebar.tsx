'use client'

import { Home, Calendar, Users, FileText, MessageSquare, Monitor, Settings, LogOut, BarChart3, Sparkles } from "lucide-react";
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

const navItems = [
    { icon: <Home size={18} />, label: "Dashboard", href: "/" },
    { icon: <Calendar size={18} />, label: "Agenda", href: "/agenda" },
    { icon: <Users size={18} />, label: "Clientes", href: "/clientes" },
    { icon: <FileText size={18} />, label: "Protocolos", href: "/protocolos" },
    { icon: <MessageSquare size={18} />, label: "RSVP", href: "/rsvp" },
    { icon: <Monitor size={18} />, label: "Serviços", href: "/servicos" },
    { icon: <BarChart3 size={18} />, label: "Relatórios", href: "/relatorios" },
];

interface SidebarProps {
    userName?: string;
    userInitials?: string;
    userRole?: string;
}

export function Sidebar({ userName = "Michele Oliveira", userInitials = "MO", userRole = "Admin" }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const isActive = (href: string) =>
        href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');

    return (
        <div className="flex flex-col justify-between flex-shrink-0 h-screen overflow-y-auto" style={{ width: "220px", background: "#FEFCF7", borderRight: "1px solid #EDE5D3" }}>
            <div>
                <div className="px-5 pt-6 pb-5">
                    <Link href="/" aria-label="Ir para o Dashboard">
                        <Image
                            src="/logo.png"
                            alt="Estetiqo"
                            width={160}
                            height={44}
                            priority
                            className="h-8 w-auto"
                        />
                    </Link>
                </div>
                <div className="px-3">
                    <div style={{ color: "#BBA870", fontSize: "9px", fontWeight: 700, letterSpacing: "0.15em", padding: "0 10px", marginBottom: "6px" }}>MENU</div>
                    {navItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 transition-all outline-none"
                                style={{
                                    background: active ? "linear-gradient(135deg, #FBF5EA, #F8F0E0)" : "transparent",
                                    border: active ? "1px solid #EDE5D3" : "1px solid transparent",
                                    color: active ? "#B8960C" : "#8A7E60",
                                }}
                            >
                                <div style={{ opacity: active ? 1 : 0.5 }}>{item.icon}</div>
                                <span style={{ fontSize: "13px", fontWeight: active ? 700 : 500 }}>{item.label}</span>
                                {active && <div className="ml-auto w-1 h-4 rounded-full" style={{ background: "linear-gradient(180deg, #B8960C, #D4B86A)" }} />}
                            </Link>
                        );
                    })}
                </div>
            </div>

            <div className="px-3 pb-4">
                {/* Primeiros Passos */}
                <Link
                    href="/bem-vindo"
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg mb-2 outline-none transition-all"
                    style={{
                        background: isActive('/bem-vindo') ? "linear-gradient(135deg, #FBF5EA, #F8F0E0)" : "rgba(184,150,12,0.06)",
                        border: isActive('/bem-vindo') ? "1px solid #EDE5D3" : "1px solid rgba(184,150,12,0.15)",
                        color: "#B8960C",
                    }}
                >
                    <Sparkles size={15} strokeWidth={1.5} />
                    <span style={{ fontSize: "12px", fontWeight: 700 }}>Primeiros Passos</span>
                </Link>

                <div className="mb-2" style={{ borderTop: "1px solid #F5EDE0" }} />
                <Link
                    href="/config"
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 outline-none transition-all"
                    style={{
                        background: isActive('/config') ? "linear-gradient(135deg, #FBF5EA, #F8F0E0)" : "transparent",
                        border: isActive('/config') ? "1px solid #EDE5D3" : "1px solid transparent",
                        color: isActive('/config') ? "#B8960C" : "#A69060",
                    }}
                >
                    <div style={{ opacity: isActive('/config') ? 1 : 0.5 }}><Settings size={18} /></div>
                    <span style={{ fontSize: "13px", fontWeight: isActive('/config') ? 700 : 500 }}>Configurações</span>
                </Link>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 outline-none transition-all hover:bg-[rgba(217,68,68,0.05)] hover:text-[#D94444]"
                    style={{ color: "#A69060" }}
                >
                    <div style={{ opacity: 0.5 }}><LogOut size={18} /></div>
                    <span style={{ fontSize: "13px", fontWeight: 500 }}>Sair</span>
                </button>
                <div className="mt-2 rounded-lg p-2.5 flex items-center gap-2.5" style={{ background: "#FBF5EA", border: "1px solid #EDE5D3" }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: "linear-gradient(135deg, #D4B86A, #B8960C)", color: "#FFFDF7" }}>
                        {userInitials}
                    </div>
                    <div className="min-w-0">
                        <div className="font-semibold truncate" style={{ color: "#2D2319", fontSize: "12px" }}>{userName}</div>
                        <div style={{ color: "#BBA870", fontSize: "10px" }}>{userRole}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
