'use client'

import { useState, useTransition, useMemo } from 'react';
import { concederCortesia, converterParaCarencia, expirarTenant, ativarTenant, criarTenant, atualizarTenant, deletarTenant } from './actions';

interface Tenant {
    id: string;
    name: string;
    slug: string;
    subscription_status: string | null;
    trial_ends_at: string | null;
    grace_ends_at: string | null;
    courtesy_days: number | null;
    courtesy_starts_at: string | null;
    courtesy_note: string | null;
    created_at: string;
    adminEmail?: string;
}

const STATUS_LABEL: Record<string, string> = {
    active: 'Ativo',
    trial: 'Trial',
    courtesy: 'Cortesia',
    grace: 'Carência',
    expired: 'Expirado',
};

const STATUS_COLOR: Record<string, { bg: string; color: string; border: string }> = {
    active:   { bg: 'rgba(110,231,160,0.1)', color: '#6EE7A0', border: 'rgba(110,231,160,0.2)' },
    trial:    { bg: 'rgba(212,184,106,0.12)', color: '#D4B86A', border: 'rgba(212,184,106,0.3)' },
    courtesy: { bg: 'rgba(147,197,253,0.1)', color: '#93C5FD', border: 'rgba(147,197,253,0.2)' },
    grace:    { bg: 'rgba(253,186,116,0.1)', color: '#FBA174', border: 'rgba(253,186,116,0.2)' },
    expired:  { bg: 'rgba(240,112,112,0.1)', color: '#F07070', border: 'rgba(240,112,112,0.2)' },
};

function calcDaysLeft(tenant: Tenant): string {
    const now = new Date();
    const status = tenant.subscription_status ?? 'trial';
    if (status === 'courtesy' && tenant.courtesy_days === -1) return 'Infinito';
    if (status === 'courtesy' && tenant.courtesy_days && tenant.courtesy_starts_at) {
        const exp = new Date(tenant.courtesy_starts_at);
        exp.setDate(exp.getDate() + tenant.courtesy_days);
        const days = Math.ceil((exp.getTime() - now.getTime()) / 86400000);
        return days > 0 ? `${days}d restantes` : 'Expirado';
    }
    if (status === 'trial' && tenant.trial_ends_at) {
        const days = Math.ceil((new Date(tenant.trial_ends_at).getTime() - now.getTime()) / 86400000);
        return days > 0 ? `${days}d restantes` : 'Expirado';
    }
    if (status === 'grace' && tenant.grace_ends_at) {
        const days = Math.ceil((new Date(tenant.grace_ends_at).getTime() - now.getTime()) / 86400000);
        return days > 0 ? `${days}d restantes` : 'Expirado';
    }
    return '—';
}

function formatDate(d: string) {
    return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', background: '#252219',
    border: '1px solid #33301F', borderRadius: '8px',
    fontSize: '14px', color: '#F5EDD8', outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit',
};

const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '11px', fontWeight: 700,
    color: '#BBA870', marginBottom: '6px', textTransform: 'uppercase',
};

