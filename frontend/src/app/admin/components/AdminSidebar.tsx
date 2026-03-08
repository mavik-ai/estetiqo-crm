'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, Users, CreditCard, LogOut } from 'lucide-react'

const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Resumo SaaS' },
    { href: '/admin/clinicas', icon: Users, label: 'Clínicas (Tenants)' },
    { href: '/admin/planos', icon: CreditCard, label: 'Faturamento & Planos' },
]

export default function AdminSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <aside className="w-64 h-screen flex flex-col border-r shrink-0"
            style={{ background: '#1C1A17', borderColor: '#33301F' }}>

            {/* HEADER LOGO */}
            <div className="h-16 flex items-center px-6 border-b" style={{ borderColor: '#33301F' }}>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg"
                        style={{ background: 'linear-gradient(135deg, #D4B86A, #B8960C)' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#161412" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <span className="font-bold text-lg tracking-tight" style={{ color: '#FFFFFF' }}>Estetiqo OS</span>
                </div>
            </div>

            {/* NAV LINKS */}
            <div className="flex-1 py-6 px-4 flex flex-col gap-1 overflow-y-auto">
                <div className="px-2 mb-2 text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: '#9A8E70' }}>
                    Gestão Master
                </div>

                {navItems.map((item) => {
                    const isActive = pathname === item.href

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-semibold text-[13px]"
                            style={{
                                background: isActive ? '#2A2518' : 'transparent',
                                color: isActive ? '#D4B86A' : '#D4C9A8',
                                border: isActive ? '1px solid #33301F' : '1px solid transparent'
                            }}
                        >
                            <item.icon size={18} style={{ opacity: isActive ? 1 : 0.6 }} />
                            {item.label}
                            {isActive && (
                                <div className="ml-auto w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #D4B86A, #B8960C)' }} />
                            )}
                        </Link>
                    )
                })}
            </div>

            {/* FOOTER / LOGOUT */}
            <div className="p-4 border-t" style={{ borderColor: '#33301F' }}>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-semibold text-[13px] hover:bg-[#2A2518]"
                    style={{ color: '#D4C9A8' }}
                >
                    <LogOut size={18} style={{ opacity: 0.6 }} />
                    Sair do Painel
                </button>
            </div>

        </aside>
    )
}
