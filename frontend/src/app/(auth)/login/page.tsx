import { login } from './actions'
import { AlertCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { PasswordInput } from '@/components/ui/PasswordInput'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ message?: string }>
}) {
    const params = await searchParams
    const errorMessage = params.message

    return (
        <div className="w-full max-w-sm px-4">
            {/* Logo — versão branca para fundo dark */}
            <div className="flex items-center justify-center mb-8">
                <Image
                    src="/logo-dark.png"
                    alt="Estetiqo"
                    width={200}
                    height={56}
                    priority
                    className="h-12 w-auto"
                />
            </div>

            {/* Card dark */}
            <div
                className="rounded-2xl p-8"
                style={{
                    background: "#1C1A17",
                    border: "1px solid #33301F",
                    boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
                }}
            >
                <div className="mb-6">
                    <h1
                        className="text-xl font-semibold mb-1"
                        style={{ fontFamily: "'Playfair Display', serif", color: "#FFFFFF" }}
                    >
                        Bem-vinda de volta
                    </h1>
                    <p className="text-sm" style={{ color: "#9A8E70" }}>
                        Entre com seu e-mail e senha para continuar.
                    </p>
                </div>

                {/* Mensagem de erro */}
                {errorMessage && (
                    <div
                        className="flex items-center gap-2.5 rounded-lg px-3.5 py-3 mb-5 text-sm"
                        style={{
                            background: "rgba(240,112,112,0.1)",
                            border: "1px solid rgba(240,112,112,0.25)",
                            color: "#F07070",
                        }}
                    >
                        <AlertCircle size={15} className="flex-shrink-0" />
                        <span>E-mail ou senha incorretos. Tente novamente.</span>
                    </div>
                )}

                <form action={login} className="flex flex-col gap-4">
                    {/* E-mail */}
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
                            style={{
                                background: "#252219",
                                border: "1px solid #33301F",
                                color: "#FFFFFF",
                            }}
                        />
                    </div>

                    {/* Senha */}
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="password"
                            className="text-xs font-semibold uppercase tracking-wider"
                            style={{ color: "#9A8E70" }}
                        >
                            Senha
                        </label>
                        <PasswordInput
                            id="password"
                            name="password"
                            autoComplete="current-password"
                            required
                            dark
                        />
                    </div>

                    {/* Lembrar de mim + Esqueceu a senha — mesma linha */}
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                name="remember_me"
                                value="true"
                                className="w-4 h-4 rounded cursor-pointer accent-[#D4B86A]"
                            />
                            <span className="text-sm" style={{ color: "#9A8E70" }}>Lembrar de mim</span>
                        </label>
                        <Link
                            href="/esqueceu-senha"
                            className="text-xs font-medium hover:underline"
                            style={{ color: "#D4B86A" }}
                        >
                            Esqueceu a senha?
                        </Link>
                    </div>

                    {/* Botão */}
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
                        Entrar
                    </button>
                </form>
            </div>

            <p className="text-center text-xs mt-6" style={{ color: "#3A3527" }}>
                Estetiqo CRM © 2026 — MAVIK AI Solutions
            </p>
        </div>
    )
}
