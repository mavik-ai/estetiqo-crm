'use client'

import { Home, Calendar, Users, FileText, Settings, BarChart3, LogOut, ChevronUp, User, Sun, Moon, Monitor } from "lucide-react";
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useTheme } from 'next-themes';

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
    const [mounted, setMounted] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { theme, setTheme, resolvedTheme } = useTheme();

    useEffect(() => { setMounted(true); }, []);

    const handleLogout = async () => {
        setMenuOpen(false);
        await supabase.auth.signOut();
        router.push('/login');
    };

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
                            src={mounted && resolvedTheme === 'dark' ? '/logo-dark.png' : '/logo.png'}
                            alt="Estetiqo"
                            width={160}
                            height={44}
                            priority
                            className="h-8 w-auto"
                        />
                    </Link>
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

                {/* User card */}
                <div ref={menuRef} style={{ position: "relative" }}>
                    {menuOpen && (
                        <div style={{
                            position: "absolute", bottom: "calc(100% + 8px)", left: 0, right: 0,
                            background: "var(--popover)", border: "1px solid var(--border)",
                            borderRadius: "14px", boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
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

                            {/* Seletor de Tema */}
                            <div style={{ padding: "8px 10px 4px", borderTop: "1px solid var(--border)" }}>
                                <p style={{ fontSize: "10px", fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px" }}>Tema</p>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px" }}>
                                    {[
                                        { value: "light", label: "Claro", Icon: Sun },
                                        { value: "dark", label: "Escuro", Icon: Moon },
                                        { value: "system", label: "Sistema", Icon: Monitor },
                                    ].map(({ value, label, Icon }) => {
                                        const sel = theme === value;
                                        return (
                                            <button key={value} onClick={() => setTheme(value)} style={{
                                                display: "flex", flexDirection: "column", alignItems: "center",
                                                gap: "4px", padding: "7px 4px", borderRadius: "8px",
                                                border: sel ? "1px solid var(--primary)" : "1px solid transparent",
                                                background: sel ? "color-mix(in srgb, var(--primary) 12%, transparent)" : "transparent",
                                                cursor: "pointer", fontFamily: "inherit",
                                            }}>
                                                <Icon size={14} strokeWidth={1.8} style={{ color: sel ? "var(--primary)" : "var(--muted-foreground)" }} />
                                                <span style={{ fontSize: "10px", fontWeight: sel ? 700 : 500, color: sel ? "var(--primary)" : "var(--muted-foreground)" }}>{label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
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
