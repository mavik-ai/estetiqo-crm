'use client'

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Plus, Pencil, Trash2, Clock, ToggleLeft, ToggleRight, X } from "lucide-react";

interface Service {
    id: string;
    name: string;
    price: number | null;
    duration_minutes: number | null;
    is_active: boolean | null;
}

interface ModalState {
    open: boolean;
    mode: "create" | "edit";
    service: Partial<Service> | null;
}

const card: React.CSSProperties = {
    background: "#FFFFFF",
    border: "1px solid #EDE5D3",
    borderRadius: "14px",
};

const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    background: "#FFFFFF",
    border: "1px solid #EDE5D3",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#2D2319",
    outline: "none",
    fontFamily: "var(--font-urbanist), sans-serif",
    boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "12px",
    fontWeight: 600,
    color: "#BBA870",
    marginBottom: "5px",
    letterSpacing: "0.03em",
};

function formatPrice(price: number | null): string {
    if (price === null || price === undefined) return "—";
    return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ServicosPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<ModalState>({ open: false, mode: "create", service: null });
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);

    const supabase = createClient();

    const fetchServices = useCallback(async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
            .from("users")
            .select("tenant_id")
            .eq("id", user.id)
            .single();

        if (!profile?.tenant_id) return;

        const { data } = await supabase
            .from("services")
            .select("id, name, price, duration_minutes, is_active")
            .eq("tenant_id", profile.tenant_id)
            .order("name");

        setServices(data ?? []);
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        void fetchServices();
    }, [fetchServices]);

    function openCreate() {
        setModal({ open: true, mode: "create", service: { name: "", price: null, duration_minutes: null } });
    }

    function openEdit(service: Service) {
        setModal({ open: true, mode: "edit", service: { ...service } });
    }

    function closeModal() {
        if (saving) return;
        setModal({ open: false, mode: "create", service: null });
    }

    function updateField(field: keyof Service, value: string | number | boolean | null) {
        setModal((prev) => ({
            ...prev,
            service: { ...prev.service, [field]: value },
        }));
    }

    async function salvar() {
        if (!modal.service?.name?.trim()) return;
        setSaving(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setSaving(false); return; }

        const { data: profile } = await supabase
            .from("users")
            .select("tenant_id")
            .eq("id", user.id)
            .single();

        if (!profile?.tenant_id) { setSaving(false); return; }

        const payload = {
            name: modal.service.name,
            price: modal.service.price ?? null,
            duration_minutes: modal.service.duration_minutes ?? null,
        };

        if (modal.mode === "create") {
            await supabase.from("services").insert({
                ...payload,
                tenant_id: profile.tenant_id,
                is_active: true,
            });
        } else if (modal.mode === "edit" && modal.service.id) {
            await supabase
                .from("services")
                .update(payload)
                .eq("id", modal.service.id);
        }

        setSaving(false);
        setModal({ open: false, mode: "create", service: null });
        await fetchServices();
    }

    async function toggleAtivo(service: Service) {
        await supabase
            .from("services")
            .update({ is_active: !service.is_active })
            .eq("id", service.id);
        await fetchServices();
    }

    async function excluir(id: string) {
        if (!confirm("Tem certeza que deseja excluir este serviço?")) return;
        setDeleting(id);
        await supabase.from("services").delete().eq("id", id);
        setDeleting(null);
        await fetchServices();
    }

    return (
        <div
            style={{
                padding: "24px",
                minHeight: "100%",
                background: "#F6F2EA",
                fontFamily: "var(--font-urbanist), sans-serif",
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: "20px",
                    flexWrap: "wrap",
                    gap: "12px",
                }}
            >
                <div>
                    <h1
                        style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "22px",
                            fontWeight: 700,
                            color: "#2D2319",
                            margin: 0,
                            lineHeight: 1.2,
                        }}
                    >
                        Servicos
                    </h1>
                    <p style={{ color: "#A69060", fontSize: "13px", margin: "4px 0 0" }}>
                        {loading ? "Carregando..." : `${services.length} servico${services.length !== 1 ? "s" : ""} cadastrado${services.length !== 1 ? "s" : ""}`}
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "linear-gradient(135deg, #D4B86A, #B8960C)",
                        color: "#161412",
                        fontWeight: 700,
                        fontSize: "13px",
                        padding: "9px 18px",
                        borderRadius: "9px",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "var(--font-urbanist), sans-serif",
                        letterSpacing: "0.01em",
                    }}
                >
                    <Plus size={14} strokeWidth={2.5} />
                    Novo Servico
                </button>
            </div>

            {/* Grid de cards */}
            {loading ? (
                <div style={{ textAlign: "center", padding: "48px", color: "#A69060", fontSize: "14px" }}>
                    Carregando servicos...
                </div>
            ) : services.length === 0 ? (
                <div
                    style={{
                        ...card,
                        padding: "48px 24px",
                        textAlign: "center",
                        color: "#A69060",
                        fontSize: "14px",
                    }}
                >
                    <Clock size={40} strokeWidth={1.2} style={{ color: "#EDE5D3", marginBottom: "10px" }} />
                    <p style={{ margin: 0 }}>Nenhum servico cadastrado.</p>
                    <p style={{ margin: "4px 0 0", fontSize: "13px" }}>
                        Clique em "Novo Servico" para comecar.
                    </p>
                </div>
            ) : (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                        gap: "14px",
                    }}
                >
                    {services.map((service) => (
                        <div key={service.id} style={{ ...card, padding: "18px" }}>
                            {/* Badge status */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                                <span
                                    style={{
                                        fontSize: "11px",
                                        fontWeight: 600,
                                        padding: "3px 9px",
                                        borderRadius: "20px",
                                        background: service.is_active ? "#2D8C4E18" : "#D9444418",
                                        color: service.is_active ? "#2D8C4E" : "#D94444",
                                    }}
                                >
                                    {service.is_active ? "Ativo" : "Inativo"}
                                </span>

                                {/* Acoes */}
                                <div style={{ display: "flex", gap: "4px" }}>
                                    <button
                                        onClick={() => openEdit(service)}
                                        title="Editar"
                                        style={{
                                            width: "30px",
                                            height: "30px",
                                            borderRadius: "7px",
                                            border: "1px solid #EDE5D3",
                                            background: "#FFFFFF",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            cursor: "pointer",
                                            color: "#A69060",
                                        }}
                                    >
                                        <Pencil size={13} strokeWidth={1.8} />
                                    </button>
                                    <button
                                        onClick={() => void toggleAtivo(service)}
                                        title={service.is_active ? "Desativar" : "Ativar"}
                                        style={{
                                            width: "30px",
                                            height: "30px",
                                            borderRadius: "7px",
                                            border: "1px solid #EDE5D3",
                                            background: "#FFFFFF",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            cursor: "pointer",
                                            color: "#B8960C",
                                        }}
                                    >
                                        {service.is_active ? (
                                            <ToggleRight size={14} strokeWidth={1.8} />
                                        ) : (
                                            <ToggleLeft size={14} strokeWidth={1.8} />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => void excluir(service.id)}
                                        title="Excluir"
                                        disabled={deleting === service.id}
                                        style={{
                                            width: "30px",
                                            height: "30px",
                                            borderRadius: "7px",
                                            border: "1px solid #EDE5D3",
                                            background: "#FFFFFF",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            cursor: "pointer",
                                            color: "#D94444",
                                            opacity: deleting === service.id ? 0.5 : 1,
                                        }}
                                    >
                                        <Trash2 size={13} strokeWidth={1.8} />
                                    </button>
                                </div>
                            </div>

                            {/* Nome */}
                            <h3
                                style={{
                                    fontSize: "15px",
                                    fontWeight: 700,
                                    color: "#2D2319",
                                    margin: "0 0 10px",
                                    lineHeight: 1.3,
                                }}
                            >
                                {service.name}
                            </h3>

                            {/* Preco e duracao */}
                            <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                                <span
                                    style={{
                                        fontSize: "16px",
                                        fontWeight: 700,
                                        color: "#B8960C",
                                    }}
                                >
                                    {formatPrice(service.price)}
                                </span>
                                {service.duration_minutes && (
                                    <span
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "4px",
                                            fontSize: "12px",
                                            color: "#A69060",
                                        }}
                                    >
                                        <Clock size={12} strokeWidth={1.8} />
                                        {service.duration_minutes} min
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {modal.open && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(29, 20, 10, 0.45)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000,
                        padding: "16px",
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) closeModal();
                    }}
                >
                    <div
                        style={{
                            ...card,
                            padding: "24px",
                            width: "100%",
                            maxWidth: "440px",
                        }}
                    >
                        {/* Modal header */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: "20px",
                            }}
                        >
                            <h2
                                style={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontSize: "18px",
                                    fontWeight: 700,
                                    color: "#2D2319",
                                    margin: 0,
                                }}
                            >
                                {modal.mode === "create" ? "Novo Servico" : "Editar Servico"}
                            </h2>
                            <button
                                onClick={closeModal}
                                style={{
                                    width: "30px",
                                    height: "30px",
                                    borderRadius: "50%",
                                    border: "1px solid #EDE5D3",
                                    background: "#FFFFFF",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    color: "#A69060",
                                }}
                            >
                                <X size={14} strokeWidth={2} />
                            </button>
                        </div>

                        {/* Campos */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                            <div>
                                <label style={labelStyle}>Nome do servico *</label>
                                <input
                                    type="text"
                                    value={modal.service?.name ?? ""}
                                    onChange={(e) => updateField("name", e.target.value)}
                                    placeholder="Ex: Limpeza de pele"
                                    style={inputStyle}
                                    autoFocus
                                />
                            </div>

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "12px",
                                }}
                            >
                                <div>
                                    <label style={labelStyle}>Preco (R$)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={modal.service?.price ?? ""}
                                        onChange={(e) =>
                                            updateField(
                                                "price",
                                                e.target.value === "" ? null : Number(e.target.value)
                                            )
                                        }
                                        placeholder="0,00"
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Duracao (min)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={modal.service?.duration_minutes ?? ""}
                                        onChange={(e) =>
                                            updateField(
                                                "duration_minutes",
                                                e.target.value === "" ? null : Number(e.target.value)
                                            )
                                        }
                                        placeholder="60"
                                        style={inputStyle}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Modal footer */}
                        <div
                            style={{
                                display: "flex",
                                gap: "10px",
                                justifyContent: "flex-end",
                                marginTop: "24px",
                            }}
                        >
                            <button
                                onClick={closeModal}
                                disabled={saving}
                                style={{
                                    padding: "9px 20px",
                                    borderRadius: "9px",
                                    border: "1px solid #EDE5D3",
                                    background: "#FFFFFF",
                                    color: "#A69060",
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    fontFamily: "var(--font-urbanist), sans-serif",
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => void salvar()}
                                disabled={saving || !modal.service?.name?.trim()}
                                style={{
                                    padding: "9px 24px",
                                    borderRadius: "9px",
                                    border: "none",
                                    background:
                                        !modal.service?.name?.trim()
                                            ? "#EDE5D3"
                                            : "linear-gradient(135deg, #D4B86A, #B8960C)",
                                    color: !modal.service?.name?.trim() ? "#BBA870" : "#161412",
                                    fontSize: "13px",
                                    fontWeight: 700,
                                    cursor:
                                        !modal.service?.name?.trim() || saving
                                            ? "not-allowed"
                                            : "pointer",
                                    fontFamily: "var(--font-urbanist), sans-serif",
                                    opacity: saving ? 0.7 : 1,
                                }}
                            >
                                {saving ? "Salvando..." : "Salvar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
