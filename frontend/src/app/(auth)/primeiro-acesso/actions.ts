'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function changePassword(formData: FormData) {
    const newPassword = formData.get('password') as string
    const confirmPassword = formData.get('confirm_password') as string

    if (!newPassword || newPassword.length < 8) {
        return redirect('/primeiro-acesso?error=A senha deve ter no mínimo 8 caracteres.')
    }

    if (newPassword !== confirmPassword) {
        return redirect('/primeiro-acesso?error=As senhas não conferem.')
    }

    const supabase = await createClient()

    // Atualiza a senha no Supabase Auth
    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
        return redirect('/primeiro-acesso?error=Erro ao atualizar senha. Tente novamente.')
    }

    // Busca o usuário logado para saber o role
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        // Marca must_change_password = false no banco
        await supabase
            .from('users')
            .update({ must_change_password: false })
            .eq('id', user.id)

        // Busca o role para redirecionar corretamente
        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role === 'superadmin') {
            return redirect('/admin')
        }
    }

    return redirect('/')
}
