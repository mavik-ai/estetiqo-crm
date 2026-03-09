import { Resend } from 'resend'

// RESEND_API_KEY será preenchido no .env.local quando disponível
const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({
    to,
    subject,
    html,
}: {
    to: string
    subject: string
    html: string
}) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('[Email] RESEND_API_KEY não configurado — email não enviado:', subject)
        return { success: false, reason: 'RESEND_API_KEY ausente' }
    }

    const { data, error } = await resend.emails.send({
        from: 'Estetiqo <noreply@estetiqo.com.br>',
        to,
        subject,
        html,
    })

    if (error) {
        console.error('[Email] Erro ao enviar:', error)
        return { success: false, error }
    }

    return { success: true, id: data?.id }
}