export function ClinicasClient({ tenants }: { tenants: Tenant[] }) {
    const [isPending, startTransition] = useTransition();
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    // Busca
    const [search, setSearch] = useState('');
    const filtered = useMemo(() =>
        search.trim() ? tenants.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.slug.includes(search.toLowerCase())) : tenants
    , [tenants, search]);

    // Modal VIP
    const [vipModal, setVipModal] = useState<string | null>(null);
    const [vipDays, setVipDays] = useState('');
    const [vipNote, setVipNote] = useState('');

    // Modal Criar
    const [createModal, setCreateModal] = useState(false);
    const [createError, setCreateError] = useState('');
    const [createSuccess, setCreateSuccess] = useState('');

    // Modal Editar
    const [editModal, setEditModal] = useState<Tenant | null>(null);
    const [editName, setEditName] = useState('');
    const [editSlug, setEditSlug] = useState('');
    const [editError, setEditError] = useState('');

    // Modal Excluir
    const [deleteModal, setDeleteModal] = useState<Tenant | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState('');
    const [deleteError, setDeleteError] = useState('');

    const handleVip = () => {
        if (!vipModal) return;
        const days = vipDays === '-1' || vipDays === '' ? -1 : parseInt(vipDays);
        startTransition(async () => {
            await concederCortesia(vipModal, isNaN(days) ? -1 : days, vipNote);
            setVipModal(null); setVipDays(''); setVipNote('');
        });
    };

    const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setCreateError(''); setCreateSuccess('');
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
            const res = await criarTenant(fd);
            if (res.error) { setCreateError(res.error); return; }
            setCreateSuccess(`Clínica criada! Senha temporária: ${res.tempPassword}`);
        });
    };

    const handleEdit = () => {
        if (!editModal) return;
        setEditError('');
        startTransition(async () => {
            const res = await atualizarTenant(editModal.id, editName, editSlug);
            if (res.error) { setEditError(res.error); return; }
            setEditModal(null);
        });
    };

    const handleDelete = () => {
        if (!deleteModal || deleteConfirm !== deleteModal.name) {
            setDeleteError('Nome digitado não confere.'); return;
        }
        startTransition(async () => {
            const res = await deletarTenant(deleteModal.id);
            if (res.error) { setDeleteError(res.error); return; }
            setDeleteModal(null); setDeleteConfirm('');
        });
    };

    return (
        <>
            {/* Barra de busca + botão Nova Clínica */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
                <input
                    type="text"
                    placeholder="Buscar por nome ou slug..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                        flex: 1, padding: '9px 14px', background: '#1C1A17',
                        border: '1px solid #33301F', borderRadius: '10px',
                        fontSize: '13px', color: '#F5EDD8', outline: 'none', fontFamily: 'inherit',
                    }}
                />
                <button
                    onClick={() => { setCreateModal(true); setCreateError(''); setCreateSuccess(''); }}
                    style={{
                        padding: '9px 20px', borderRadius: '10px', border: 'none',
                        background: 'linear-gradient(135deg, #D4B86A, #B8960C)',
                        color: '#161412', fontSize: '13px', fontWeight: 700,
                        cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                    }}
                >
                    + Nova Clínica
                </button>
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #33301F', background: '#252219' }}>
                {/* Header da tabela */}
                <div className="grid grid-cols-12 gap-4 p-4 text-xs font-bold uppercase tracking-wider border-b"
                    style={{ color: '#9A8E70', borderColor: '#33301F', background: '#1C1A17' }}>
                    <div className="col-span-4">Clínica</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2">Dias Restantes</div>
                    <div className="col-span-2">Nota Cortesia</div>
                    <div className="col-span-1 text-right">Desde</div>
                    <div className="col-span-1 text-center">Ações</div>
                </div>

                {filtered.length === 0 && (
                    <div style={{ padding: '32px', textAlign: 'center', color: '#9A8E70', fontSize: '14px' }}>
                        {search ? 'Nenhuma clínica encontrada para esta busca.' : 'Nenhuma clínica cadastrada ainda.'}
                    </div>
                )}

                {filtered.map((t, i) => {
                    const st = t.subscription_status ?? 'trial';
                    const colors = STATUS_COLOR[st] ?? STATUS_COLOR.trial;
                    return (
                        <div key={t.id}
                            className="grid grid-cols-12 gap-4 p-4 items-center text-sm hover:bg-[#2A2518] transition-colors"
                            style={{ borderBottom: i < filtered.length - 1 ? '1px solid #33301F' : 'none' }}>

                            <div className="col-span-4 flex flex-col min-w-0">
                                <span className="font-semibold truncate" style={{ color: '#F5EDD8' }}>{t.name}</span>
                                <span className="text-xs truncate mt-0.5" style={{ color: '#9A8E70' }}>/{t.slug}</span>
                            </div>

                            <div className="col-span-2">
                                <span style={{
                                    fontSize: '11px', fontWeight: 700, padding: '3px 10px',
                                    borderRadius: '6px', background: colors.bg,
                                    color: colors.color, border: `1px solid ${colors.border}`,
                                }}>
                                    {STATUS_LABEL[st] ?? st}
                                </span>
                            </div>

                            <div className="col-span-2 text-xs" style={{ color: '#D4C9A8' }}>
                                {calcDaysLeft(t)}
                            </div>

                            <div className="col-span-2 text-xs truncate" style={{ color: '#9A8E70' }}>
                                {t.courtesy_note ?? '—'}
                            </div>

                            <div className="col-span-1 text-right text-xs" style={{ color: '#9A8E70' }}>
                                {formatDate(t.created_at)}
                            </div>

                            <div className="col-span-1 flex justify-center relative">
                                <button
                                    onClick={() => setActiveMenu(activeMenu === t.id ? null : t.id)}
                                    className="p-1.5 rounded-md hover:bg-[#33301F] transition-colors"
                                    style={{ color: '#9A8E70' }}
                                >
                                    ⋯
                                </button>

                                {activeMenu === t.id && (
                                    <div style={{
                                        position: 'absolute', bottom: '100%', right: 0, zIndex: 50,
                                        background: '#1C1A17', border: '1px solid #33301F',
                                        borderRadius: '10px', overflow: 'hidden', minWidth: '200px',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                                    }}>
                                        {[
                                            { label: 'Conceder Cortesia VIP', action: () => { setVipModal(t.id); setActiveMenu(null); } },
                                            { label: 'Ativar (pago)', action: () => startTransition(() => ativarTenant(t.id)) },
                                            { label: 'Converter para Carência 7d', action: () => startTransition(() => converterParaCarencia(t.id)) },
                                            { label: 'Editar dados básicos', action: () => { setEditModal(t); setEditName(t.name); setEditSlug(t.slug); setEditError(''); setActiveMenu(null); } },
                                            { label: 'Expirar agora', action: () => startTransition(() => expirarTenant(t.id)), danger: true },
                                            { label: 'Excluir clínica', action: () => { setDeleteModal(t); setDeleteConfirm(''); setDeleteError(''); setActiveMenu(null); }, danger: true },
                                        ].map(item => (
                                            <button key={item.label}
                                                onClick={() => { item.action(); setActiveMenu(null); }}
                                                disabled={isPending}
                                                style={{
                                                    display: 'block', width: '100%', textAlign: 'left',
                                                    padding: '9px 14px', fontSize: '13px',
                                                    color: (item as { danger?: boolean }).danger ? '#F07070' : '#D4C9A8',
                                                    background: 'transparent', border: 'none', cursor: 'pointer',
                                                    fontFamily: 'inherit',
                                                }}
                                                className="hover:bg-[#2A2518] transition-colors"
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal Cortesia VIP */}
            {vipModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div style={{ background: '#1C1A17', border: '1px solid #33301F', borderRadius: '16px', padding: '28px', width: '380px' }}>
                        <h3 style={{ color: '#F5EDD8', fontFamily: "'Playfair Display', serif", fontSize: '18px', marginBottom: '20px' }}>
                            Conceder Cortesia VIP
                        </h3>
                        <div style={{ marginBottom: '14px' }}>
                            <label style={labelStyle}>Dias de acesso (-1 = infinito)</label>
                            <input type="number" value={vipDays} onChange={e => setVipDays(e.target.value)} placeholder="-1" style={inputStyle} />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={labelStyle}>Nota interna (opcional)</label>
                            <input type="text" value={vipNote} onChange={e => setVipNote(e.target.value)} placeholder="Ex: bônus agente IA" style={inputStyle} />
                        </div>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setVipModal(null)} style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid #33301F', background: 'transparent', color: '#9A8E70', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
                            <button onClick={handleVip} disabled={isPending} style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #D4B86A, #B8960C)', color: '#161412', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                                {isPending ? 'Salvando...' : 'Conceder'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Nova Clínica */}
            {createModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div style={{ background: '#1C1A17', border: '1px solid #33301F', borderRadius: '16px', padding: '28px', width: '420px' }}>
                        <h3 style={{ color: '#F5EDD8', fontFamily: "'Playfair Display', serif", fontSize: '18px', marginBottom: '20px' }}>
                            Nova Clínica
                        </h3>
                        {createSuccess ? (
                            <>
                                <div style={{ background: 'rgba(110,231,160,0.08)', border: '1px solid rgba(110,231,160,0.2)', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
                                    <p style={{ color: '#6EE7A0', fontSize: '13px', margin: 0, lineHeight: 1.6 }}>
                                        ✓ {createSuccess}
                                    </p>
                                    <p style={{ color: '#9A8E70', fontSize: '12px', margin: '8px 0 0' }}>
                                        Guarde a senha em local seguro — não será exibida novamente.
                                    </p>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button onClick={() => { setCreateModal(false); setCreateSuccess(''); }} style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #D4B86A, #B8960C)', color: '#161412', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                                        Fechar
                                    </button>
                                </div>
                            </>
                        ) : (
                            <form onSubmit={handleCreate}>
                                <div style={{ marginBottom: '14px' }}>
                                    <label style={labelStyle}>Nome da clínica *</label>
                                    <input name="name" type="text" required placeholder="Ex: Studio Bella" style={inputStyle} />
                                </div>
                                <div style={{ marginBottom: '14px' }}>
                                    <label style={labelStyle}>Nome da administradora</label>
                                    <input name="adminName" type="text" placeholder="Ex: Ana Lima" style={inputStyle} />
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={labelStyle}>Email da administradora *</label>
                                    <input name="email" type="email" required placeholder="ana@studio.com" style={inputStyle} />
                                </div>
                                {createError && (
                                    <p style={{ color: '#F07070', fontSize: '12px', marginBottom: '12px' }}>⚠ {createError}</p>
                                )}
                                <p style={{ color: '#9A8E70', fontSize: '11px', marginBottom: '16px' }}>
                                    Trial de 7 dias. Senha temporária gerada automaticamente.
                                </p>
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                    <button type="button" onClick={() => setCreateModal(false)} style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid #33301F', background: 'transparent', color: '#9A8E70', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
                                    <button type="submit" disabled={isPending} style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #D4B86A, #B8960C)', color: '#161412', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                                        {isPending ? 'Criando...' : 'Criar Clínica'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Modal Editar */}
            {editModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div style={{ background: '#1C1A17', border: '1px solid #33301F', borderRadius: '16px', padding: '28px', width: '400px' }}>
                        <h3 style={{ color: '#F5EDD8', fontFamily: "'Playfair Display', serif", fontSize: '18px', marginBottom: '20px' }}>
                            Editar Clínica
                        </h3>
                        <div style={{ marginBottom: '14px' }}>
                            <label style={labelStyle}>Nome</label>
                            <input type="text" value={editName} onChange={e => setEditName(e.target.value)} style={inputStyle} />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={labelStyle}>Slug (URL)</label>
                            <input type="text" value={editSlug} onChange={e => setEditSlug(e.target.value)} style={inputStyle} />
                            <p style={{ color: '#9A8E70', fontSize: '11px', marginTop: '4px' }}>Apenas letras minúsculas, números e hífens.</p>
                        </div>
                        {editError && <p style={{ color: '#F07070', fontSize: '12px', marginBottom: '12px' }}>⚠ {editError}</p>}
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setEditModal(null)} style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid #33301F', background: 'transparent', color: '#9A8E70', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
                            <button onClick={handleEdit} disabled={isPending} style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #D4B86A, #B8960C)', color: '#161412', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                                {isPending ? 'Salvando...' : 'Salvar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Excluir */}
            {deleteModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div style={{ background: '#1C1A17', border: '1px solid #4A1515', borderRadius: '16px', padding: '28px', width: '400px' }}>
                        <h3 style={{ color: '#F07070', fontFamily: "'Playfair Display', serif", fontSize: '18px', marginBottom: '12px' }}>
                            Excluir Clínica
                        </h3>
                        <p style={{ color: '#D4C9A8', fontSize: '13px', marginBottom: '16px', lineHeight: 1.6 }}>
                            Esta ação é <strong>irreversível</strong>. Todos os dados (agendamentos, clientes, protocolos) serão removidos permanentemente.
                        </p>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ ...labelStyle, color: '#F07070' }}>
                                Digite <strong style={{ color: '#F5EDD8' }}>{deleteModal.name}</strong> para confirmar
                            </label>
                            <input
                                type="text"
                                value={deleteConfirm}
                                onChange={e => { setDeleteConfirm(e.target.value); setDeleteError(''); }}
                                placeholder={deleteModal.name}
                                style={{ ...inputStyle, border: '1px solid #4A1515' }}
                            />
                        </div>
                        {deleteError && <p style={{ color: '#F07070', fontSize: '12px', marginBottom: '12px' }}>⚠ {deleteError}</p>}
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setDeleteModal(null)} style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid #33301F', background: 'transparent', color: '#9A8E70', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
                            <button
                                onClick={handleDelete}
                                disabled={isPending || deleteConfirm !== deleteModal.name}
                                style={{
                                    padding: '9px 20px', borderRadius: '8px', border: 'none',
                                    background: deleteConfirm === deleteModal.name ? '#C0392B' : '#4A2020',
                                    color: '#F5EDD8', fontSize: '13px', fontWeight: 700,
                                    cursor: deleteConfirm === deleteModal.name ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
                                }}
                            >
                                {isPending ? 'Excluindo...' : 'Excluir definitivamente'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
