import { requestPasswordReset } from './actions'
import { AlertCircle, ArrowLeft, MailCheck } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default async function EsqueceuSenhaPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string; sent?: string }>
}) {
    const params = await searchParams
    const errorMessage = params.error
    const sent = params.sent === 'true'

    return (
        <div className="w-full max-w-sm px-4">
            {/* Logo */}
            <div className="flex items-center justify-center mb-8">
                <Image src="/logo-dark.png" alt="Estetiqo" width={200} height={56} priority className="h-12 w-auto" />
            </div>

            <div
                className="rounded-2xl p-8"
                style={{ background: "#1C1A17", border: "1px solid #33301F", boxShadow: "0 8px 40px rgba(0,0,0,0.4)" }}
            >
                {sent ? (
                    /* Estado: e-mail enviado */
                    <div className="flex flex-col items-center text-center gap-4">
                        <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center"
                            style={{ background: "rgba(110,231,160,0.1)", color: "#6EE7A0" }}
                        >
                            <MailCheck size={26} />
                        </div>
                        <div>
                            <h1
                                className="text-xl font-semibold mb-2"
                                style={{ fontFamily: "'Playfair Display', serif", color: "#FFFFFF" }}
                            >
                                Verifique seu e-mail
                            </h1>
                            <p className="text-sm leading-relaxed" style={{ color: "#9A8E70" }}>
                                Enviamos um link de redefinição para o seu e-mail. Verifique a caixa de entrada e a pasta de spam.
                            </p>
                        </div>
                        <Link
                            href="/login"
                            className="text-sm font-semibold mt-2 hover:underline"
                            style={{ color: "#D4B86A" }}
                        >
                            Voltar para o login
                        </Link>
                    </div>
                ) : (
                    /* Estado: formulário */
                    <>
                        <div className="mb-6">
                            <h1
                                className="text-xl font-semibold mb-1"
                                style={{ fontFamily: "'Playfair Display', serif", color: "#FFFFFF" }}
                            >
                                Recuperar senha
                            </h1>
                            <p className="text-sm" style={{ color: "#9A8E70" }}>
                                Informe o e-mail da sua conta e enviaremos um link para criar uma nova senha.
                            </p>
                        </div>

                        {errorMessage && (
                            <div
                                className="flex items-center gap-2.5 rounded-lg px-3.5 py-3 mb-5 text-sm"
                                style={{ background: "rgba(240,112,112,0.1)", border: "1px solid rgba(240,112,112,0.25)", color: "#F07070" }}
                            >
                                <AlertCircle size={15} className="flex-shrink-0" />
                                <span>{errorMessage}</span>
                            </div>
                        )}

                        <form action={requestPasswordReset} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label
                                    htmlFor="email"
                                    className="text-xs font-semibold uppercase tracking-wider"
                                    style={{ color: "#9A8E70" }}
                                >
                                    E-mail
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    placeholder="seu@email.com.br"
                                    className="input-estetiqo-dark w-full rounded-xl px-4 py-3 text-sm transition-all"
                                    style={{ background: "#252219", border: "1px solid #33301F", color: "#FFFFFF" }}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full rounded-xl py-3 text-sm font-bold transition-all active:scale-[0.98]"
                                style={{
                                    background: "linear-gradient(135deg, #D4B86A, #B8960C)",
                                    color: "#161412",
                                    boxShadow: "0 3px 16px rgba(184,150,12,0.35)",
                                    minHeight: "44px",
                                }}
                            >
                                Enviar link de recuperação
                            </button>
                        </form>

                        <div className="mt-5 flex justify-center">
                            <Link
                                href="/login"
                                className="flex items-center gap-1.5 text-sm font-medium hover:underline"
                                style={{ color: "#9A8E70" }}
                            >
                                <ArrowLeft size={14} />
                                Voltar para o login
                            </Link>
                        </div>
                    </>
                )}
            </div>

            <p className="text-center text-xs mt-6" style={{ color: "#3A3527" }}>
                Estetiqo CRM © 2026 — MAVIK AI Solutions
            </p>
        </div>
    )
}
