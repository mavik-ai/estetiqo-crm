'use client'

import { useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Phone, Calendar, MapPin, Star, Clock, User,
    Mail, Pencil, X, Plus, Check, ChevronDown, Trash2, FileText,
} from "lucide-react";
import { atualizarCampoCliente, adicionarNota, atualizarRating } from "@/app/(dashboard)/clientes/clienteActions";
import { excluirCliente } from "@/app/(dashboard)/clientes/actions";

// ── Types ──────────────────────────────────────────────────────────────────
interface ClienteFichaClientProps {
    id: string;
    isModal: boolean;
    client: any;
    health: any;
    appointments: any[];
    protocols: any[];
    notes: any[];
}

// ── Helpers ────────────────────────────────────────────────────────────────
function calcularIdade(birth_date: string | null): string {
    if (!birth_date) return "";
    const ano = birth_date.split('-')[0];
    if (ano === '2000') return ""; // ano placeholder, não calcula
    return String(Math.floor((Date.now() - new Date(birth_date).getTime()) / (365.25 * 24 * 3600 * 1000)));
}
function formatarAniversario(iso: string | null): string {
    if (!iso) return "—";
    const p = iso.split("-");
    const ano = p[0];
    const dd = p[2]; const mm = p[1];
    if (ano === '2000') return `${dd}/${mm}`; // Sem ano
    return `${dd}/${mm}/${ano}`;
}
function extractBirthParts(iso: string | null): { day: string; month: string; year: string } {
    if (!iso) return { day: '', month: '', year: '' };
    const p = iso.split('-');
    return {
        day: p[2] ?? '',
        month: p[1] ?? '',
        year: p[0] === '2000' ? '' : (p[0] ?? ''),
    };
}
function formatarDataCurta(iso: string | null): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}
function formatarHora(iso: string | null): string {
    if (!iso) return "";
    return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}
function getInitials(name: string): string {
    return name.split(" ").slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
}
function sexLabel(sex: string | null): string {
    if (sex === "F") return "Feminino";
    if (sex === "M") return "Masculino";
    if (sex === "O") return "Outro";
    return "—";
}
function statusInfo(status: string | null): { label: string; color: string } {
    switch (status) {
        case "confirmed": return { label: "Confirmado", color: "#2D8C4E" };
        case "cancelled": return { label: "Cancelado", color: "#D94444" };
        default: return { label: "Aguardando", color: "#B8960C" };
    }
}

// Tradução dos campos da ficha clínica (snake_case → PT-BR)
const HEALTH_LABELS: Record<string, string> = {
    smoker: "Fumante",
    allergy: "Alergia",
    pregnancy: "Gravidez",
    heart_disease: "Cardiopatia",
    anemia: "Anemia",
    depression: "Depressão",
    hypertension: "Hipertensão",
    previous_aesthetic_treatment: "Tratamento Estético Anterior",
    herpes: "Herpes",
    keloid: "Quelóide",
    diabetes: "Diabetes",
    hepatitis: "Hepatite",
    hiv: "HIV",
    skin_disease: "Doença de Pele",
    cancer: "Câncer",
    contraceptive: "Anticoncepcional",
};
const HEALTH_EXCLUDE = ["id", "client_id", "other_conditions", "created_at", "updated_at",
    "weight_kg", "abs_cm", "abi_cm", "aesthetic_notes", "objectives"];

// ── Styles ─────────────────────────────────────────────────────────────────
const card: React.CSSProperties = {
    background: "white", border: "1px solid var(--border)",
    borderRadius: "12px", padding: "16px", marginBottom: "10px",
};
const cardTitle: React.CSSProperties = {
    fontFamily: "'Playfair Display', serif", fontSize: "13px",
    fontWeight: 700, color: "var(--foreground)", marginBottom: "10px",
};
const infoLabel: React.CSSProperties = {
    fontSize: "10px", fontWeight: 700, color: "#BBA870",
    letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "1px",
};
const infoValue: React.CSSProperties = { fontSize: "13px", color: "var(--foreground)", fontWeight: 500 };

