import { changePassword } from './actions'
import { AlertCircle, ShieldCheck } from 'lucide-react'
import Image from 'next/image'

export default async function PrimeiroAcessoPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const params = await searchParams
    const errorMessage = params.error

    return (
        <div className="w-full max-w-sm px-4">
            {/* Logo */}
            <div className="flex items-center justify-center mb-8">
                <Image
                    src="/logo.png"
                    alt="Estetiqo"
                    width={200}
                    height={56}
                    priority
                    className="h-12 w-auto"
                />
            </div>

            {/* Card */}
            <div
                className="rounded-2xl p-8"
                style={{ background: "#FFFFFF", border: "1px solid #EDE5D3", boxShadow: "0 4px 24px rgba(45,35,25,0.06)" }}
            >
                {/* Ícone de segurança */}
                <div className="flex items-center justify-center mb-5">
                    <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: "rgba(184,150,12,0.1)", color: "#B8960C" }}
                    >
                        <ShieldCheck size={22} />
                    </div>
                </div>

                <div className="mb-6 text-center">
                    <h1
                        className="text-xl font-semibold mb-2"
                        style={{ fontFamily: "'Playfair Display', serif", color: "#2D2319" }}
                    >
                        Defina sua nova senha
                    </h1>
                    <p className="text-sm leading-relaxed" style={{ color: "#A69060" }}>
                        Por segurança, é necessário criar uma senha pessoal antes de continuar.
                    </p>
                </div>

                {/* Mensagem de erro */}
                {errorMessage && (
                    <div
                        className="flex items-center gap-2.5 rounded-lg px-3.5 py-3 mb-5 text-sm"
                        style={{ background: "rgba(217,68,68,0.08)", border: "1px solid rgba(217,68,68,0.2)", color: "#D94444" }}
                    >
                        <AlertCircle size={15} className="flex-shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                )}

                <form action={changePassword} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="password"
                            className="text-xs font-semibold uppercase tracking-wider"
                            style={{ color: "#A69060" }}
                        >
                            Nova senha
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            minLength={8}
                            placeholder="Mínimo 8 caracteres"
                            className="input-estetiqo w-full rounded-xl px-4 py-3 text-sm transition-all"
                            style={{ background: "#F6F2EA", border: "1px solid #EDE5D3", color: "#2D2319" }}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="confirm_password"
                            className="text-xs font-semibold uppercase tracking-wider"
                            style={{ color: "#A69060" }}
                        >
                            Confirmar nova senha
                        </label>
                        <input
                            id="confirm_password"
                            name="confirm_password"
                            type="password"
                            required
                            minLength={8}
                            placeholder="Repita a nova senha"
                            className="input-estetiqo w-full rounded-xl px-4 py-3 text-sm transition-all"
                            style={{ background: "#F6F2EA", border: "1px solid #EDE5D3", color: "#2D2319" }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-xl py-3 text-sm font-bold mt-2 transition-all active:scale-[0.98]"
                        style={{
                            background: "linear-gradient(135deg, #D4B86A, #B8960C)",
                            color: "#FFFDF7",
                            boxShadow: "0 3px 12px rgba(184,150,12,0.3)",
                            minHeight: "44px",
                        }}
                    >
                        Salvar e continuar
                    </button>
                </form>
            </div>

            <p className="text-center text-xs mt-6" style={{ color: "#BBA870" }}>
                Estetiqo CRM © 2026 — MAVIK AI Solutions
            </p>
        </div>
    )
}
