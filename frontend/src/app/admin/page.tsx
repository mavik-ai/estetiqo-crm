import { BarChart3, Users, Crown, TrendingUp, AlertCircle } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'

export default async function AdminDashboard() {
    const supabase = await createClient()

    // Buscar contagem real por status
    const { data: statusCounts } = await supabase
        .from('tenants')
        .select('subscription_status')

    const counts = (statusCounts ?? []).reduce((acc: Record<string, number>, t) => {
        const s = t.subscription_status ?? 'trial'
        acc[s] = (acc[s] ?? 0) + 1
        return acc
    }, {})

    const total    = statusCounts?.length ?? 0
    const active   = counts['active'] ?? 0
    const trial    = counts['trial'] ?? 0
    const courtesy = counts['courtesy'] ?? 0
    const grace    = counts['grace'] ?? 0
    const expired  = counts['expired'] ?? 0

    const metrics = [
        {
            label: 'Total de Clínicas',
            value: String(total),
            icon: Users,
            sub: `${active} ativas · ${trial} em trial`,
            color: '#D4B86A',
        },
        {
            label: 'Clínicas Ativas',
            value: String(active + courtesy),
            icon: Crown,
            sub: `${active} pagas · ${courtesy} cortesia`,
            color: '#6EE7A0',
        },
        {
            label: 'Atenção Necessária',
            value: String(grace + expired),
            icon: AlertCircle,
            sub: `${grace} em carência · ${expired} expiradas`,
            color: grace + expired > 0 ? '#F07070' : '#9A8E70',
        },
        {
            label: 'MRR Estimado',
            value: 'Em breve',
            icon: TrendingUp,
            sub: 'Integração Stripe pendente',
            color: '#7CB3F0',
        },
    ]

    return (
        <div className="p-8 pb-20">
            <div className="flex flex-col gap-2 mb-8">
                <h1 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                    Overview de Negócio
                </h1>
                <p className="text-sm" style={{ color: '#D4C9A8' }}>
                    Dados reais do <b>Estetiqo CRM</b> — atualizado agora.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((m, i) => (
                    <div key={i} className="p-6 rounded-2xl relative overflow-hidden"
                        style={{ background: '#252219', border: '1px solid #33301F', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 pointer-events-none"
                            style={{ background: m.color, transform: 'translate(30%, -30%)' }} />

                        <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#9A8E70' }}>
                                {m.label}
                            </span>
                            <div className="p-2 rounded-xl" style={{ background: `${m.color}15`, color: m.color }}>
                                <m.icon size={18} />
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold tracking-tight mb-1">{m.value}</h2>
                        <p className="text-xs" style={{ color: '#9A8E70' }}>{m.sub}</p>
                    </div>
                ))}
            </div>

            {/* Distribuição por status */}
            <div className="mt-8 p-6 rounded-2xl" style={{ background: '#1C1A17', border: '1px solid #33301F' }}>
                <h3 className="font-semibold mb-4" style={{ color: '#D4C9A8' }}>Distribuição por Status</h3>
                <div className="flex flex-wrap gap-3">
                    {[
                        { label: 'Trial', count: trial, color: '#D4B86A' },
                        { label: 'Ativo', count: active, color: '#6EE7A0' },
                        { label: 'Cortesia', count: courtesy, color: '#93C5FD' },
                        { label: 'Carência', count: grace, color: '#FBA174' },
                        { label: 'Expirado', count: expired, color: '#F07070' },
                    ].map(s => (
                        <div key={s.label} className="flex items-center gap-2 px-4 py-2 rounded-xl"
                            style={{ background: `${s.color}10`, border: `1px solid ${s.color}25` }}>
                            <span className="text-lg font-bold" style={{ color: s.color }}>{s.count}</span>
                            <span className="text-xs font-medium" style={{ color: '#9A8E70' }}>{s.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Placeholder Faturamento */}
            <div className="mt-8 p-8 rounded-2xl border flex flex-col items-center justify-center text-center gap-3"
                style={{ background: '#1C1A17', borderColor: '#33301F', minHeight: '200px' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2" style={{ background: '#252219' }}>
                    <BarChart3 size={20} style={{ color: '#D4C9A8' }} />
                </div>
                <h3 className="font-semibold text-lg">Evolução do Faturamento</h3>
                <p className="text-sm max-w-sm" style={{ color: '#9A8E70' }}>
                    Disponível após integração com Stripe (próximo sprint).
                </p>
            </div>
        </div>
    )
}