// ── InlineEditField ────────────────────────────────────────────────────────
function InlineEditField({ label, value, icon: Icon, clientId, campo, isSex }:
    { label: string; value: string; icon: any; clientId: string; campo: 'phone' | 'email' | 'sex' | 'birth_date'; isSex?: boolean; }) {
    const [isHovered, setIsHovered] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editVal, setEditVal] = useState(value === "—" ? "" : value);
    const [currentVal, setCurrentVal] = useState(value);
    const [isPending, startTransition] = useTransition();

    const handleSave = (val?: string) => {
        const finalVal = val ?? editVal;
        startTransition(async () => {
            const r = await atualizarCampoCliente(clientId, campo, finalVal);
            if (!r.error) setCurrentVal(finalVal || "—");
            setIsEditing(false);
        });
    };

    if (isEditing) return (
        <div style={{ padding: "6px 8px", background: "rgba(184,150,12,0.05)", borderRadius: "8px", margin: "0 -8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", ...infoLabel }}><Icon size={10} />{label}</div>
            {isSex ? (
                <div style={{ display: "flex", gap: "5px", marginTop: "4px" }}>
                    <select autoFocus value={editVal} onChange={e => setEditVal(e.target.value)} disabled={isPending}
                        style={{ flex: 1, fontSize: "13px", padding: "4px 8px", border: "1px solid var(--border)", borderRadius: "6px", background: "var(--background)", color: "var(--foreground)", outline: "none" }}>
                        <option value="">Não informado</option>
                        <option value="F">Feminino</option>
                        <option value="M">Masculino</option>
                        <option value="O">Outro</option>
                    </select>
                    <button onClick={() => handleSave()} disabled={isPending} style={{ background: "#B8960C", border: "none", borderRadius: "6px", padding: "4px 8px", cursor: "pointer", color: "white" }}><Check size={12} /></button>
                    <button onClick={() => setIsEditing(false)} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "6px", padding: "4px 8px", cursor: "pointer" }}><X size={12} /></button>
                </div>
            ) : (
                <div style={{ display: "flex", gap: "5px", marginTop: "4px" }}>
                    <input autoFocus value={editVal} onChange={e => setEditVal(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setIsEditing(false); }}
                        disabled={isPending}
                        style={{ flex: 1, fontSize: "13px", padding: "4px 8px", border: "1px solid var(--border)", borderRadius: "6px", background: "var(--background)", color: "var(--foreground)", outline: "none" }} />
                    <button onClick={() => handleSave()} disabled={isPending} style={{ background: "#B8960C", border: "none", borderRadius: "6px", padding: "4px 8px", cursor: "pointer", color: "white" }}><Check size={12} /></button>
                    <button onClick={() => setIsEditing(false)} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "6px", padding: "4px 8px", cursor: "pointer" }}><X size={12} /></button>
                </div>
            )}
        </div>
    );

    return (
        <div onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}
            onClick={() => setIsEditing(true)}
            style={{ position: "relative", padding: "4px 8px", margin: "0 -8px", borderRadius: "6px", background: isHovered ? "rgba(184,150,12,0.05)" : "transparent", cursor: "pointer", transition: "background 0.15s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", ...infoLabel }}><Icon size={10} />{label}</div>
            <div style={{ ...infoValue, paddingRight: "18px", color: currentVal === "—" ? "#BBA870" : "var(--foreground)" }}>{currentVal}</div>
            {isHovered && <Pencil size={11} style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", color: "#B8960C" }} />}
        </div>
    );
}

