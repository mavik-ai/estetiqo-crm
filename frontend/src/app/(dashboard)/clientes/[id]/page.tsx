import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
    ChevronLeft,
    Phone,
    Calendar,
    MapPin,
    Star,
    Clock,
    User,
    ClipboardList,
    Mail,
    AlertCircle,
    Layers,
} from "lucide-react";
import { SavedToast } from "@/components/ui/SavedToast";

interface HealthRecord {
    smoker: boolean | null;
    allergy: boolean | null;
    pregnancy: boolean | null;
    heart_disease: boolean | null;
    anemia: boolean | null;
    depression: boolean | null;
    hypertension: boolean | null;
    previous_aesthetic_treatment: boolean | null;
    herpes: boolean | null;
    keloid: boolean | null;
    diabetes: boolean | null;
    hepatitis: boolean | null;
    hiv: boolean | null;
    skin_disease: boolean | null;
    cancer: boolean | null;
    contraceptive: boolean | null;
    other_conditions: string | null;
}

const healthLabels: { key: keyof Omit<HealthRecord, "other_conditions">; label: string }[] = [
    { key: "smoker", label: "Fumante" },
    { key: "allergy", label: "Possui alergia" },
    { key: "pregnancy", label: "Grávida ou suspeita de gravidez" },
    { key: "heart_disease", label: "Cardiopatia" },
    { key: "anemia", label: "Anemia" },
    { key: "depression", label: "Depressão" },
    { key: "hypertension", label: "Hipertensão" },
    { key: "previous_aesthetic_treatment", label: "Já realizou tratamento estético" },
    { key: "herpes", label: "Herpes" },
    { key: "keloid", label: "Queloide" },
    { key: "diabetes", label: "Diabetes" },
    { key: "hepatitis", label: "Hepatite" },
    { key: "hiv", label: "Portador(a) de HIV" },
    { key: "skin_disease", label: "Doença de pele" },
    { key: "cancer", label: "Câncer" },
    { key: "contraceptive", label: "Toma anticoncepcional" },
];

function calcularIdade(birth_date: string | null): string {
    if (!birth_date) return "—";
    return String(
        Math.floor(
            (Date.now() - new Date(birth_date).getTime()) / (365.25 * 24 * 3600 * 1000)
        )
    );
}

function formatarData(iso: string | null): string {
    if (!iso) return "—";
    const [year, month, day] = iso.split("-");
    return `${day}/${month}/${year}`;
}

function getInitials(name: string): string {
    return name
        .split(" ")
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() ?? "")
        .join("");
}

function sexLabel(sex: string | null): string {
    if (sex === "F") return "Feminino";
    if (sex === "M") return "Masculino";
    if (sex === "O") return "Outro";
    return "—";
}

function rsvpLabel(status: string | null): { label: string; color: string } {
    switch (status) {
        case "confirmed":
            return { label: "Confirmado", color: "#2D8C4E" };
        case "cancelled":
            return { label: "Cancelado", color: "#D94444" };
        case "pending":
            return { label: "Pendente", color: "#B8960C" };
        default:
            return { label: "Pendente", color: "#B8960C" };
    }
}

const card: React.CSSProperties = {
    background: "#FFFFFF",
    border: "1px solid #EDE5D3",
    borderRadius: "14px",
    padding: "20px",
    marginBottom: "14px",
};

const cardTitle: React.CSSProperties = {
    fontFamily: "'Playfair Display', serif",
    fontSize: "15px",
    fontWeight: 700,
    color: "#2D2319",
    marginBottom: "14px",
};

const infoLabel: React.CSSProperties = {
    fontSize: "11px",
    fontWeight: 600,
    color: "#BBA870",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    marginBottom: "2px",
};

const infoValue: React.CSSProperties = {
    fontSize: "14px",
    color: "#2D2319",
    fontWeight: 500,
};

