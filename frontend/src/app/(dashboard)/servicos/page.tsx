'use client'

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Plus, Pencil, Trash2, Clock, X, ImagePlus, DollarSign, FileText } from "lucide-react";
import Image from "next/image";

interface Service {
    id: string;
    name: string;
    description: string | null;
    price: number | null;
    duration_minutes: number | null;
    is_active: boolean | null;
    preparation_notes: string | null;
    image_url: string | null;
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
    fontSize: "11px",
    fontWeight: 700,
    color: "#BBA870",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    marginBottom: "6px",
};

function formatPrice(price: number | null): string {
    if (price === null || price === undefined) return "—";
    return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ServicosPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [tenantId, setTenantId] = useState<string | null>(null);
    const [modal, setModal] = useState<ModalState>({ open: false, mode: "create", service: null });
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    // Image upload
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        setTenantId(profile.tenant_id);

        const { data } = await supabase
            .from("services")
            .select("id, name, description, price, duration_minutes, is_active, preparation_notes, image_url")
            .eq("tenant_id", profile.tenant_id)
            .order("name");

        setServices(data ?? []);
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        void fetchServices();
    }, [fetchServices]);

    function openCreate() {
        setImageFile(null);
        setImagePreview(null);
        setModal({ open: true, mode: "create", service: { name: "", description: null, price: null, duration_minutes: null, preparation_notes: null, image_url: null } });
    }

    function openEdit(service: Service) {
        setImageFile(null);
        setImagePreview(service.image_url ?? null);
        setModal({ open: true, mode: "edit", service: { ...service } });
    }

    function closeModal() {
        if (saving) return;
        setModal({ open: false, mode: "create", service: null });
        setImageFile(null);
        setImagePreview(null);
    }

    function updateField(field: keyof Service, value: string | number | boolean | null) {
        setModal((prev) => ({
            ...prev,
            service: { ...prev.service, [field]: value },
        }));
    }

    function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    }

    async function uploadImage(serviceId: string): Promise<string | null> {
        if (!imageFile || !tenantId) return modal.service?.image_url ?? null;
        const ext = imageFile.name.split(".").pop() ?? "jpg";
        const path = `${tenantId}/${serviceId}.${ext}`;
        const { error } = await supabase.storage
            .from("service-images")
            .upload(path, imageFile, { upsert: true });
        if (error) return modal.service?.image_url ?? null;
        const { data } = supabase.storage.from("service-images").getPublicUrl(path);
        return data.publicUrl;
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
            name:              modal.service.name,
            description:       modal.service.description ?? null,
            price:             modal.service.price ?? null,
            duration_minutes:  modal.service.duration_minutes ?? null,
            preparation_notes: modal.service.preparation_notes ?? null,
        };

        if (modal.mode === "create") {
            const { data: inserted } = await supabase.from("services").insert({
                ...payload,
                tenant_id: profile.tenant_id,
                is_active: true,
            }).select("id").single();

            if (inserted?.id) {
                const imageUrl = await uploadImage(inserted.id);
                if (imageUrl) {
                    await supabase.from("services").update({ image_url: imageUrl }).eq("id", inserted.id);
                }
            }
        } else if (modal.mode === "edit" && modal.service.id) {
            const imageUrl = await uploadImage(modal.service.id);
            await supabase
                .from("services")
                .update({ ...payload, image_url: imageUrl })
                .eq("id", modal.service.id);
        }

        setSaving(false);
        setModal({ open: false, mode: "create", service: null });
        setImageFile(null);
        setImagePreview(null);
        await fetchServices();
    }

    async function toggleAtivo(service: Service) {
        setServices(prev =>
            prev.map(s => s.id === service.id ? { ...s, is_active: !s.is_active } : s)
        );
        const { error } = await supabase
            .from("services")
            .update({ is_active: !service.is_active })
            .eq("id", service.id);
        if (error) {
            setServices(prev =>
                prev.map(s => s.id === service.id ? { ...s, is_active: service.is_active } : s)
            );
        }
    }

    async function excluir(id: string) {
        setDeleting(id);
        const now = new Date().toISOString();
        const { data: agendamentosFuturos } = await supabase
            .from("appointments")
            .select("id")
            .eq("service_id", id)
            .gte("starts_at", now)
            .limit(1);

        if (agendamentosFuturos && agendamentosFuturos.length > 0) {
            setDeleting(null);
            alert("Não é possível excluir: este serviço possui agendamentos futuros.");
            return;
        }

        await supabase.from("services").delete().eq("id", id);
        setServices(prev => prev.filter(s => s.id !== id));
        setDeleting(null);
    }

    return (
        <div style={{ padding: "24px", minHeight: "100%", background: "#F6F2EA", fontFamily: "var(--font-urbanist), sans-serif" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                    <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 700, color: "#2D2319", margin: 0, lineHeight: 1.2 }}>
                        Serviços
                    </h1>
                    <p style={{ color: "#A69060", fontSize: "13px", margin: "4px 0 0" }}>
                        {loading ? "Carregando..." : `${services.length} serviço${services.length !== 1 ? "s" : ""} cadastrado${services.length !== 1 ? "s" : ""}`}
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    style={{
                        display: "inline-flex", alignItems: "center", gap: "6px",
                        background: "linear-gradient(135deg, #D4B86A, #B8960C)",
                        color: "#161412", fontWeight: 700, fontSize: "13px",
                        padding: "9px 18px", borderRadius: "9px", border: "none",
                        cursor: "pointer", fontFamily: "var(--font-urbanist), sans-serif",
                    }}
                >
                    <Plus size={14} strokeWidth={2.5} />
                    Novo Serviço
                </button>
            </div>

            {/* Grid de cards */}
            {loading ? (
                <div style={{ textAlign: "center", padding: "48px", color: "#A69060", fontSize: "14px" }}>Carregando serviços...</div>
            ) : services.length === 0 ? (
                <div style={{ ...card, padding: "48px 24px", textAlign: "center", color: "#A69060", fontSize: "14px" }}>
                    <Clock size={40} strokeWidth={1.2} style={{ color: "#EDE5D3", marginBottom: "10px" }} />
                    <p style={{ margin: 0 }}>Nenhum serviço cadastrado.</p>
                    <p style={{ margin: "4px 0 0", fontSize: "13px" }}>Clique em "Novo Serviço" para começar.</p>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: "14px" }}>
                    {services.map((service) => (
                        <div key={service.id} style={{ ...card, overflow: "hidden" }}>
                            {/* Imagem do serviço */}
                            {service.image_url ? (
                                <div style={{ position: "relative", width: "100%", height: "140px", background: "#F6F2EA" }}>
                                    <Image
                                        src={service.image_url}
                                        alt={service.name}
                                        fill
                                        style={{ objectFit: "cover" }}
                                        sizes="(max-width: 768px) 100vw, 340px"
                                    />
                                </div>
                            ) : (
                                <div style={{
                                    width: "100%", height: "100px",
                                    background: "linear-gradient(135deg, #FBF5EA, #F0E8D0)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                    <ImagePlus size={28} strokeWidth={1.2} color="#D4C8A8" />
                                </div>
                            )}

                            <div style={{ padding: "14px 16px 16px" }}>
                                {/* Badge + ações */}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                                    <span style={{
                                        fontSize: "11px", fontWeight: 600, padding: "3px 9px", borderRadius: "20px",
                                        background: service.is_active ? "#2D8C4E18" : "#D9444418",
                                        color: service.is_active ? "#2D8C4E" : "#D94444",
                                    }}>
                                        {service.is_active ? "Ativo" : "Inativo"}
                                    </span>

                                    {/* Acoes: Editar | Excluir | Toggle */}
                                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                        <button onClick={() => openEdit(service)} title="Editar"
                                            style={{ width: "30px", height: "30px", borderRadius: "7px", border: "1px solid #EDE5D3", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#A69060" }}>
                                            <Pencil size={13} strokeWidth={1.8} />
                                        </button>
                                        {confirmDeleteId === service.id ? (
                                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                                <button onClick={() => { setConfirmDeleteId(null); void excluir(service.id); }}
                                                    disabled={deleting === service.id}
                                                    style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid rgba(217,68,68,0.3)", background: "rgba(217,68,68,0.08)", color: "#D94444", fontSize: "10px", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-urbanist), sans-serif", opacity: deleting === service.id ? 0.5 : 1 }}>
                                                    {deleting === service.id ? "..." : "Sim"}
                                                </button>
                                                <button onClick={() => setConfirmDeleteId(null)}
                                                    style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #EDE5D3", background: "#FFFFFF", color: "#A69060", fontSize: "10px", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-urbanist), sans-serif" }}>
                                                    Não
                                                </button>
                                            </div>
                                        ) : (
                                            <button onClick={() => setConfirmDeleteId(service.id)} title="Excluir"
                                                style={{ width: "30px", height: "30px", borderRadius: "7px", border: "1px solid #EDE5D3", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#D94444" }}>
                                                <Trash2 size={13} strokeWidth={1.8} />
                                            </button>
                                        )}
                                        <button onClick={() => void toggleAtivo(service)}
                                            title={service.is_active ? "Desativar" : "Ativar"}
                                            style={{ width: "44px", height: "24px", borderRadius: "12px", background: service.is_active ? "linear-gradient(135deg, #D4B86A, #B8960C)" : "#D4C8A8", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0, padding: 0 }}>
                                            <span style={{ position: "absolute", top: "2px", left: service.is_active ? "22px" : "2px", width: "20px", height: "20px", borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", display: "block" }} />
                                        </button>
                                    </div>
                                </div>

                                {/* Nome */}
                                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#2D2319", margin: "0 0 6px", lineHeight: 1.3 }}>
                                    {service.name}
                                </h3>

                                {/* Descrição */}
                                {service.description && (
                                    <p style={{ fontSize: "12px", color: "#A69060", margin: "0 0 10px", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                        {service.description}
                                    </p>
                                )}

                                {/* Preço e duração */}
                                <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                                    <span style={{ fontSize: "16px", fontWeight: 700, color: "#B8960C" }}>
                                        {formatPrice(service.price)}
                                    </span>
                                    {service.duration_minutes && (
                                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#A69060" }}>
                                            <Clock size={12} strokeWidth={1.8} />
                                            {service.duration_minutes} min
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {modal.open && (
                <div
                    style={{ position: "fixed", inset: 0, background: "rgba(29, 20, 10, 0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}
                    onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
                >
                    <div style={{ ...card, padding: "0", width: "100%", maxWidth: "520px", maxHeight: "90vh", overflowY: "auto" }}>

                        {/* Modal header */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 0" }}>
                            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 700, color: "#2D2319", margin: 0 }}>
                                {modal.mode === "create" ? "Novo Serviço" : "Editar Serviço"}
                            </h2>
                            <button onClick={closeModal}
                                style={{ width: "30px", height: "30px", borderRadius: "50%", border: "1px solid #EDE5D3", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#A69060" }}>
                                <X size={14} strokeWidth={2} />
                            </button>
                        </div>

                        <div style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>

                            {/* Upload de imagem */}
                            <div>
                                <label style={labelStyle}>
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                                        <ImagePlus size={12} /> Foto do Serviço
                                    </span>
                                </label>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleImageSelect}
                                    style={{ display: "none" }}
                                />
                                {imagePreview ? (
                                    <div style={{ position: "relative", width: "100%", height: "160px", borderRadius: "10px", overflow: "hidden", border: "1px solid #EDE5D3" }}>
                                        <Image src={imagePreview} alt="Preview" fill style={{ objectFit: "cover" }} sizes="480px" />
                                        <button
                                            onClick={() => { setImageFile(null); setImagePreview(null); updateField("image_url", null); }}
                                            style={{ position: "absolute", top: "8px", right: "8px", width: "28px", height: "28px", borderRadius: "50%", background: "rgba(0,0,0,0.5)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
                                            <X size={13} strokeWidth={2.5} />
                                        </button>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            style={{ position: "absolute", bottom: "8px", right: "8px", padding: "5px 10px", borderRadius: "6px", background: "rgba(0,0,0,0.5)", border: "none", fontSize: "11px", fontWeight: 600, color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>
                                            Trocar foto
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        style={{ width: "100%", height: "100px", borderRadius: "10px", border: "2px dashed #EDE5D3", background: "#FEFCF7", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", cursor: "pointer", color: "#BBA870", fontFamily: "inherit" }}>
                                        <ImagePlus size={22} strokeWidth={1.5} />
                                        <span style={{ fontSize: "12px", fontWeight: 600 }}>Clique para adicionar foto</span>
                                        <span style={{ fontSize: "11px", color: "#D4C8A8" }}>JPG, PNG ou WebP · até 5 MB</span>
                                    </button>
                                )}
                            </div>

                            {/* Nome */}
                            <div>
                                <label style={labelStyle}>
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                                        <FileText size={12} /> Nome do Serviço *
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    value={modal.service?.name ?? ""}
                                    onChange={(e) => updateField("name", e.target.value)}
                                    placeholder="Ex: Ultrassom Terapêutico"
                                    style={inputStyle}
                                    autoFocus
                                />
                            </div>

                            {/* Descrição */}
                            <div>
                                <label style={labelStyle}>Descrição</label>
                                <textarea
                                    value={modal.service?.description ?? ""}
                                    onChange={(e) => updateField("description", e.target.value || null)}
                                    placeholder="Descreva o que o serviço inclui, benefícios, indicações..."
                                    rows={3}
                                    style={{ ...inputStyle, resize: "vertical", lineHeight: "1.5" }}
                                />
                            </div>

                            {/* Preço e duração */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                <div>
                                    <label style={labelStyle}>
                                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                                            <DollarSign size={12} /> Preço (R$)
                                        </span>
                                    </label>
                                    <input
                                        type="number" step="0.01" min="0"
                                        value={modal.service?.price ?? ""}
                                        onChange={(e) => updateField("price", e.target.value === "" ? null : Number(e.target.value))}
                                        placeholder="0,00"
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>
                                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                                            <Clock size={12} /> Duração (min)
                                        </span>
                                    </label>
                                    <input
                                        type="number" min="1"
                                        value={modal.service?.duration_minutes ?? ""}
                                        onChange={(e) => updateField("duration_minutes", e.target.value === "" ? null : Number(e.target.value))}
                                        placeholder="60"
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            {/* Recomendações de preparo */}
                            <div>
                                <label style={labelStyle}>Recomendações de preparo</label>
                                <textarea
                                    value={modal.service?.preparation_notes ?? ""}
                                    onChange={(e) => updateField("preparation_notes", e.target.value || null)}
                                    placeholder={"Ex:\n• Beba bastante água antes da sessão\n• Venha com roupas confortáveis"}
                                    rows={3}
                                    style={{ ...inputStyle, resize: "vertical", lineHeight: "1.5" }}
                                />
                                <p style={{ fontSize: "11px", color: "#BBA870", margin: "4px 0 0" }}>
                                    Aparece para a cliente após confirmar o RSVP.
                                </p>
                            </div>

                            {/* Footer */}
                            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", paddingTop: "4px" }}>
                                <button onClick={closeModal} disabled={saving}
                                    style={{ padding: "9px 20px", borderRadius: "9px", border: "1px solid #EDE5D3", background: "#FFFFFF", color: "#A69060", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-urbanist), sans-serif" }}>
                                    Cancelar
                                </button>
                                <button onClick={() => void salvar()} disabled={saving || !modal.service?.name?.trim()}
                                    style={{
                                        padding: "9px 24px", borderRadius: "9px", border: "none",
                                        background: !modal.service?.name?.trim() ? "#EDE5D3" : "linear-gradient(135deg, #D4B86A, #B8960C)",
                                        color: !modal.service?.name?.trim() ? "#BBA870" : "#161412",
                                        fontSize: "13px", fontWeight: 700,
                                        cursor: !modal.service?.name?.trim() || saving ? "not-allowed" : "pointer",
                                        fontFamily: "var(--font-urbanist), sans-serif", opacity: saving ? 0.7 : 1,
                                    }}>
                                    {saving ? "Salvando..." : "Salvar"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
