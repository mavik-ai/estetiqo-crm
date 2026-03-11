'use client'

import { Home, Calendar, Users, FileText, Settings, BarChart3, LogOut, ChevronUp, User, Zap } from "lucide-react";
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

const ALL_NAV_ITEMS = [
    { icon: <Home size={18} />, label: "Dashboard", href: "/", adminOnly: false },
    { icon: <Calendar size={18} />, label: "Agenda", href: "/agenda", adminOnly: false },
    { icon: <Users size={18} />, label: "Pacientes", href: "/clientes", adminOnly: false },
    { icon: <FileText size={18} />, label: "Protocolos", href: "/protocolos", adminOnly: false },
    { icon: <BarChart3 size={18} />, label: "Relatórios", href: "/relatorios", adminOnly: true },
];

interface SidebarProps {
    tenantName?: string;
    userName?: string;
    userInitials?: string;
    userRole?: string;
    userEmail?: string;
    role?: 'admin' | 'operator' | 'superadmin';
    onboardingPending?: boolean;
}

export function Sidebar({ userName = "Michele Oliveira", userInitials = "MO", userRole = "Admin", userEmail = "", tenantName = "", role = "admin", onboardingPending = false }: SidebarProps) {
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

    const isAdmin = role === 'admin' || role === 'superadmin';
    const navItems = ALL_NAV_ITEMS.filter(item => !item.adminOnly || isAdmin);

    const isActive = (href: string) =>
        href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');

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
        <div className="flex flex-col justify-between flex-shrink-0 h-screen overflow-y-auto"
            style={{ width: "220px", background: "var(--sidebar)", borderRight: "1px solid var(--sidebar-border)" }}>
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
                    {tenantName && (
                        <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.15em", color: "#BBA870", textTransform: "uppercase", marginTop: "6px" }}>
                            {tenantName}
                        </div>
                    )}
                </div>
                <div className="px-3">
                    <div style={{ color: "var(--sidebar-primary)", fontSize: "9px", fontWeight: 700, letterSpacing: "0.15em", padding: "0 10px", marginBottom: "6px" }}>MENU</div>
                    {navItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link key={item.href} href={item.href}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 transition-all outline-none"
                                style={{
                                    background: active ? "color-mix(in srgb, var(--sidebar-primary) 10%, transparent)" : "transparent",
                                    border: active ? "1px solid var(--sidebar-border)" : "1px solid transparent",
                                    color: active ? "var(--sidebar-primary)" : "var(--muted-foreground)",
                                }}>
                                <div style={{ opacity: active ? 1 : 0.6 }}>{item.icon}</div>
                                <span style={{ fontSize: "13px", fontWeight: active ? 700 : 500 }}>{item.label}</span>
                                {active && <div className="ml-auto w-1 h-4 rounded-full" style={{ background: "var(--sidebar-primary)" }} />}
                            </Link>
                        );
                    })}
                </div>
            </div>

            <div className="px-3 pb-4">
                <div className="mb-2" style={{ borderTop: "1px solid var(--sidebar-border)" }} />
                {/* Widget de onboarding — apenas admin, enquanto pendente */}
                {isAdmin && onboardingPending && (
                    <Link href="/setup"
                        className="flex items-center gap-2 px-3 py-2.5 rounded-lg mb-2 outline-none"
                        style={{
                            background: "rgba(184,150,12,0.08)",
                            border: "1px solid rgba(184,150,12,0.25)",
                            textDecoration: "none",
                        }}>
                        <Zap size={14} strokeWidth={2.2} style={{ color: "#B8960C", flexShrink: 0 }} />
                        <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: "11px", fontWeight: 700, color: "#B8960C", lineHeight: 1.2 }}>Configuração pendente</div>
                            <div style={{ fontSize: "10px", color: "#A69060", marginTop: "1px" }}>Completar setup da clínica</div>
                        </div>
                    </Link>
                )}

                {/* Configurações — apenas admins */}
                {isAdmin && (
                    <Link href="/config"
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg mb-2 outline-none transition-all"
                        style={{
                            background: isActive('/config') ? "color-mix(in srgb, var(--sidebar-primary) 10%, transparent)" : "transparent",
                            border: isActive('/config') ? "1px solid var(--sidebar-border)" : "1px solid transparent",
                            color: isActive('/config') ? "var(--sidebar-primary)" : "var(--muted-foreground)",
                        }}>
                        <div style={{ opacity: isActive('/config') ? 1 : 0.6 }}><Settings size={18} /></div>
                        <span style={{ fontSize: "13px", fontWeight: isActive('/config') ? 700 : 500 }}>Configurações</span>
                    </Link>
                )}

                {/* User card */}
                <div ref={menuRef} style={{ position: "relative" }}>
                    {menuOpen && (
                        <div style={{
                            position: "absolute", bottom: "calc(100% + 8px)", left: 0, right: 0,
                            background: "var(--popover)", border: "1px solid var(--border)",
                            borderRadius: "14px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                            overflow: "hidden", zIndex: 50,
                        }}>
                            {/* Header */}
                            <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid var(--border)" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #D4B86A, #B8960C)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: "#FFFDF7", flexShrink: 0 }}>
                                        {userInitials}
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--popover-foreground)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userName}</div>
                                        <div style={{ fontSize: "11px", color: "var(--muted-foreground)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userEmail || userRole}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Links */}
                            <div style={{ padding: "6px" }}>
                                {[
                                    { href: "/config/perfil", Icon: User, label: "Meu perfil" },
                                    { href: "/config", Icon: Settings, label: "Configurações" },
                                ].map(({ href, Icon, label }) => (
                                    <Link key={href} href={href} onClick={() => setMenuOpen(false)}
                                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors hover:bg-accent"
                                        style={{ fontSize: "13px", color: "var(--popover-foreground)", textDecoration: "none" }}>
                                        <Icon size={15} strokeWidth={1.8} style={{ color: "var(--muted-foreground)" }} />
                                        {label}
                                    </Link>
                                ))}
                            </div>

                            {/* Sair */}
                            <div style={{ borderTop: "1px solid var(--border)", padding: "6px" }}>
                                <button onClick={handleLogout}
                                    className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg transition-colors hover:bg-destructive/10"
                                    style={{ fontSize: "13px", color: "var(--destructive)", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                                    <LogOut size={15} strokeWidth={1.8} />
                                    Sair
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Trigger */}
                    <button onClick={() => setMenuOpen((v) => !v)}
                        className="w-full rounded-lg p-2.5 flex items-center gap-2.5 transition-all outline-none"
                        style={{
                            background: menuOpen ? "var(--accent)" : "color-mix(in srgb, var(--sidebar-primary) 8%, var(--sidebar))",
                            border: menuOpen ? "1px solid var(--border)" : "1px solid var(--sidebar-border)",
                            cursor: "pointer", fontFamily: "inherit",
                        }}>
                        <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "linear-gradient(135deg, #D4B86A, #B8960C)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#FFFDF7", flexShrink: 0 }}>
                            {userInitials}
                        </div>
                        <div className="min-w-0 flex-1 text-left">
                            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--sidebar-foreground)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userName}</div>
                            <div style={{ fontSize: "10px", color: "var(--muted-foreground)" }}>{userRole}</div>
                        </div>
                        <ChevronUp size={14} strokeWidth={2} style={{ flexShrink: 0, transition: "transform 0.2s", transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)", color: "var(--muted-foreground)" }} />
                    </button>
                </div>
            </div>
        </div>
    );
}
