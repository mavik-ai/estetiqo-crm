import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react'

const billingClients = [
    { id: '1', name: 'Estética Michele Oliveira', plan: 'Pro', status: 'Ativo', nextBilling: '08 Abr 2026', method: 'Cartão de Crédito (** 4111)' },
    { id: '2', name: 'Harmony Laser', plan: 'Trial', status: 'Ativo', nextBilling: 'Expira em 3 dias', method: 'Não informado' },
    { id: '3', name: 'Dra. Fernanda Body', plan: 'Essencial', status: 'Inadimplente', nextBilling: 'Atrasado', method: 'Boleto Bancário' },
]

export default function PlansPage() {
    return (
        <div className="p-8 pb-20">
            <div className="flex justify-between items-end mb-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-playfair), serif' }}>Faturamento & Planos</h1>
                    <p className="text-sm" style={{ color: '#D4C9A8' }}>Gerencie o ciclo de assinaturas, bypass de pagamentos via PIX e liberação de acesso VIP.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-8">
                {/* Alerta de Inadimplência Mocado */}
                <div className="p-4 rounded-xl flex items-start gap-3" style={{ background: 'rgba(240, 112, 112, 0.1)', border: '1px solid rgba(240, 112, 112, 0.2)' }}>
                    <AlertCircle size={20} style={{ color: '#F07070', marginTop: '2px' }} />
                    <div>
                        <h4 className="font-bold text-[14px]" style={{ color: '#F07070' }}>Atenção: 1 Assinatura Inadimplente Identificada</h4>
                        <p className="text-[13px] mt-1 opacity-90" style={{ color: '#F07070' }}>A assinatura da clínica "Dra. Fernanda Body" falhou a renovação automática via Stripe.</p>
                        <div className="mt-3 flex gap-3">
                            <button className="text-[12px] font-bold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                                style={{ background: '#F07070', color: '#161412' }}>Ver Detalhes do Erro</button>
                            <button className="text-[12px] font-bold px-3 py-1.5 rounded-lg border transition-all hover:bg-[rgba(240,112,112,0.1)]"
                                style={{ borderColor: 'rgba(240, 112, 112, 0.4)', color: '#F07070' }}>Liberar Acesso (Pix)</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #33301F', background: '#252219' }}>
                <div className="w-full">
                    <div className="grid grid-cols-12 gap-4 p-4 text-xs font-bold uppercase tracking-wider border-b"
                        style={{ color: '#9A8E70', borderColor: '#33301F' }}>
                        <div className="col-span-4">Clínica Favorecida</div>
                        <div className="col-span-2">Plano Contratado</div>
                        <div className="col-span-3">Próx. Faturamento</div>
                        <div className="col-span-3 text-right">Método de Pgto</div>
                    </div>

                    {billingClients.map((client, i) => (
                        <div key={i} className="grid grid-cols-12 gap-4 p-4 items-center text-sm transition-colors hover:bg-[#2A2518]"
                            style={{ borderBottom: i < billingClients.length - 1 ? '1px solid #33301F' : 'none' }}>
                            <div className="col-span-4 font-semibold text-[#FFFFFF] truncate">
                                {client.name}
                            </div>

                            <div className="col-span-2">
                                <Badge variant="outline"
                                    style={{
                                        background: client.plan === 'Trial' ? 'rgba(124, 179, 240, 0.1)' : 'rgba(212, 184, 106, 0.1)',
                                        color: client.plan === 'Trial' ? '#7CB3F0' : '#D4B86A',
                                        borderColor: client.plan === 'Trial' ? 'rgba(124, 179, 240, 0.2)' : 'rgba(212, 184, 106, 0.2)',
                                    }}>
                                    {client.plan}
                                </Badge>
                            </div>

                            <div className="col-span-3 flex items-center gap-2">
                                {client.status === 'Ativo' ? (
                                    <CheckCircle2 size={14} style={{ color: '#6EE7A0' }} />
                                ) : (
                                    <AlertCircle size={14} style={{ color: '#F07070' }} />
                                )}
                                <span style={{ color: client.status === 'Ativo' ? '#D4C9A8' : '#F07070' }}>{client.nextBilling}</span>
                            </div>

                            <div className="col-span-3 text-right text-xs flex items-center justify-end gap-2" style={{ color: '#9A8E70' }}>
                                <RefreshCw size={12} className="opacity-50" />
                                {client.method}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}
