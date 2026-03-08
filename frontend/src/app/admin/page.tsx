import { BarChart3, Users, Crown, ArrowUpRight } from 'lucide-react'

// Dummy Metrics pro Mockup MVP (antes das integrações finais de Stripe)
const metrics = [
    { label: 'MRR Estimado', value: 'R$ 1.250', icon: Crown, trend: '+12%', color: '#D4B86A' },
    { label: 'Clínicas Ativas', value: '14', icon: Users, trend: '+3', color: '#6EE7A0' },
    { label: 'Novos Trials Mensais', value: '8', icon: BarChart3, trend: '-2', color: '#7CB3F0' },
]

export default function AdminDashboard() {
    return (
        <div className="p-8 pb-20">

            <div className="flex flex-col gap-2 mb-8">
                <h1 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                    Overview de Negócio
                </h1>
                <p className="text-sm" style={{ color: '#D4C9A8' }}>Acompanhe o crescimento e saude do <b>Estetiqo CRM</b>.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {metrics.map((m, i) => (
                    <div
                        key={i}
                        className="p-6 rounded-2xl relative overflow-hidden"
                        style={{
                            background: '#252219',
                            border: '1px solid #33301F',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                        }}
                    >
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

                        <div className="flex items-end gap-3">
                            <h2 className="text-3xl font-bold tracking-tight">{m.value}</h2>
                            <span className="text-xs font-bold mb-1 flex items-center gap-1" style={{ color: m.trend.includes('+') ? '#6EE7A0' : '#F07070' }}>
                                {m.trend.includes('+') && <ArrowUpRight size={12} />}
                                {m.trend}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Placeholder pro Gráfico/Tabela futura central */}
            <div className="mt-8 p-8 rounded-2xl border flex flex-col items-center justify-center text-center gap-3"
                style={{ background: '#1C1A17', borderColor: '#33301F', minHeight: '300px' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2" style={{ background: '#252219' }}>
                    <BarChart3 size={20} style={{ color: '#D4C9A8' }} />
                </div>
                <h3 className="font-semibold text-lg">Evolução do Faturamento</h3>
                <p className="text-sm max-w-sm" style={{ color: '#9A8E70' }}>
                    O gráfico consolidado de pagamentos será exibido aqui assim que os webhooks do Stripe/Hotmart começarem a transacionar as primeiras contas Pro.
                </p>
            </div>

        </div>
    )
}
