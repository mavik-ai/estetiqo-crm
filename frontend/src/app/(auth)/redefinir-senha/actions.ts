'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function redefinePassword(formData: FormData) {
    const newPassword = formData.get('password') as string
    const confirmPassword = formData.get('confirm_password') as string

    if (!newPassword || newPassword.length < 8) {
        return redirect('/redefinir-senha?error=A senha deve ter no mínimo 8 caracteres.')
    }

    if (newPassword !== confirmPassword) {
        return redirect('/redefinir-senha?error=As senhas não conferem.')
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
        return redirect('/redefinir-senha?error=Erro ao redefinir senha. O link pode ter expirado.')
    }

    return redirect('/login?message=Senha redefinida com sucesso. Faça o login.')
}
