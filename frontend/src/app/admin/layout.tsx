import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import AdminSidebar from './components/AdminSidebar'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    // 1. Validar se tem sessão ativa.
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        redirect('/login?message=Faça login para continuar')
    }

    // 2. Validar Role Exclusivo "SuperAdmin" no banco public.users
    const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || profile.role !== 'superadmin') {
        // Redireciona clínicas normais para o painel delas caso tentem invadir a URL /admin
        redirect('/')
    }

    return (
        <div
            className="flex h-screen overflow-hidden text-[#FFFFFF]"
            style={{ background: '#161412', fontFamily: 'var(--font-urbanist), sans-serif' }}
        >
            <AdminSidebar />
            <main className="flex-1 flex flex-col h-full relative z-0 overflow-y-auto" style={{ background: '#161412' }}>
                {children}
            </main>
        </div>
    )
}
