import { updateSession } from '@/utils/supabase/middleware'
import { type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    // Passamos o request para o atualizador do Supabase
    // que gerencia o fluxo de bloqueio/redirecionamento de sessão.
    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * Dê match em todos os requests de paths com exceção daqueles iniciando por:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Extensões genéricas não sensíveis ao conteúdo como .svg, .png.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
