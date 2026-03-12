import { CreditCard } from 'lucide-react'

export default function PlansPage() {
    return (
        <div className="p-8 pb-20">
            <div className="flex flex-col gap-2 mb-8">
                <h1 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                    Faturamento & Planos
                </h1>
                <p className="text-sm" style={{ color: '#D4C9A8' }}>
                    Gerencie assinaturas, pagamentos e liberações de acesso.
                </p>
            </div>

            <div className="p-12 rounded-2xl flex flex-col items-center justify-center text-center gap-4"
                style={{ background: '#1C1A17', border: '1px solid #33301F', minHeight: '300px' }}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ background: '#252219' }}>
                    <CreditCard size={22} style={{ color: '#D4B86A' }} />
                </div>
                <h3 className="font-semibold text-lg" style={{ color: '#F5EDD8' }}>
                    Integração Stripe — Próximo Sprint
                </h3>
                <p className="text-sm max-w-md" style={{ color: '#9A8E70', lineHeight: 1.7 }}>
                    O painel de faturamento real será exibido aqui após a integração com o Stripe.
                    Por enquanto, gerencie o acesso das clínicas diretamente pela aba <strong style={{ color: '#D4C9A8' }}>Clínicas</strong> usando cortesia VIP.
                </p>
            </div>
        </div>
    )
}