// ── Rating Stars: clicáveis inline ─────────────────────────────────────────
function InlineRating({ clientId, initialRating }: { clientId: string; initialRating: number | null }) {
    const [rating, setRating] = useState(initialRating ?? 0);
    const [hovered, setHovered] = useState(0);
    const [isPending, startTransition] = useTransition();

    const handleClick = (val: number) => {
        startTransition(async () => {
            await atualizarRating(clientId, val);
            setRating(val);
        });
    };

    return (
        <div style={{ display: "flex", gap: "2px", cursor: "pointer" }}>
            {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} size={16} strokeWidth={1.5}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => handleClick(i)}
                    style={{
                        fill: i <= (hovered || rating) ? "#B8960C" : "transparent",
                        color: i <= (hovered || rating) ? "#B8960C" : "#D4B86A",
                        transition: "all 0.12s",
                        opacity: isPending ? 0.6 : 1,
                    }} />
            ))}
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────
export function ClienteFichaClient({ id, isModal, client, health, appointments, protocols, notes: initialNotes }: ClienteFichaClientProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'historico' | 'saude'>('historico');
    const [isNovaNotaOpen, setIsNovaNotaOpen] = useState(false);
    const [novaNotaText, setNovaNotaText] = useState("");
    const [notes, setNotes] = useState(initialNotes ?? []);
    const [isPendingNota, startNotaTransition] = useTransition();
    const [isPendingExcluir, startExcluirTransition] = useTransition();
    const [showAdicionarMenu, setShowAdicionarMenu] = useState(false);
    const [showMaisOpcoesMenu, setShowMaisOpcoesMenu] = useState(false);
    const adicionarRef = useRef<HTMLDivElement>(null);
    const maisRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (adicionarRef.current && !adicionarRef.current.contains(e.target as Node)) setShowAdicionarMenu(false);
            if (maisRef.current && !maisRef.current.contains(e.target as Node)) setShowMaisOpcoesMenu(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const initials = getInitials(client.name ?? "");
    const whatsappUrl = client.phone ? `https://wa.me/55${(client.phone as string).replace(/\D/g, "")}` : null;
    const emailUrl = client.email ? `mailto:${client.email}` : null;
    const aniversario = formatarAniversario(client.birth_date);
    const idade = calcularIdade(client.birth_date);

    const handleSalvarNota = () => {
        if (!novaNotaText.trim()) return;
        startNotaTransition(async () => {
            const r = await adicionarNota(id, novaNotaText);
            if (!r.error) {
                setNotes(prev => [{ id: Date.now().toString(), content: novaNotaText, created_at: new Date().toISOString() }, ...prev]);
                setNovaNotaText(""); setIsNovaNotaOpen(false);
            }
        });
    };

    const handleExcluir = () => {
        if (!confirm(`Confirmar exclusão de "${client.name}"? Esta ação não pode ser desfeita.`)) return;
        startExcluirTransition(async () => {
            const r = await excluirCliente(id);
            if (r.error) { alert(r.error); return; }
            router.push("/clientes");
        });
    };

    // Serviços únicos realizados
    const servicosRealizados = Array.from(
        new Set(appointments.filter(a => a.services?.name).map(a => a.services.name as string))
    );

    const dropBtn: React.CSSProperties = {
        display: "flex", alignItems: "center", gap: "8px", padding: "9px 14px",
        border: "none", background: "none", cursor: "pointer", fontSize: "13px",
        color: "var(--foreground)", width: "100%", textAlign: "left", fontWeight: 500,
    };

    return (
        <div style={{ fontFamily: "var(--font-urbanist), sans-serif", height: "100%", display: "flex", flexDirection: "column" }}>

            {/* ── CABEÇALHO ─── */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "16px", paddingBottom: "14px", borderBottom: "1px solid var(--border)", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "linear-gradient(135deg, #D4B86A, #B8960C)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFDF7", fontSize: "17px", fontWeight: 700, flexShrink: 0 }}>
                        {initials}
                    </div>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "21px", fontWeight: 700, margin: 0, lineHeight: 1.2 }}>{client.name}</h1>
                            <InlineRating clientId={id} initialRating={client.rating} />
                        </div>
                        <div style={{ display: "flex", gap: "12px", marginTop: "4px", flexWrap: "wrap" }}>
                            {client.phone && <span style={{ fontSize: "12px", color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: "4px" }}><Phone size={11} />{client.phone}</span>}
                            {client.email && <span style={{ fontSize: "12px", color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: "4px" }}><Mail size={11} />{client.email}</span>}
                        </div>
                    </div>
                </div>

                {/* Botões de Ação */}
                <div style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
                    <div ref={adicionarRef} style={{ position: "relative" }}>
                        <button onClick={() => setShowAdicionarMenu(v => !v)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "9px", background: "linear-gradient(135deg, #D4B86A, #B8960C)", border: "none", color: "#161412", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>
                            <Plus size={14} /> Adicionar <ChevronDown size={13} />
                        </button>
                        {showAdicionarMenu && (
                            <div style={{ position: "absolute", top: "calc(100% + 4px)", right: 0, background: "white", border: "1px solid var(--border)", borderRadius: "10px", boxShadow: "0 8px 20px rgba(0,0,0,0.12)", minWidth: "195px", zIndex: 50, overflow: "hidden" }}>
                                <Link href={`/agenda/novo?cliente=${id}`} onClick={() => setShowAdicionarMenu(false)} style={{ ...dropBtn, textDecoration: "none" }}>
                                    <Calendar size={15} color="#B8960C" /> Novo Agendamento
                                </Link>
                                <Link href={`/protocolos/novo?cliente=${id}`} onClick={() => setShowAdicionarMenu(false)} style={{ ...dropBtn, textDecoration: "none", borderTop: "1px solid var(--border)" }}>
                                    <Clock size={15} color="#B8960C" /> Novo Protocolo
                                </Link>
                            </div>
                        )}
                    </div>

                    <div ref={maisRef} style={{ position: "relative" }}>
                        <button onClick={() => setShowMaisOpcoesMenu(v => !v)} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "8px 14px", borderRadius: "9px", background: "var(--card)", border: "1px solid var(--border)", fontWeight: 600, fontSize: "13px", cursor: "pointer", color: "var(--foreground)" }}>
                            ⋯ Mais opções
                        </button>
                        {showMaisOpcoesMenu && (
                            <div style={{ position: "absolute", top: "calc(100% + 4px)", right: 0, background: "white", border: "1px solid var(--border)", borderRadius: "10px", boxShadow: "0 8px 20px rgba(0,0,0,0.12)", minWidth: "175px", zIndex: 50, overflow: "hidden" }}>
                                <Link href={`/clientes/${id}/editar`} onClick={() => setShowMaisOpcoesMenu(false)} style={{ ...dropBtn, textDecoration: "none" }}>
                                    <Pencil size={14} color="#B8960C" /> Editar cliente
                                </Link>
                                <Link href={`/clientes/${id}/avaliacao/documento`} onClick={() => setShowMaisOpcoesMenu(false)} style={{ ...dropBtn, textDecoration: "none", borderTop: "1px solid var(--border)" }}>
                                    <FileText size={14} color="#B8960C" /> Documento de avaliação
                                </Link>
                                <button onClick={() => { setShowMaisOpcoesMenu(false); handleExcluir(); }}
                                    disabled={isPendingExcluir}
                                    style={{ ...dropBtn, borderTop: "1px solid var(--border)", color: "#D94444" }}>
                                    <Trash2 size={14} /> Excluir cliente
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── LAYOUT 2 COLUNAS ─── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 290px", gap: "18px", flex: 1, minHeight: 0, overflow: "hidden" }}>

                {/* COLUNA ESQUERDA: Histórico */}
                <div style={{ overflowY: "auto", paddingRight: "4px" }}>
                    <div style={{ display: "flex", gap: "20px", borderBottom: "1px solid var(--border)", marginBottom: "14px" }}>
                        {[{ id: "historico", label: "Histórico de Atividades" }, { id: "saude", label: "Ficha Clínica" }].map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                                style={{ padding: "9px 2px", background: "none", border: "none", borderBottom: activeTab === tab.id ? "2px solid #B8960C" : "2px solid transparent", color: activeTab === tab.id ? "#B8960C" : "var(--muted-foreground)", fontWeight: activeTab === tab.id ? 700 : 500, fontSize: "13px", cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }}>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {activeTab === "historico" && (
                        <div>
                            {/* Protocolos — clicáveis */}
                            {protocols.length > 0 && (
                                <div style={card}>
                                    <h2 style={cardTitle}>Protocolos ({protocols.length})</h2>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                        {protocols.map(proto => (
                                            <Link key={proto.id} href={`/protocolos/${proto.id}`}
                                                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", background: "#FBF5EA", borderRadius: "8px", textDecoration: "none", transition: "background 0.15s" }}
                                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#F3E8C8"}
                                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "#FBF5EA"}>
                                                <div>
                                                    <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--foreground)" }}>{proto.services?.name ?? "Protocolo"}</span>
                                                    <div style={{ fontSize: "11px", color: "var(--muted-foreground)", marginTop: "2px" }}>
                                                        {proto.completed_sessions}/{proto.total_sessions} sessões
                                                    </div>
                                                </div>
                                                <span style={{ fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "20px", background: proto.status === "active" ? "#D1FAE5" : "#F5F5F4", color: proto.status === "active" ? "#059669" : "#888", flexShrink: 0 }}>
                                                    {proto.status === "active" ? "Ativo" : proto.status === "completed" ? "Concluído" : "Cancelado"}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Timeline de Sessões */}
                            <div style={card}>
                                <h2 style={cardTitle}>Sessões & Atendimentos</h2>
                                {appointments.length === 0 ? (
                                    <div style={{ textAlign: "center", padding: "18px 0", color: "var(--muted-foreground)", fontSize: "13px" }}>
                                        <Clock size={22} strokeWidth={1.2} style={{ color: "#EDE5D3", margin: "0 auto 8px", display: "block" }} />
                                        Nenhum atendimento registrado.
                                    </div>
                                ) : (
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        {appointments.map((appt: any, idx: number) => {
                                            const st = statusInfo(appt.rsvp_status);
                                            const isPast = new Date(appt.starts_at) < new Date();
                                            return (
                                                <div key={appt.id} style={{ display: "flex", gap: "12px", paddingBottom: "14px", marginBottom: idx < appointments.length - 1 ? "14px" : 0, borderBottom: idx < appointments.length - 1 ? "1px solid var(--border)" : "none" }}>
                                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                                                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: isPast ? "#C4A84A" : "#2D8C4E", marginTop: "5px" }} />
                                                        {idx < appointments.length - 1 && <div style={{ width: "1px", flex: 1, background: "var(--border)", minHeight: "24px", marginTop: "4px" }} />}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                                                            <div>
                                                                <span style={{ fontSize: "13px", fontWeight: 600 }}>{appt.services?.name ?? "Atendimento"}</span>
                                                                <div style={{ fontSize: "11px", color: "var(--muted-foreground)", marginTop: "2px" }}>
                                                                    {formatarDataCurta(appt.starts_at)} às {formatarHora(appt.starts_at)}
                                                                    {appt.protocols && <span style={{ marginLeft: "6px" }}>· Sessão {appt.protocols.completed_sessions}/{appt.protocols.total_sessions}</span>}
                                                                </div>
                                                            </div>
                                                            <span style={{ fontSize: "10px", fontWeight: 600, padding: "2px 7px", borderRadius: "12px", background: `${st.color}18`, color: st.color, flexShrink: 0 }}>
                                                                {st.label}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "saude" && (
                        <div style={card}>
                            <h2 style={cardTitle}>Ficha Clínica</h2>
                            {!health ? (
                                <div style={{ textAlign: "center", padding: "20px 0", color: "var(--muted-foreground)", fontSize: "13px" }}>
                                    <User size={22} strokeWidth={1.2} style={{ color: "#EDE5D3", margin: "0 auto 8px", display: "block" }} />
                                    Nenhuma avaliação preenchida.
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    {Object.keys(health)
                                        .filter(k => !HEALTH_EXCLUDE.includes(k) && health[k] === true)
                                        .map(key => (
                                            <div key={key} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 12px", background: "#FFF8E8", borderRadius: "8px", borderLeft: "3px solid #D4B86A" }}>
                                                <Check size={12} color="#B8960C" />
                                                <span style={{ fontSize: "13px", fontWeight: 500 }}>
                                                    {HEALTH_LABELS[key] ?? key.replace(/_/g, " ")}
                                                </span>
                                            </div>
                                        ))
                                    }
                                    {health.other_conditions && (
                                        <div style={{ marginTop: "6px", padding: "10px 12px", background: "#FBF5EA", borderRadius: "8px" }}>
                                            <strong style={{ fontSize: "10px", color: "#BBA870", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Outras condições</strong>
                                            <p style={{ margin: 0, fontSize: "13px" }}>{health.other_conditions}</p>
                                        </div>
                                    )}
                                    {health.aesthetic_notes && (
                                        <div style={{ padding: "10px 12px", background: "#FBF5EA", borderRadius: "8px" }}>
                                            <strong style={{ fontSize: "10px", color: "#BBA870", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Observações Estéticas</strong>
                                            <p style={{ margin: 0, fontSize: "13px" }}>{health.aesthetic_notes}</p>
                                        </div>
                                    )}
                                    {health.objectives && (
                                        <div style={{ padding: "10px 12px", background: "#FBF5EA", borderRadius: "8px" }}>
                                            <strong style={{ fontSize: "10px", color: "#BBA870", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Objetivos</strong>
                                            <p style={{ margin: 0, fontSize: "13px" }}>{health.objectives}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* COLUNA DIREITA: Sidebar */}
                <div style={{ overflowY: "auto", display: "flex", flexDirection: "column" }}>

                    {/* Ações Rápidas */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "10px" }}>
                        {[
                            { label: "WhatsApp", icon: <Phone size={15} color="#25D366" />, href: whatsappUrl },
                            { label: "E-mail", icon: <Mail size={15} color="#B8960C" />, href: emailUrl },
                        ].map(btn => btn.href ? (
                            <a key={btn.label} href={btn.href} target="_blank" rel="noopener noreferrer"
                                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "10px", borderRadius: "9px", background: "white", border: "1px solid var(--border)", textDecoration: "none", color: "var(--foreground)", transition: "border-color 0.15s" }}>
                                {btn.icon}
                                <span style={{ fontSize: "11px", fontWeight: 600 }}>{btn.label}</span>
                            </a>
                        ) : (
                            <div key={btn.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "10px", borderRadius: "9px", background: "var(--card)", border: "1px solid var(--border)", opacity: 0.4, cursor: "not-allowed" }}>
                                {btn.icon}
                                <span style={{ fontSize: "11px", fontWeight: 600 }}>{btn.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Dados Básicos */}
                    <div style={card}>
                        <h2 style={cardTitle}>Dados Básicos</h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <InlineEditField label="Telefone" value={client.phone ?? "—"} icon={Phone} clientId={id} campo="phone" />
                            <InlineEditField label="E-mail" value={client.email ?? "—"} icon={Mail} clientId={id} campo="email" />
                            <InlineEditField
                                label="Aniversário"
                                value={aniversario + (idade ? ` (${idade} anos)` : "")}
                                icon={Calendar} clientId={id} campo="birth_date" />
                            <InlineEditField label="Sexo" value={client.sex ? sexLabel(client.sex) : "—"} icon={User} clientId={id} campo="sex" isSex={true} />
                            {client.address && (
                                <div style={{ padding: "4px 8px", margin: "0 -8px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "4px", ...infoLabel }}><MapPin size={10} />Endereço</div>
                                    <div style={{ ...infoValue, fontSize: "12px", lineHeight: 1.5, color: "var(--muted-foreground)" }}>{client.address}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Produtos & Serviços */}
                    <div style={card}>
                        <h2 style={cardTitle}>Produtos & Serviços</h2>
                        {servicosRealizados.length === 0 ? (
                            <p style={{ margin: 0, fontSize: "12px", color: "var(--muted-foreground)" }}>Nenhum serviço realizado.</p>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                                {servicosRealizados.map(srv => (
                                    <div key={srv} style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "12px", fontWeight: 500 }}>
                                        <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#B8960C", flexShrink: 0 }} />
                                        {srv}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Notas Internas */}
                    <div style={card}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                            <h2 style={{ ...cardTitle, marginBottom: 0 }}>Notas Internas</h2>
                            <button onClick={() => setIsNovaNotaOpen(true)} style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "10px", fontWeight: 700, background: "#161412", color: "#FFFDF7", border: "none", padding: "4px 9px", borderRadius: "6px", cursor: "pointer" }}>
                                <Plus size={10} /> Nova
                            </button>
                        </div>
                        {notes.length === 0 ? (
                            <p style={{ margin: 0, fontSize: "12px", color: "var(--muted-foreground)" }}>Nenhuma anotação.</p>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                {notes.slice(0, 5).map((n: any) => (
                                    <div key={n.id} style={{ padding: "8px 10px", background: "#FBF5EA", borderRadius: "8px", borderLeft: "3px solid #D4B86A" }}>
                                        <p style={{ margin: "0 0 3px", fontSize: "12px" }}>{n.content}</p>
                                        <span style={{ fontSize: "10px", color: "var(--muted-foreground)" }}>
                                            {formatarDataCurta(n.created_at)}
                                        </span>
                                    </div>
                                ))}
                                {notes.length > 5 && <p style={{ fontSize: "11px", color: "var(--muted-foreground)", margin: 0, textAlign: "center" }}>+{notes.length - 5} notas mais antigas</p>}
                            </div>
                        )}
                    </div>

                    {/* Metadados */}
                    <div style={{ ...card, marginBottom: 0 }}>
                        <h2 style={cardTitle}>Registro</h2>
                        <div style={{ fontSize: "11px", color: "var(--muted-foreground)", display: "flex", flexDirection: "column", gap: "4px" }}>
                            <span>
                                <strong style={{ color: "#BBA870" }}>Criado em</strong>{" "}
                                {formatarDataCurta(client.created_at)} às {formatarHora(client.created_at)}
                            </span>
                            {client.updated_at && client.updated_at !== client.created_at && (
                                <span>
                                    <strong style={{ color: "#BBA870" }}>Atualizado em</strong>{" "}
                                    {formatarDataCurta(client.updated_at)} às {formatarHora(client.updated_at)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal: Nova Nota */}
            {isNovaNotaOpen && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ background: "var(--background)", borderRadius: "14px", padding: "22px", width: "380px", maxWidth: "90%", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                            <h3 style={{ margin: 0, ...cardTitle }}>Nova Nota Interna</h3>
                            <button onClick={() => setIsNovaNotaOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={16} /></button>
                        </div>
                        <p style={{ fontSize: "11px", color: "var(--muted-foreground)", margin: "0 0 10px" }}>
                            Visível apenas para a equipe interna. A cliente não tem acesso.
                        </p>
                        <textarea placeholder="Observação sobre esta cliente..." rows={4} value={novaNotaText}
                            onChange={e => setNovaNotaText(e.target.value)}
                            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--card)", outline: "none", fontFamily: "var(--font-urbanist)", resize: "vertical", boxSizing: "border-box", fontSize: "13px" }} disabled={isPendingNota} />
                        <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                            <button onClick={handleSalvarNota} disabled={isPendingNota || !novaNotaText.trim()}
                                style={{ flex: 1, padding: "9px", borderRadius: "8px", background: "#161412", color: "#FFFDF7", fontWeight: 700, border: "none", cursor: "pointer", opacity: !novaNotaText.trim() ? 0.6 : 1, fontSize: "13px" }}>
                                {isPendingNota ? "Salvando..." : "Salvar nota"}
                            </button>
                            <button onClick={() => setIsNovaNotaOpen(false)} style={{ padding: "9px 14px", borderRadius: "8px", background: "var(--card)", border: "1px solid var(--border)", cursor: "pointer" }}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
