'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function requestPasswordReset(formData: FormData) {
    const email = formData.get('email') as string

    if (!email) {
        return redirect('/esqueceu-senha?error=Informe o e-mail.')
    }

    const supabase = await createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/redefinir-senha`,
    })

    if (error) {
        return redirect('/esqueceu-senha?error=Erro ao enviar e-mail. Tente novamente.')
    }

    return redirect('/esqueceu-senha?sent=true')
}
