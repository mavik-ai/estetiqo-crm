'use client'

import { useState, useTransition } from "react";
import { UserPlus, Shield, User2, MoreVertical, Check, X, AlertTriangle } from "lucide-react";
import { criarMembro, desativarMembro, reativarMembro, excluirMembro } from "./actions";

interface Member {
    id: string;
    name: string;
    email: string;
    role: string;
    active: boolean;
    avatar_initials: string;
    must_change_password: boolean;
}

const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", borderRadius: "9px",
    border: "1px solid var(--border)", background: "var(--muted)",
    fontSize: "13px", color: "var(--foreground)", fontFamily: "inherit", outline: "none",
    boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "10px", fontWeight: 700, color: "#BBA870",
    letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "5px",
};

export function EquipeClient({ members, currentUserId }: { members: Member[]; currentUserId: string }) {
    const [showForm, setShowForm] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [confirmExcluir, setConfirmExcluir] = useState<string | null>(null);

    function handleCreate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
            const res = await criarMembro(fd);
            if (res.error) { setError(res.error); return; }
            setSuccess(true);
            setShowForm(false);
            (e.target as HTMLFormElement).reset();
        });
    }

    function handleToggleActive(member: Member) {
        setOpenMenu(null);
        startTransition(async () => {
            const res = member.active ? await desativarMembro(member.id) : await reativarMembro(member.id);
            if (res.error) setError(res.error);
        });
    }

    function handleExcluir(memberId: string) {
        setOpenMenu(null);
        setConfirmExcluir(null);
        startTransition(async () => {
            const res = await excluirMembro(memberId);
            if (res.error) setError(res.error);
        });
    }

    const roleLabel = (r: string) => r === 'admin' ? 'Administradora' : 'Profissional';
    const roleIcon = (r: string) => r === 'admin' ? <Shield size={11} strokeWidth={2} /> : <User2 size={11} strokeWidth={2} />;

    return (
        <div style={{ maxWidth: "700px" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                <div>
                    <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 700, color: "var(--foreground)", margin: 0 }}>
                        Equipe
                    </h1>
                    <p style={{ color: "var(--muted-foreground)", fontSize: "13px", marginTop: "4px" }}>
                        {members.length} membro{members.length !== 1 ? "s" : ""} cadastrado{members.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <button
                    onClick={() => { setShowForm(v => !v); setError(null); setSuccess(false); }}
                    style={{
                        display: "flex", alignItems: "center", gap: "6px",
                        padding: "9px 16px", borderRadius: "9px", border: "none",
                        background: showForm ? "#F5EDE0" : "linear-gradient(135deg, #D4B86A, #B8960C)",
                        color: showForm ? "#8A7E60" : "#161412",
                        fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                    }}
                >
                    {showForm ? <X size={14} /> : <UserPlus size={14} />}
                    {showForm ? "Cancelar" : "Novo membro"}
                </button>
            </div>

            {/* Mensagens */}
            {error && (
                <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(217,68,68,0.07)", border: "1px solid rgba(217,68,68,0.2)", color: "#D94444", fontSize: "13px", marginBottom: "16px" }}>
                    {error}
                </div>
            )}
            {success && (
                <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(45,140,78,0.07)", border: "1px solid rgba(45,140,78,0.2)", color: "#2D8C4E", fontSize: "13px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Check size={14} /> Membro cadastrado com sucesso!
                </div>
            )}

            {/* Formulário novo membro */}
            {showForm && (
                <form onSubmit={handleCreate} style={{
                    background: "var(--card)", border: "1px solid var(--border)", borderRadius: "14px",
                    padding: "22px", marginBottom: "20px",
                    borderTop: "3px solid #B8960C",
                }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--foreground)", marginBottom: "16px" }}>
                        Novo membro da equipe
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                        <div>
                            <label style={labelStyle}>Nome completo *</label>
                            <input name="name" required placeholder="Ex: Ana Paula Silva" style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Email *</label>
                            <input name="email" type="email" required placeholder="ana@clinica.com" style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Papel</label>
                            <select name="role" style={inputStyle}>
                                <option value="operator">Profissional</option>
                                <option value="admin">Administradora</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ marginTop: "12px", padding: "10px 12px", borderRadius: "8px", background: "#FBF5EA", border: "1px solid #EDE5D3", fontSize: "12px", color: "#8A7E60" }}>
                        Uma senha temporária será gerada. O membro deverá alterá-la no primeiro acesso.
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
                        <button type="submit" disabled={isPending} style={{
                            padding: "9px 22px", borderRadius: "9px", border: "none",
                            background: isPending ? "#EDE5D3" : "linear-gradient(135deg, #D4B86A, #B8960C)",
                            color: "#161412", fontSize: "13px", fontWeight: 700,
                            cursor: isPending ? "not-allowed" : "pointer", fontFamily: "inherit",
                        }}>
                            {isPending ? "Criando..." : "Criar membro"}
                        </button>
                    </div>
                </form>
            )}

            {/* Lista */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {members.map(member => (
                    <div key={member.id} style={{
                        background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px",
                        padding: "14px 16px", display: "flex", alignItems: "center", gap: "14px",
                        opacity: member.active ? 1 : 0.6,
                        position: "relative",
                    }}>
                        {/* Avatar */}
                        <div style={{
                            width: "40px", height: "40px", borderRadius: "50%", flexShrink: 0,
                            background: member.active ? "linear-gradient(135deg, #D4B86A, #B8960C)" : "#D5CAB8",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "13px", fontWeight: 700, color: "#FFFDF7",
                        }}>
                            {member.avatar_initials || member.name.split(' ').slice(0, 2).map(p => p[0]?.toUpperCase()).join('')}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--foreground)" }}>
                                    {member.name}
                                </span>
                                {member.id === currentUserId && (
                                    <span style={{ fontSize: "10px", fontWeight: 700, color: "#B8960C", background: "rgba(184,150,12,0.1)", border: "1px solid rgba(184,150,12,0.2)", borderRadius: "6px", padding: "1px 6px" }}>
                                        Você
                                    </span>
                                )}
                                {!member.active && (
                                    <span style={{ fontSize: "10px", fontWeight: 700, color: "#D94444", background: "rgba(217,68,68,0.08)", border: "1px solid rgba(217,68,68,0.2)", borderRadius: "6px", padding: "1px 6px" }}>
                                        Inativo
                                    </span>
                                )}
                                {member.must_change_password && member.active && (
                                    <span style={{ fontSize: "10px", fontWeight: 700, color: "#E07B00", background: "rgba(224,123,0,0.08)", border: "1px solid rgba(224,123,0,0.2)", borderRadius: "6px", padding: "1px 6px" }}>
                                        Senha temporária
                                    </span>
                                )}
                            </div>
                            <div style={{ fontSize: "12px", color: "var(--muted-foreground)", marginTop: "2px" }}>
                                {member.email}
                            </div>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", marginTop: "4px", fontSize: "11px", color: "#8A7E60", background: "#F5EDE0", borderRadius: "6px", padding: "2px 7px" }}>
                                {roleIcon(member.role)}
                                {roleLabel(member.role)}
                            </div>
                        </div>

                        {/* Menu de ações — só para outros membros */}
                        {member.id !== currentUserId && (
                            <div style={{ position: "relative", flexShrink: 0 }}>
                                <button
                                    onClick={() => setOpenMenu(openMenu === member.id ? null : member.id)}
                                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: "4px", borderRadius: "6px" }}
                                >
                                    <MoreVertical size={16} strokeWidth={1.5} />
                                </button>

                                {openMenu === member.id && (
                                    <div style={{
                                        position: "absolute", top: "100%", right: 0, zIndex: 20,
                                        background: "var(--popover)", border: "1px solid var(--border)",
                                        borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                                        minWidth: "170px", overflow: "hidden",
                                    }}>
                                        <button
                                            onClick={() => handleToggleActive(member)}
                                            disabled={isPending}
                                            style={{
                                                width: "100%", textAlign: "left", padding: "10px 14px",
                                                background: "none", border: "none", cursor: "pointer",
                                                fontSize: "13px", color: "var(--foreground)", fontFamily: "inherit",
                                                display: "flex", alignItems: "center", gap: "8px",
                                            }}
                                        >
                                            {member.active ? <X size={13} /> : <Check size={13} />}
                                            {member.active ? "Desativar" : "Reativar"}
                                        </button>
                                        <div style={{ borderTop: "1px solid var(--border)" }} />
                                        {confirmExcluir === member.id ? (
                                            <div style={{ padding: "10px 14px" }}>
                                                <p style={{ fontSize: "12px", color: "#D94444", margin: "0 0 8px", display: "flex", alignItems: "center", gap: "6px" }}>
                                                    <AlertTriangle size={12} /> Confirmar exclusão?
                                                </p>
                                                <div style={{ display: "flex", gap: "6px" }}>
                                                    <button onClick={() => handleExcluir(member.id)} disabled={isPending}
                                                        style={{ flex: 1, padding: "6px", borderRadius: "6px", border: "none", background: "#D94444", color: "#fff", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                                                        Excluir
                                                    </button>
                                                    <button onClick={() => setConfirmExcluir(null)}
                                                        style={{ flex: 1, padding: "6px", borderRadius: "6px", border: "1px solid var(--border)", background: "none", color: "var(--muted-foreground)", fontSize: "12px", cursor: "pointer", fontFamily: "inherit" }}>
                                                        Cancelar
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setConfirmExcluir(member.id)}
                                                style={{
                                                    width: "100%", textAlign: "left", padding: "10px 14px",
                                                    background: "none", border: "none", cursor: "pointer",
                                                    fontSize: "13px", color: "#D94444", fontFamily: "inherit",
                                                    display: "flex", alignItems: "center", gap: "8px",
                                                }}
                                            >
                                                Excluir
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {members.length === 0 && (
                    <div style={{ textAlign: "center", padding: "40px", color: "var(--muted-foreground)", fontSize: "14px" }}>
                        Nenhum membro cadastrado.
                    </div>
                )}
            </div>
        </div>
    );
}
