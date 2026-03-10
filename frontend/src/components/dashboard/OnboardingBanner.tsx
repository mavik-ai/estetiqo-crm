'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Wand2, DoorOpen, Layers, X } from 'lucide-react'
import Link from 'next/link'

interface OnboardingBannerProps {
    hasServices: boolean
    hasRooms: boolean
}

const STORAGE_KEY = 'estetiqo_onboarding_dismissed'

export function OnboardingBanner({ hasServices, hasRooms }: OnboardingBannerProps) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const dismissed = localStorage.getItem(STORAGE_KEY)
        if (!dismissed) setVisible(true)
    }, [])

    const dismiss = () => {
        localStorage.setItem(STORAGE_KEY, '1')
        setVisible(false)
    }

    if (!visible) return null

    return (
        <div
            style={{
                background: 'linear-gradient(135deg, #FBF5EA, #F3E8CC)',
                border: '1px solid rgba(184,150,12,0.25)',
                borderRadius: '14px',
                padding: '20px 24px',
                marginBottom: '16px',
                position: 'relative',
            }}
        >
            {/* Botão fechar */}
            <button
                onClick={dismiss}
                aria-label="Fechar"
                style={{
                    position: 'absolute', top: '14px', right: '14px',
                    background: 'rgba(184,150,12,0.10)', border: '1px solid rgba(184,150,12,0.20)',
                    borderRadius: '6px', padding: '4px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#B8960C', lineHeight: 0,
                }}
            >
                <X size={14} strokeWidth={2} />
            </button>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', paddingRight: '28px' }}>
                <Sparkles size={20} strokeWidth={1.5} color="#B8960C" style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '15px', fontWeight: 700, color: 'var(--foreground)', margin: '0 0 6px' }}>
                        Configure sua clínica antes de começar
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', margin: '0 0 14px' }}>
                        Complete os itens abaixo para usar o sistema com todas as funcionalidades.
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {!hasServices && (
                            <Link
                                href="/servicos"
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                    padding: '7px 14px', borderRadius: '8px',
                                    background: 'rgba(184,150,12,0.10)', border: '1px solid rgba(184,150,12,0.25)',
                                    fontSize: '12px', fontWeight: 700, color: '#B8960C', textDecoration: 'none',
                                }}
                            >
                                <Wand2 size={12} strokeWidth={2} />
                                Cadastrar 1º serviço
                            </Link>
                        )}
                        {!hasRooms && (
                            <Link
                                href="/config/salas"
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                    padding: '7px 14px', borderRadius: '8px',
                                    background: 'rgba(184,150,12,0.10)', border: '1px solid rgba(184,150,12,0.25)',
                                    fontSize: '12px', fontWeight: 700, color: '#B8960C', textDecoration: 'none',
                                }}
                            >
                                <DoorOpen size={12} strokeWidth={2} />
                                Cadastrar 1ª sala
                            </Link>
                        )}
                        <Link
                            href="/protocolos/novo"
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                padding: '7px 14px', borderRadius: '8px',
                                background: 'rgba(184,150,12,0.10)', border: '1px solid rgba(184,150,12,0.25)',
                                fontSize: '12px', fontWeight: 700, color: '#B8960C', textDecoration: 'none',
                            }}
                        >
                            <Layers size={12} strokeWidth={2} />
                            Criar 1º protocolo
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
