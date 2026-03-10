'use client'

import { Home, Calendar, Users, FileText, Settings, BarChart3, LogOut, ChevronUp, User } from "lucide-react";
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

const navItems = [
    { icon: <Home size={18} />, label: "Dashboard", href: "/" },
    { icon: <Calendar size={18} />, label: "Agenda", href: "/agenda" },
    { icon: <Users size={18} />, label: "Clientes", href: "/clientes" },
    { icon: <FileText size={18} />, label: "Protocolos", href: "/protocolos" },
    { icon: <BarChart3 size={18} />, label: "Relatórios", href: "/relatorios" },
];

interface SidebarProps {
    userName?: string;
    userInitials?: string;
    userRole?: string;
    userEmail?: string;
}

export function Sidebar({ userName = "Michele Oliveira", userInitials = "MO", userRole = "Admin", userEmail = "" }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleLogout = async () => {
        setMenuOpen(false);
        await supabase.auth.signOut();
        router.push('/login');
    };

    const isActive = (href: string) =>
        href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');

    // Fecha ao clicar fora
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

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
                <div className="mb-2" style={{ borderTop: "1px solid #F5EDE0" }} />
                <Link
                    href="/config"
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg mb-2 outline-none transition-all"
                    style={{
                        background: isActive('/config') ? "linear-gradient(135deg, #FBF5EA, #F8F0E0)" : "transparent",
                        border: isActive('/config') ? "1px solid #EDE5D3" : "1px solid transparent",
                        color: isActive('/config') ? "#B8960C" : "#A69060",
                    }}
                >
                    <div style={{ opacity: isActive('/config') ? 1 : 0.5 }}><Settings size={18} /></div>
                    <span style={{ fontSize: "13px", fontWeight: isActive('/config') ? 700 : 500 }}>Configurações</span>
                </Link>

                {/* User card — clicável, abre popover */}
                <div ref={menuRef} style={{ position: "relative" }}>
                    {/* Popover */}
                    {menuOpen && (
                        <div
                            style={{
                                position: "absolute",
                                bottom: "calc(100% + 8px)",
                                left: 0,
                                right: 0,
                                background: "#FFFFFF",
                                border: "1px solid #EDE5D3",
                                borderRadius: "14px",
                                boxShadow: "0 8px 32px rgba(45,35,25,0.12)",
                                overflow: "hidden",
                                zIndex: 50,
                            }}
                        >
                            {/* Cabeçalho do popover */}
                            <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid #F5EDE0" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <div
                                        style={{
                                            width: "36px", height: "36px", borderRadius: "50%",
                                            background: "linear-gradient(135deg, #D4B86A, #B8960C)",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: "13px", fontWeight: 700, color: "#FFFDF7", flexShrink: 0,
                                        }}
                                    >
                                        {userInitials}
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#2D2319", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {userName}
                                        </div>
                                        <div style={{ fontSize: "11px", color: "#A69060", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {userEmail || userRole}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Itens do menu */}
                            <div style={{ padding: "6px" }}>
                                <Link
                                    href="/config/perfil"
                                    onClick={() => setMenuOpen(false)}
                                    style={{
                                        display: "flex", alignItems: "center", gap: "10px",
                                        padding: "9px 10px", borderRadius: "8px",
                                        fontSize: "13px", color: "#2D2319", textDecoration: "none",
                                        transition: "background 0.1s",
                                    }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#F6F2EA"; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
                                >
                                    <User size={15} strokeWidth={1.8} color="#A69060" />
                                    Meu perfil
                                </Link>
                                <Link
                                    href="/config"
                                    onClick={() => setMenuOpen(false)}
                                    style={{
                                        display: "flex", alignItems: "center", gap: "10px",
                                        padding: "9px 10px", borderRadius: "8px",
                                        fontSize: "13px", color: "#2D2319", textDecoration: "none",
                                        transition: "background 0.1s",
                                    }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#F6F2EA"; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
                                >
                                    <Settings size={15} strokeWidth={1.8} color="#A69060" />
                                    Configurações
                                </Link>
                            </div>

                            {/* Separador + Sair */}
                            <div style={{ borderTop: "1px solid #F5EDE0", padding: "6px" }}>
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        display: "flex", alignItems: "center", gap: "10px",
                                        width: "100%", padding: "9px 10px", borderRadius: "8px",
                                        fontSize: "13px", color: "#D94444", background: "transparent",
                                        border: "none", cursor: "pointer", transition: "background 0.1s",
                                        fontFamily: "inherit",
                                    }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(217,68,68,0.06)"; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                                >
                                    <LogOut size={15} strokeWidth={1.8} />
                                    Sair
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Trigger — user card */}
                    <button
                        onClick={() => setMenuOpen((v) => !v)}
                        className="w-full rounded-lg p-2.5 flex items-center gap-2.5 transition-all outline-none"
                        style={{
                            background: menuOpen ? "#F0EAD9" : "#FBF5EA",
                            border: menuOpen ? "1px solid rgba(184,150,12,0.30)" : "1px solid #EDE5D3",
                            cursor: "pointer",
                            fontFamily: "inherit",
                        }}
                    >
                        <div
                            style={{
                                width: "30px", height: "30px", borderRadius: "50%",
                                background: "linear-gradient(135deg, #D4B86A, #B8960C)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "11px", fontWeight: 700, color: "#FFFDF7", flexShrink: 0,
                            }}
                        >
                            {userInitials}
                        </div>
                        <div className="min-w-0 flex-1 text-left">
                            <div style={{ fontSize: "12px", fontWeight: 600, color: "#2D2319", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {userName}
                            </div>
                            <div style={{ fontSize: "10px", color: "#BBA870" }}>{userRole}</div>
                        </div>
                        <ChevronUp
                            size={14}
                            strokeWidth={2}
                            color="#BBA870"
                            style={{ flexShrink: 0, transition: "transform 0.2s", transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                        />
                    </button>
                </div>
            </div>
        </div>
    );
}
