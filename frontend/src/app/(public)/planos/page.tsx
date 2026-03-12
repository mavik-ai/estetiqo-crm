import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { CheckCircle2, Sparkles } from "lucide-react";

const FEATURES = [
    "Agenda completa com salas",
    "Cadastro ilimitado de pacientes",
    "Protocolos e histórico de sessões",
    "Relatórios de desempenho",
    "Equipe de até 5 profissionais",
    "Suporte por WhatsApp",
];

export default async function PlanosPage() {
    // Tenta buscar nome da clínica se usuário logado
    let clinicaName = '';
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: profile } = await supabase
                .from('users')
                .select('tenants(name)')
                .eq('id', user.id)
                .single();
            // @ts-ignore
            clinicaName = (profile?.tenants as { name?: string } | null)?.name ?? '';
        }
    } catch { /* usuário não logado */ }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#F6F2EA',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 24px',
            fontFamily: 'var(--font-urbanist), sans-serif',
        }}>
            {/* Logo */}
            <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                <div style={{
                    width: '52px', height: '52px', borderRadius: '16px',
                    background: 'linear-gradient(135deg, #D4B86A, #B8960C)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px',
                }}>
                    <Sparkles size={24} strokeWidth={1.8} color="#FFFDF7" />
                </div>

                {clinicaName ? (
                    <>
                        <p style={{ fontSize: '13px', color: '#A69060', margin: '0 0 6px' }}>
                            {clinicaName}
                        </p>
                        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '26px', fontWeight: 700, color: '#2D2319', margin: '0 0 8px' }}>
                            Seu acesso expirou
                        </h1>
                        <p style={{ fontSize: '14px', color: '#A69060', margin: 0 }}>
                            Escolha um plano para continuar usando o Estetiqo.
                        </p>
                    </>
                ) : (
                    <>
                        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '26px', fontWeight: 700, color: '#2D2319', margin: '0 0 8px' }}>
                            Planos Estetiqo
                        </h1>
                        <p style={{ fontSize: '14px', color: '#A69060', margin: 0 }}>
                            7 dias grátis • sem cartão • cancele quando quiser
                        </p>
                    </>
                )}
            </div>

            {/* Cards de planos */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', width: '100%', maxWidth: '640px', marginBottom: '32px' }}>

                {/* Mensal */}
                <div style={{
                    background: '#FFFFFF',
                    border: '1px solid #EDE5D3',
                    borderRadius: '16px',
                    padding: '28px',
                }}>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#BBA870', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Mensal</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
                        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '36px', fontWeight: 700, color: '#2D2319' }}>R$67</span>
                        <span style={{ fontSize: '14px', color: '#A69060' }}>/mês</span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#A69060', margin: '0 0 20px' }}>Preço especial por tempo limitado</p>
                    <ul style={{ listStyle: 'none', margin: '0 0 24px', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {FEATURES.map(f => (
                            <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#5A4A3A' }}>
                                <CheckCircle2 size={15} strokeWidth={2} color="#B8960C" style={{ flexShrink: 0 }} />
                                {f}
                            </li>
                        ))}
                    </ul>
                    <button
                        style={{
                            width: '100%', padding: '12px',
                            background: 'linear-gradient(135deg, #D4B86A, #B8960C)',
                            color: '#161412', fontSize: '14px', fontWeight: 700,
                            borderRadius: '10px', border: 'none', cursor: 'pointer',
                            fontFamily: 'inherit',
                        }}
                        onClick={() => alert('Em breve — entre em contato pelo WhatsApp')}
                    >
                        Assinar Mensal
                    </button>
                </div>

                {/* Anual */}
                <div style={{
                    background: '#FFFFFF',
                    border: '2px solid #B8960C',
                    borderRadius: '16px',
                    padding: '28px',
                    position: 'relative',
                }}>
                    <div style={{
                        position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                        background: 'linear-gradient(135deg, #D4B86A, #B8960C)',
                        color: '#161412', fontSize: '11px', fontWeight: 700,
                        padding: '4px 14px', borderRadius: '99px', whiteSpace: 'nowrap',
                    }}>
                        MELHOR OFERTA
                    </div>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#BBA870', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Anual</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
                        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '36px', fontWeight: 700, color: '#2D2319' }}>R$670</span>
                        <span style={{ fontSize: '14px', color: '#A69060' }}>/ano</span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#B8960C', fontWeight: 600, margin: '0 0 20px' }}>2 meses grátis · equivale a R$55,83/mês</p>
                    <ul style={{ listStyle: 'none', margin: '0 0 24px', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {FEATURES.map(f => (
                            <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#5A4A3A' }}>
                                <CheckCircle2 size={15} strokeWidth={2} color="#B8960C" style={{ flexShrink: 0 }} />
                                {f}
                            </li>
                        ))}
                    </ul>
                    <button
                        style={{
                            width: '100%', padding: '12px',
                            background: 'linear-gradient(135deg, #D4B86A, #B8960C)',
                            color: '#161412', fontSize: '14px', fontWeight: 700,
                            borderRadius: '10px', border: 'none', cursor: 'pointer',
                            fontFamily: 'inherit',
                        }}
                        onClick={() => alert('Em breve — entre em contato pelo WhatsApp')}
                    >
                        Assinar Anual
                    </button>
                </div>
            </div>

            {/* Rodapé */}
            <div style={{ textAlign: 'center' }}>
                <a
                    href="https://wa.me/5598992002580"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '13px', color: '#B8960C', textDecoration: 'none', fontWeight: 600 }}
                >
                    Dúvidas? Fale no WhatsApp
                </a>
                {clinicaName && (
                    <div style={{ marginTop: '16px' }}>
                        <Link href="/" style={{ fontSize: '12px', color: '#A69060', textDecoration: 'none' }}>
                            ← Voltar ao sistema
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
