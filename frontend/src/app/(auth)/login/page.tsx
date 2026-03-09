import { login } from './actions'
import { AlertCircle } from 'lucide-react'
import Image from 'next/image'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ message?: string }>
}) {
    const params = await searchParams
    const errorMessage = params.message

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
                <div className="mb-6">
                    <h1
                        className="text-xl font-semibold mb-1"
                        style={{ fontFamily: "'Playfair Display', serif", color: "#2D2319" }}
                    >
                        Bem-vinda de volta
                    </h1>
                    <p className="text-sm" style={{ color: "#A69060" }}>
                        Entre com seu e-mail e senha para continuar.
                    </p>
                </div>

                {/* Mensagem de erro */}
                {errorMessage && (
                    <div
                        className="flex items-center gap-2.5 rounded-lg px-3.5 py-3 mb-5 text-sm"
                        style={{ background: "rgba(217,68,68,0.08)", border: "1px solid rgba(217,68,68,0.2)", color: "#D94444" }}
                    >
                        <AlertCircle size={15} className="flex-shrink-0" />
                        <span>E-mail ou senha incorretos. Tente novamente.</span>
                    </div>
                )}

                <form action={login} className="flex flex-col gap-4">
                    {/* Campo e-mail */}
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="email"
                            className="text-xs font-semibold uppercase tracking-wider"
                            style={{ color: "#A69060" }}
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
                            className="input-estetiqo w-full rounded-xl px-4 py-3 text-sm transition-all"
                            style={{ background: "#F6F2EA", border: "1px solid #EDE5D3", color: "#2D2319" }}
                        />
                    </div>

                    {/* Campo senha */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                            <label
                                htmlFor="password"
                                className="text-xs font-semibold uppercase tracking-wider"
                                style={{ color: "#A69060" }}
                            >
                                Senha
                            </label>
                            <a
                                href="/esqueceu-senha"
                                className="text-xs font-medium hover:underline"
                                style={{ color: "#B8960C" }}
                            >
                                Esqueceu a senha?
                            </a>
                        </div>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            placeholder="••••••••"
                            className="input-estetiqo w-full rounded-xl px-4 py-3 text-sm transition-all"
                            style={{ background: "#F6F2EA", border: "1px solid #EDE5D3", color: "#2D2319" }}
                        />
                    </div>

                    {/* Lembrar de mim */}
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            name="remember_me"
                            value="true"
                            className="w-4 h-4 rounded accent-[#B8960C] cursor-pointer"
                        />
                        <span className="text-sm" style={{ color: "#A69060" }}>Lembrar de mim</span>
                    </label>

                    {/* Botão entrar */}
                    <button
                        type="submit"
                        className="w-full rounded-xl py-3 text-sm font-bold mt-1 transition-all active:scale-[0.98]"
                        style={{
                            background: "linear-gradient(135deg, #D4B86A, #B8960C)",
                            color: "#FFFDF7",
                            boxShadow: "0 3px 12px rgba(184,150,12,0.3)",
                            minHeight: "44px",
                        }}
                    >
                        Entrar
                    </button>
                </form>
            </div>

            <p className="text-center text-xs mt-6" style={{ color: "#BBA870" }}>
                Estetiqo CRM © 2026 — MAVIK AI Solutions
            </p>
        </div>
    )
}
