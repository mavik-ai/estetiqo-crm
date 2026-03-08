import { Badge } from "@/components/ui/badge"
import { Search, MoreVertical, Plus } from 'lucide-react'

// Dummy Data baseada no escopo
const clinics = [
    { id: '1', name: 'Estética Michele Oliveira', owner: 'michele@estetiqo.com.br', plan: 'Pro', status: 'Ativo', date: '08 Mar 2026' },
    { id: '2', name: 'Harmony Laser', owner: 'contato@harmonylaser.com', plan: 'Trial', status: 'Ativo', date: '05 Mar 2026' },
    { id: '3', name: 'Dra. Fernanda Body', owner: 'nanda@body.com.br', plan: 'Essencial', status: 'Inadimplente', date: '12 Fev 2026' },
]

export default function ClinicsPage() {
    return (
        <div className="p-8 pb-20">
            <div className="flex justify-between items-end mb-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-playfair), serif' }}>Contas Cadastradas</h1>
                    <p className="text-sm" style={{ color: '#D4C9A8' }}>Gerencie as operações e status de todos os tenants da plataforma.</p>
                </div>

                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-[13px] transition-all"
                    style={{ background: 'linear-gradient(135deg, #D4B86A, #B8960C)', color: '#161412' }}>
                    <Plus size={16} strokeWidth={2.5} /> Nova Clínica VIP
                </button>
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #33301F', background: '#252219' }}>

                {/* Barra de Filtros */}
                <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: '#33301F', background: '#1C1A17' }}>
                    <div className="relative w-72">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9A8E70' }} />
                        <input
                            placeholder="Buscar clinica ou e-mail..."
                            className="w-full bg-transparent text-sm pl-9 pr-4 py-2 rounded-lg outline-none"
                            style={{ border: '1px solid #33301F', color: '#FFFFFF' }}
                        />
                    </div>

                    <div className="flex gap-2 text-sm font-semibold" style={{ color: '#9A8E70' }}>
                        <span className="px-3 py-1.5 rounded-lg" style={{ background: '#2A2518' }}>Todos (3)</span>
                        <span className="px-3 py-1.5 rounded-lg hover:bg-[#2A2518] cursor-pointer transition-colors">Em Trial</span>
                    </div>
                </div>

                {/* Tabela Bruta (Design Premium Dark) */}
                <div className="w-full">
                    <div className="grid grid-cols-12 gap-4 p-4 text-xs font-bold uppercase tracking-wider border-b"
                        style={{ color: '#9A8E70', borderColor: '#33301F' }}>
                        <div className="col-span-4">Clínica & Proprietária</div>
                        <div className="col-span-2">Plano Atual</div>
                        <div className="col-span-3">Status Mestre</div>
                        <div className="col-span-2 text-right">Membro desde</div>
                        <div className="col-span-1 text-center">Ações</div>
                    </div>

                    {clinics.map((clinic, i) => (
                        <div key={i} className="grid grid-cols-12 gap-4 p-4 items-center text-sm transition-colors hover:bg-[#2A2518]"
                            style={{ borderBottom: i < clinics.length - 1 ? '1px solid #33301F' : 'none' }}>
                            <div className="col-span-4 flex flex-col min-w-0">
                                <span className="font-semibold truncate">{clinic.name}</span>
                                <span className="text-xs truncate mt-0.5" style={{ color: '#D4C9A8' }}>{clinic.owner}</span>
                            </div>

                            <div className="col-span-2 font-bold" style={{ color: '#D4B86A' }}>
                                {clinic.plan}
                            </div>

                            <div className="col-span-3">
                                <Badge variant="outline"
                                    style={{
                                        background: clinic.status === 'Ativo' ? 'rgba(110, 231, 160, 0.1)' : 'rgba(240, 112, 112, 0.1)',
                                        color: clinic.status === 'Ativo' ? '#6EE7A0' : '#F07070',
                                        borderColor: clinic.status === 'Ativo' ? 'rgba(110, 231, 160, 0.2)' : 'rgba(240, 112, 112, 0.2)',
                                    }}>
                                    {clinic.status}
                                </Badge>
                            </div>

                            <div className="col-span-2 text-right text-xs" style={{ color: '#D4C9A8' }}>
                                {clinic.date}
                            </div>

                            <div className="col-span-1 flex justify-center">
                                <button className="p-1.5 rounded-md hover:bg-[#33301F] transition-colors" style={{ color: '#9A8E70' }}>
                                    <MoreVertical size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}