export default async function ClienteFichaPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;


    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data: profile } = await supabase
        .from("users")
        .select("tenant_id")
        .eq("id", user!.id)
        .single();

    const tenantId = profile!.tenant_id;

    const [clientRes, healthRes, apptRes, protocolsRes] = await Promise.all([
        supabase
            .from("clients")
            .select("*")
            .eq("id", id)
            .eq("tenant_id", tenantId)
            .single(),
        supabase
            .from("health_records")
            .select("*")
            .eq("client_id", id)
            .single(),
        supabase
            .from("appointments")
            .select(
                "id, starts_at, rsvp_status, services(name), protocols(total_sessions, completed_sessions)"
            )
            .eq("client_id", id)
            .eq("tenant_id", tenantId)
            .order("starts_at", { ascending: false })
            .limit(10),
        supabase
            .from("protocols")
            .select("id, status, total_sessions, completed_sessions, created_at, services(name)")
            .eq("client_id", id)
            .eq("tenant_id", tenantId)
            .order("created_at", { ascending: false }),
    ]);

    if (!clientRes.data) notFound();

    const client = clientRes.data;
    const health = healthRes.data as HealthRecord | null;
    const appointments = apptRes.data ?? [];
    const protocols = (protocolsRes.data ?? []) as Array<{
        id: string;
        status: string;
        total_sessions: number;
        completed_sessions: number;
        created_at: string;
        services: { name: string } | { name: string }[] | null;
    }>;

    const protocolStatusCfg: Record<string, { label: string; bg: string; color: string }> = {
        active:    { label: "Ativo",     bg: "rgba(45,140,78,0.10)",  color: "#2D8C4E" },
        completed: { label: "Concluído", bg: "rgba(58,123,213,0.10)", color: "#3A7BD5" },
        cancelled: { label: "Cancelado", bg: "rgba(217,68,68,0.10)",  color: "#D94444" },
    };

    const initials = getInitials(client.name ?? "");
    const idade = calcularIdade(client.birth_date ?? null);
    const rating = client.rating as number | null;

    return (
        <div
            style={{
                padding: "24px",
                minHeight: "100%",
                background: "#F6F2EA",
                fontFamily: "var(--font-urbanist), sans-serif",
            }}
        >
            <Suspense fallback={null}>
                <SavedToast message="Dados da cliente salvos com sucesso!" />
            </Suspense>

            {/* Header */}
            <div style={{ marginBottom: "20px" }}>
                <Link
                    href="/clientes"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "13px",
                        color: "#A69060",
                        textDecoration: "none",
                        marginBottom: "10px",
                    }}
                >
                    <ChevronLeft size={14} strokeWidth={2} />
                    Clientes
                </Link>

                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    {/* Avatar grande */}
                    <div
                        style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #D4B86A, #B8960C)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#FFFDF7",
                            fontSize: "16px",
                            fontWeight: 700,
                            flexShrink: 0,
                            letterSpacing: "0.02em",
                        }}
                    >
                        {initials}
                    </div>
                    <div>
                        <h1
                            style={{
                                fontFamily: "'Playfair Display', serif",
                                fontSize: "24px",
                                fontWeight: 700,
                                color: "#2D2319",
                                margin: 0,
                                lineHeight: 1.2,
                            }}
                        >
                            {client.name}
                        </h1>
                        {client.phone && (
                            <p style={{ color: "#A69060", fontSize: "13px", margin: "3px 0 0" }}>
                                {client.phone}
                            </p>
                        )}
                    </div>

                    {/* Botões de ação */}
                    <div style={{ marginLeft: "auto", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <Link
                            href={`/clientes/${id}/avaliacao/nova`}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                fontSize: "13px",
                                fontWeight: 700,
                                color: "#161412",
                                textDecoration: "none",
                                padding: "8px 16px",
                                border: "none",
                                borderRadius: "9px",
                                background: "linear-gradient(135deg, #D4B86A, #B8960C)",
                            }}
                        >
                            <ClipboardList size={14} strokeWidth={1.8} />
                            Nova Avaliação
                        </Link>
                        <Link
                            href={`/clientes/${id}/editar`}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                fontSize: "13px",
                                fontWeight: 600,
                                color: "#B8960C",
                                textDecoration: "none",
                                padding: "8px 16px",
                                border: "1px solid #D4B86A",
                                borderRadius: "9px",
                            }}
                        >
                            <User size={14} strokeWidth={1.8} />
                            Editar Dados
                        </Link>
                    </div>
                </div>
            </div>

            {/* Grid principal */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: "14px",
                }}
            >
                {/* Coluna esquerda (em telas grandes = 2/3) */}
                <div>
                    {/* Card Dados Pessoais */}
                    <div style={card}>
                        <h2 style={cardTitle}>Dados Pessoais</h2>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                                gap: "16px",
                            }}
                        >
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "5px", ...infoLabel }}>
                                    <Phone size={11} strokeWidth={1.8} />
                                    Telefone
                                </div>
                                <div style={infoValue}>{client.phone ?? "—"}</div>
                            </div>
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "5px", ...infoLabel }}>
                                    <Mail size={11} strokeWidth={1.8} />
                                    E-mail
                                </div>
                                <div style={infoValue}>{(client as Record<string, unknown>).email as string ?? "—"}</div>
                            </div>
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "5px", ...infoLabel }}>
                                    <Calendar size={11} strokeWidth={1.8} />
                                    Nascimento / Idade
                                </div>
                                <div style={infoValue}>
                                    {client.birth_date
                                        ? `${formatarData(client.birth_date)} (${idade} anos)`
                                        : "—"}
                                </div>
                            </div>
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "5px", ...infoLabel }}>
                                    <User size={11} strokeWidth={1.8} />
                                    Sexo
                                </div>
                                <div style={infoValue}>{sexLabel(client.sex ?? null)}</div>
                            </div>
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "5px", ...infoLabel }}>
                                    <MapPin size={11} strokeWidth={1.8} />
                                    Endereço
                                </div>
                                <div style={infoValue}>{client.address ?? "—"}</div>
                            </div>
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "5px", ...infoLabel }}>
                                    <Star size={11} strokeWidth={1.8} />
                                    Avaliação
                                </div>
                                <div style={{ display: "flex", gap: "3px", marginTop: "2px" }}>
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <Star
                                            key={i}
                                            size={14}
                                            strokeWidth={1.5}
                                            style={{
                                                fill: i <= (rating ?? 0) ? "#B8960C" : "#EDE5D3",
                                                color: i <= (rating ?? 0) ? "#B8960C" : "#EDE5D3",
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card Histórico */}
                    <div style={card}>
                        <h2 style={cardTitle}>Histórico de Atendimentos</h2>
                        {appointments.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "24px 0", color: "#A69060", fontSize: "13px" }}>
                                <Clock size={32} strokeWidth={1.2} style={{ color: "#EDE5D3", marginBottom: "8px" }} />
                                <p style={{ margin: 0 }}>Nenhum atendimento registrado.</p>
                            </div>
                        ) : (
                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr>
                                            {["Data", "Serviço", "Protocolo", "Status"].map((col, idx) => (
                                                <th
                                                    key={col}
                                                    style={{
                                                        padding: "8px 12px",
                                                        textAlign: idx === 3 ? "center" : "left",
                                                        fontSize: "9px",
                                                        fontWeight: 700,
                                                        letterSpacing: "0.08em",
                                                        textTransform: "uppercase",
                                                        color: "#BBA870",
                                                        borderBottom: "1px solid #EDE5D3",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {appointments.map((appt, idx) => {
                                            const service = appt.services as { name?: string } | null;
                                            const proto = appt.protocols as {
                                                total_sessions?: number;
                                                completed_sessions?: number;
                                            } | null;
                                            const rsvp = rsvpLabel(appt.rsvp_status as string | null);
                                            const dataFormatada = formatarData(
                                                (appt.starts_at as string)?.slice(0, 10) ?? null
                                            );
                                            const hora = (appt.starts_at as string)?.slice(11, 16) ?? "";
                                            return (
                                                <tr
                                                    key={appt.id}
                                                    style={{
                                                        borderBottom:
                                                            idx < appointments.length - 1
                                                                ? "1px solid #F3EDE0"
                                                                : "none",
                                                    }}
                                                >
                                                    <td style={{ padding: "10px 12px", fontSize: "13px", color: "#2D2319", whiteSpace: "nowrap" }}>
                                                        {dataFormatada}{hora ? ` ${hora}` : ""}
                                                    </td>
                                                    <td style={{ padding: "10px 12px", fontSize: "13px", color: "#2D2319" }}>
                                                        {service?.name ?? "—"}
                                                    </td>
                                                    <td style={{ padding: "10px 12px", fontSize: "13px", color: "#A69060" }}>
                                                        {proto
                                                            ? `${proto.completed_sessions ?? 0}/${proto.total_sessions ?? 0}`
                                                            : "—"}
                                                    </td>
                                                    <td style={{ padding: "10px 12px", textAlign: "center" }}>
                                                        <span
                                                            style={{
                                                                fontSize: "11px",
                                                                fontWeight: 600,
                                                                color: rsvp.color,
                                                                background: `${rsvp.color}14`,
                                                                padding: "3px 8px",
                                                                borderRadius: "20px",
                                                                whiteSpace: "nowrap",
                                                            }}
                                                        >
                                                            {rsvp.label}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                    {/* Card Protocolos */}
                    {protocols.length > 0 && (
                        <div style={card}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                                <h2 style={{ ...cardTitle, marginBottom: 0 }}>Protocolos</h2>
                                <span style={{ fontSize: "11px", color: "#A69060" }}>
                                    {protocols.filter(p => p.status === "active").length} ativo(s)
                                </span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                {protocols.map((proto) => {
                                    const svcRaw = Array.isArray(proto.services) ? proto.services[0] : proto.services;
                                    const svcName = (svcRaw as { name: string } | null)?.name ?? "—";
                                    const pct = proto.total_sessions > 0
                                        ? Math.round((proto.completed_sessions / proto.total_sessions) * 100)
                                        : 0;
                                    const cfg = protocolStatusCfg[proto.status] ?? { label: proto.status, bg: "#F0EBE0", color: "#A69060" };
                                    return (
                                        <Link
                                            key={proto.id}
                                            href={`/protocolos/${proto.id}`}
                                            style={{ textDecoration: "none" }}
                                        >
                                            <div style={{
                                                padding: "12px 14px", borderRadius: "10px",
                                                border: "1px solid #EDE5D3", background: "#FEFCF7",
                                                display: "flex", flexDirection: "column", gap: "8px",
                                            }}>
                                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                        <Layers size={13} strokeWidth={1.5} style={{ color: "#B8960C", flexShrink: 0 }} />
                                                        <span style={{ fontSize: "13px", fontWeight: 600, color: "#2D2319" }}>
                                                            {svcName}
                                                        </span>
                                                    </div>
                                                    <span style={{
                                                        fontSize: "10px", fontWeight: 700, padding: "2px 8px",
                                                        borderRadius: "20px", background: cfg.bg, color: cfg.color,
                                                        whiteSpace: "nowrap",
                                                    }}>
                                                        {cfg.label}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                                        <span style={{ fontSize: "11px", color: "#A69060" }}>
                                                            {proto.completed_sessions}/{proto.total_sessions} sessões
                                                        </span>
                                                        <span style={{ fontSize: "11px", fontWeight: 600, color: "#B8960C" }}>{pct}%</span>
                                                    </div>
                                                    <div style={{ height: "5px", background: "#F0EBE0", borderRadius: "3px", overflow: "hidden" }}>
                                                        <div style={{
                                                            height: "100%", borderRadius: "3px",
                                                            background: "linear-gradient(90deg, #D4B86A, #B8960C)",
                                                            width: `${pct}%`,
                                                        }} />
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                {/* Coluna direita: Ficha de Saúde */}
                <div>
                    <div style={{ ...card, marginBottom: 0 }}>
                        <h2 style={cardTitle}>Ficha de Saúde</h2>
                        {!health ? (
                            <p style={{ color: "#A69060", fontSize: "13px" }}>
                                Ficha de saúde não preenchida.{" "}
                                <Link href={`/clientes/${id}/avaliacao/nova`} style={{ color: "#B8960C" }}>
                                    Preencher agora →
                                </Link>
                            </p>
                        ) : (() => {
                            const positivos = healthLabels.filter(({ key }) => health[key] === true);
                            const todoNegativo = positivos.length === 0;
                            return (
                                <div>
                                    {todoNegativo ? (
                                        <div style={{
                                            display: "flex", alignItems: "center", gap: "10px",
                                            padding: "12px 14px", background: "#F0FBF4",
                                            border: "1px solid #A8D5B5", borderRadius: "10px",
                                        }}>
                                            <span style={{ fontSize: "18px" }}>✓</span>
                                            <span style={{ fontSize: "13px", color: "#2D8C4E", fontWeight: 600 }}>
                                                Sem restrições de saúde reportadas
                                            </span>
                                        </div>
                                    ) : (
                                        <div>
                                            <div style={{
                                                display: "flex", alignItems: "center", gap: "6px",
                                                marginBottom: "10px",
                                            }}>
                                                <AlertCircle size={14} strokeWidth={1.8} color="#D97706" />
                                                <span style={{ fontSize: "11px", fontWeight: 700, color: "#D97706", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                                    {positivos.length} condição{positivos.length > 1 ? "ões" : ""} a considerar
                                                </span>
                                            </div>
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                                {positivos.map(({ key, label }) => (
                                                    <span
                                                        key={key}
                                                        style={{
                                                            fontSize: "12px",
                                                            fontWeight: 600,
                                                            color: "#92400E",
                                                            background: "#FEF3C7",
                                                            border: "1px solid #FCD34D",
                                                            borderRadius: "20px",
                                                            padding: "4px 10px",
                                                        }}
                                                    >
                                                        {label}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {health.other_conditions && (
                                        <div style={{
                                            marginTop: "12px", padding: "10px 12px",
                                            background: "#FBF5EA", border: "1px solid #EDE5D3",
                                            borderRadius: "8px",
                                        }}>
                                            <div style={{ ...infoLabel, marginBottom: "4px" }}>Outros</div>
                                            <p style={{ margin: 0, fontSize: "13px", color: "#2D2319", lineHeight: 1.5 }}>
                                                {health.other_conditions}
                                            </p>
                                        </div>
                                    )}

                                    <details style={{ marginTop: "12px" }}>
                                        <summary style={{ fontSize: "12px", color: "#A69060", cursor: "pointer", userSelect: "none" }}>
                                            Ver ficha completa
                                        </summary>
                                        <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
                                            {healthLabels.map(({ key, label }) => {
                                                const value = health[key] === true;
                                                return (
                                                    <div key={key} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
                                                        <div style={{
                                                            width: "16px", height: "16px", borderRadius: "50%",
                                                            background: value ? "#D1FAE5" : "#F5F5F4",
                                                            border: `1px solid ${value ? "#6EE7B7" : "#E5E5E5"}`,
                                                            display: "flex", alignItems: "center", justifyContent: "center",
                                                            flexShrink: 0,
                                                        }}>
                                                            {value && <span style={{ fontSize: "8px", color: "#059669" }}>✓</span>}
                                                        </div>
                                                        <span style={{ color: value ? "#2D2319" : "#A69060" }}>{label}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </details>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>

            {/* Responsive grid override */}
            <style>{`
                @media (min-width: 900px) {
                    .ficha-grid {
                        grid-template-columns: 2fr 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
}
