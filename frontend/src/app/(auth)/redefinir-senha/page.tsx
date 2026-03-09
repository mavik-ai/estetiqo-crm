import { redefinePassword } from './actions'
import { AlertCircle, KeyRound } from 'lucide-react'
import Image from 'next/image'
import { PasswordInput } from '@/components/ui/PasswordInput'

export default async function RedefinirSenhaPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const params = await searchParams
    const errorMessage = params.error

    return (
        <div className="w-full max-w-sm px-4">
            <div className="flex items-center justify-center mb-8">
                <Image src="/logo-dark.png" alt="Estetiqo" width={200} height={56} priority className="h-12 w-auto" />
            </div>

            <div
                className="rounded-2xl p-8"
                style={{ background: "#1C1A17", border: "1px solid #33301F", boxShadow: "0 8px 40px rgba(0,0,0,0.4)" }}
            >
                <div className="flex items-center justify-center mb-5">
                    <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: "rgba(212,184,106,0.15)", color: "#D4B86A" }}
                    >
                        <KeyRound size={22} />
                    </div>
                </div>

                <div className="mb-6 text-center">
                    <h1
                        className="text-xl font-semibold mb-2"
                        style={{ fontFamily: "'Playfair Display', serif", color: "#FFFFFF" }}
                    >
                        Nova senha
                    </h1>
                    <p className="text-sm" style={{ color: "#9A8E70" }}>
                        Escolha uma senha segura com no mínimo 8 caracteres.
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

                <form action={redefinePassword} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#9A8E70" }}>
                            Nova senha
                        </label>
                        <PasswordInput id="password" name="password" autoComplete="new-password" minLength={8} placeholder="Mínimo 8 caracteres" required dark />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="confirm_password" className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#9A8E70" }}>
                            Confirmar senha
                        </label>
                        <PasswordInput id="confirm_password" name="confirm_password" autoComplete="new-password" minLength={8} placeholder="Repita a nova senha" required dark />
                    </div>
                    <button
                        type="submit"
                        className="w-full rounded-xl py-3 text-sm font-bold mt-1 transition-all active:scale-[0.98]"
                        style={{
                            background: "linear-gradient(135deg, #D4B86A, #B8960C)",
                            color: "#161412",
                            boxShadow: "0 3px 16px rgba(184,150,12,0.35)",
                            minHeight: "44px",
                        }}
                    >
                        Salvar nova senha
                    </button>
                </form>
            </div>

            <p className="text-center text-xs mt-6" style={{ color: "#3A3527" }}>
                Estetiqo CRM © 2026 — MAVIK AI Solutions
            </p>
        </div>
    )
}
