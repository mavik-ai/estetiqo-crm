'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // Obter o cliente Supabase Server 
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        // Para simplificar no PR MVP e retornar o erro à Server Action via URL param. 
        // Uma estratégia sólida é enviar o formStatus se der erro.
        return redirect('/login?message=Could not authenticate user')
    }

    // Com o usuário validado, o cookie já foi salvo na req
    // Agora buscaremos o papel (role) dele na tabela pública de usuários
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile && profile.role === 'superadmin') {
            return redirect('/admin')
        }
    }

    // Se for admin, operator ou qualquer outro role comum de tenant, 
    // será redirecionado pro root '/' (painel da clínica)
    return redirect('/')
}
