'use client'

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { CheckCircle2, Circle, ArrowRight, Sparkles, PartyPopper } from 'lucide-react';
import { completarOnboarding } from './actions';
import { useRouter } from 'next/navigation';

interface Step {
    id: number;
    title: string;
    desc: string;
    href: string;
    done: boolean;
}

interface SetupClientProps {
    steps: Step[];
    totalDone: number;
    allDone: boolean;
}

export function SetupClient({ steps, totalDone, allDone }: SetupClientProps) {
    const [isPending, startTransition] = useTransition();
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 60);
        return () => clearTimeout(t);
    }, []);

    const handleComplete = () => {
        startTransition(async () => {
            await completarOnboarding();
            router.push('/');
        });
    };

    const pct = Math.round((totalDone / steps.length) * 100);

    return (
        <div
            style={{
                minHeight: '100%',
                background: 'var(--background)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                padding: '48px 24px',
            }}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: '540px',
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'opacity 0.45s ease, transform 0.45s ease',
                }}
            >
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div
                        style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '18px',
                            background: 'linear-gradient(135deg, #D4B86A, #B8960C)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px',
                            boxShadow: '0 6px 20px rgba(184,150,12,0.28)',
                            transition: 'transform 0.3s ease',
                        }}
                        onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.transform = 'scale(1.06) rotate(-2deg)')}
                        onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.transform = 'scale(1) rotate(0deg)')}
                    >
                        {allDone
                            ? <PartyPopper size={24} strokeWidth={1.8} color="#FFFDF7" />
                            : <Sparkles size={24} strokeWidth={1.8} color="#FFFDF7" />
                        }
                    </div>
                    <h1
                        style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: '26px',
                            fontWeight: 700,
                            color: 'var(--foreground)',
                            margin: '0 0 8px',
                            transition: 'color 0.3s',
                        }}
                    >
                        {allDone ? 'Tudo pronto! 🎉' : 'Bem-vinda ao Estetiqo!'}
                    </h1>
                    <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', margin: 0 }}>
                        {allDone
                            ? 'Sua clínica está configurada e pronta para uso.'
                            : 'Siga os passos abaixo para configurar sua clínica.'}
                    </p>
                </div>

                {/* Barra de progresso */}
                <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#BBA870', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Progresso
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--foreground)', transition: 'color 0.3s' }}>
                            {totalDone}/{steps.length} passos
                            {pct === 100 && <span style={{ color: '#B8960C', marginLeft: '6px' }}>✓</span>}
                        </span>
                    </div>
                    <div style={{ height: '8px', background: '#EDE5D3', borderRadius: '99px', overflow: 'hidden' }}>
                        <div
                            style={{
                                height: '100%',
                                width: `${pct}%`,
                                background: 'linear-gradient(90deg, #D4B86A, #B8960C)',
                                borderRadius: '99px',
                                transition: 'width 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                boxShadow: pct > 0 ? '0 0 8px rgba(184,150,12,0.4)' : 'none',
                            }}
                        />
                    </div>
                </div>

                {/* Lista de passos */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
                    {steps.map((step, idx) => (
                        <StepCard key={step.id} step={step} delay={idx * 60} />
                    ))}
                </div>

                {/* Ações */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                    {allDone ? (
                        <button
                            onClick={handleComplete}
                            disabled={isPending}
                            style={{
                                width: '100%',
                                padding: '14px',
                                borderRadius: '12px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #D4B86A, #B8960C)',
                                color: '#161412',
                                fontSize: '15px',
                                fontWeight: 700,
                                cursor: isPending ? 'default' : 'pointer',
                                fontFamily: 'inherit',
                                opacity: isPending ? 0.75 : 1,
                                transition: 'opacity 0.2s, transform 0.15s, box-shadow 0.2s',
                                boxShadow: '0 4px 16px rgba(184,150,12,0.28)',
                            }}
                            onMouseEnter={e => {
                                if (!isPending) {
                                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(184,150,12,0.35)';
                                }
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(184,150,12,0.28)';
                            }}
                        >
                            {isPending ? 'Finalizando...' : 'Entrar no sistema →'}
                        </button>
                    ) : (
                        <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', textAlign: 'center' }}>
                            Complete todos os passos para liberar o botão de conclusão.
                        </p>
                    )}
                    <Link
                        href="/"
                        style={{ fontSize: '13px', color: 'var(--muted-foreground)', textDecoration: 'none', transition: 'color 0.15s' }}
                        onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#B8960C')}
                        onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--muted-foreground)')}
                    >
                        Pular por agora — configurar depois
                    </Link>
                </div>
            </div>
        </div>
    );
}

function StepCard({ step, delay }: { step: Step; delay: number }) {
    const [hovered, setHovered] = useState(false);
    const [appeared, setAppeared] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setAppeared(true), 100 + delay);
        return () => clearTimeout(t);
    }, [delay]);

    return (
        <div
            style={{
                opacity: appeared ? 1 : 0,
                transform: appeared ? 'translateX(0)' : 'translateX(-10px)',
                transition: `opacity 0.35s ease, transform 0.35s ease`,
            }}
        >
            <Link href={step.href} style={{ textDecoration: 'none' }}>
                <div
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '16px 20px',
                        background: step.done
                            ? 'rgba(184,150,12,0.07)'
                            : hovered ? '#FDFAF5' : 'var(--card)',
                        border: `1px solid ${step.done
                            ? 'rgba(184,150,12,0.3)'
                            : hovered ? 'rgba(184,150,12,0.25)' : 'var(--border)'}`,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.18s ease',
                        transform: hovered && !step.done ? 'translateX(4px)' : 'translateX(0)',
                        boxShadow: hovered && !step.done ? '0 2px 14px rgba(184,150,12,0.1)' : 'none',
                    }}
                >
                    <div style={{ transition: 'transform 0.25s ease', transform: step.done ? 'scale(1.1)' : hovered ? 'scale(1.05)' : 'scale(1)' }}>
                        {step.done
                            ? <CheckCircle2 size={22} strokeWidth={2} color="#B8960C" style={{ flexShrink: 0 }} />
                            : <Circle size={22} strokeWidth={1.5} color={hovered ? '#B8960C' : '#C5AA72'} style={{ flexShrink: 0, transition: 'color 0.18s' }} />
                        }
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                            margin: 0,
                            fontSize: '14px',
                            fontWeight: 700,
                            color: step.done ? '#B8960C' : hovered ? '#2D2319' : 'var(--foreground)',
                            transition: 'color 0.18s',
                        }}>
                            {step.id}. {step.title}
                        </p>
                        <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--muted-foreground)' }}>
                            {step.desc}
                        </p>
                    </div>

                    {!step.done && (
                        <ArrowRight
                            size={16}
                            strokeWidth={2}
                            color={hovered ? '#B8960C' : '#A69060'}
                            style={{
                                flexShrink: 0,
                                transition: 'transform 0.18s ease, color 0.18s ease',
                                transform: hovered ? 'translateX(3px)' : 'translateX(0)',
                            }}
                        />
                    )}
                    {step.done && (
                        <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#B8960C',
                            background: 'rgba(184,150,12,0.12)',
                            padding: '3px 10px',
                            borderRadius: '6px',
                            flexShrink: 0,
                        }}>
                            Feito ✓
                        </span>
                    )}
                </div>
            </Link>
        </div>
    );
}
