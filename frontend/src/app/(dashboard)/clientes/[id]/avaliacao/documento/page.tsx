import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Printer, CheckCircle2, XCircle } from "lucide-react";
import PrintButton from "./PrintButton";

type Params = Promise<{ id: string }>;

export default async function DocumentoAvaliacaoPage({ params }: { params: Params }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: profile } = await supabase
        .from("users")
        .select("tenant_id, tenants(name, logo_url)")
        .eq("id", user.id)
        .single();

    const tenantId = profile?.tenant_id;
    const tenant = profile?.tenants as { name?: string; logo_url?: string } | null;

    const [clientRes, healthRes, sigRes] = await Promise.all([
        supabase.from("clients").select("*").eq("id", id).eq("tenant_id", tenantId!).single(),
        supabase.from("health_records").select("*").eq("client_id", id).single(),
        supabase.from("digital_signatures")
            .select("signature_data, created_at, authorization_text")
            .eq("client_id", id)
            .eq("type", "initial_assessment")
            .order("created_at", { ascending: false })
            .limit(1)
            .single(),
    ]);

    if (!clientRes.data) redirect(`/clientes/${id}`);

    const client = clientRes.data;
    const health = healthRes.data;
    const sig = sigRes.data;

    const age = client.birth_date
        ? Math.floor((Date.now() - new Date(client.birth_date).getTime()) / 31557600000)
        : null;

    const sigDate = sig?.created_at
        ? new Date(sig.created_at).toLocaleString("pt-BR", {
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo",
        })
        : null;

    type HealthField = { label: string; key: string };
    const healthFields: HealthField[] = [
        { label: "Fumante",                         key: "smoker" },
        { label: "Alergia",                         key: "allergy" },
        { label: "Gestante",                        key: "pregnancy" },
        { label: "Doença cardíaca",                 key: "heart_disease" },
        { label: "Anemia",                          key: "anemia" },
        { label: "Depressão",                       key: "depression" },
        { label: "Hipertensão",                     key: "hypertension" },
        { label: "Tratamento estético anterior",    key: "previous_aesthetic_treatment" },
        { label: "Herpes",                          key: "herpes" },
        { label: "Queloide",                        key: "keloid" },
        { label: "Diabetes",                        key: "diabetes" },
        { label: "Hepatite",                        key: "hepatitis" },
        { label: "HIV",                             key: "hiv" },
        { label: "Doença de pele",                  key: "skin_disease" },
        { label: "Câncer",                          key: "cancer" },
        { label: "Uso de contraceptivo",            key: "contraceptive" },
    ];

    return (
        <>
            {/* Barra de ações — só aparece na tela, some ao imprimir */}
            <div className="no-print" style={{
                position: "sticky", top: 0, zIndex: 10,
                background: "var(--card)", borderBottom: "1px solid var(--border)",
                padding: "12px 24px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
                <a href={`/clientes/${id}`} style={{
                    fontSize: "13px", color: "var(--muted-foreground)", textDecoration: "none",
                    display: "flex", alignItems: "center", gap: "4px",
                }}>
                    ← Voltar à ficha
                </a>
                <PrintButton />
            </div>

            {/* Documento */}
            <div id="documento-avaliacao" style={{
                maxWidth: "720px", margin: "32px auto", padding: "40px 48px",
                background: "#FFFFFF", border: "1px solid #EDE5D3", borderRadius: "12px",
                fontFamily: "var(--font-urbanist), 'Urbanist', sans-serif",
                color: "#2D2319",
            }}>
                {/* Cabeçalho */}
                <div style={{
                    display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                    paddingBottom: "24px", borderBottom: "2px solid #EDE5D3", marginBottom: "28px",
                }}>
                    <div>
                        {tenant?.logo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={tenant.logo_url} alt={tenant.name ?? "Clínica"} style={{ height: "40px", objectFit: "contain", marginBottom: "6px" }} />
                        ) : (
                            <div style={{
                                fontFamily: "'Playfair Display', serif",
                                fontSize: "20px", fontWeight: 700, color: "#B8960C", marginBottom: "4px",
                            }}>
                                {tenant?.name ?? "Clínica"}
                            </div>
                        )}
                        <div style={{ fontSize: "11px", color: "#A69060", fontWeight: 500 }}>
                            {tenant?.name}
                        </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <div style={{
                            fontSize: "18px", fontWeight: 800, color: "#B8960C",
                            letterSpacing: "0.04em", textTransform: "uppercase",
                        }}>
                            Ficha de Avaliação
                        </div>
                        {sigDate && (
                            <div style={{ fontSize: "11px", color: "#A69060", marginTop: "4px" }}>
                                {sigDate}
                            </div>
                        )}
                    </div>
                </div>

                {/* Dados da paciente */}
                <section style={{ marginBottom: "28px" }}>
                    <SectionTitle>Dados da Paciente</SectionTitle>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px" }}>
                        <Field label="Nome completo" value={client.name} />
                        <Field label="Idade" value={age ? `${age} anos` : "—"} />
                        <Field label="Data de nascimento" value={client.birth_date
                            ? new Date(client.birth_date + "T12:00:00").toLocaleDateString("pt-BR")
                            : "—"} />
                        <Field label="Sexo" value={client.sex === "F" ? "Feminino" : client.sex === "M" ? "Masculino" : client.sex ?? "—"} />
                        <Field label="Telefone" value={client.phone ?? "—"} />
                        <Field label="Email" value={client.email ?? "—"} />
                        {client.address && <Field label="Endereço" value={client.address} fullWidth />}
                    </div>
                </section>

                {/* Histórico de saúde */}
                {health && (
                    <section style={{ marginBottom: "28px" }}>
                        <SectionTitle>Histórico de Saúde</SectionTitle>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                            {healthFields.map(f => {
                                const active = (health as Record<string, unknown>)[f.key] as boolean;
                                return (
                                    <div key={f.key} style={{
                                        display: "flex", alignItems: "center", gap: "8px",
                                        padding: "8px 12px", borderRadius: "8px",
                                        background: active ? "rgba(184,150,12,0.06)" : "transparent",
                                        border: active ? "1px solid rgba(184,150,12,0.18)" : "1px solid transparent",
                                        opacity: active ? 1 : 0.45,
                                    }}>
                                        {active
                                            ? <CheckCircle2 size={14} style={{ color: "#B8960C", flexShrink: 0 }} />
                                            : <XCircle size={14} style={{ color: "#BBA870", flexShrink: 0 }} />
                                        }
                                        <span style={{
                                            fontSize: "13px",
                                            fontWeight: active ? 600 : 400,
                                            color: active ? "#2D2319" : "#A69060",
                                        }}>
                                            {f.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        {health.other_conditions && (
                            <div style={{ marginTop: "12px", padding: "12px", borderRadius: "8px", background: "rgba(184,150,12,0.06)", border: "1px solid rgba(184,150,12,0.18)" }}>
                                <div style={{ fontSize: "10px", fontWeight: 700, color: "#BBA870", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Outras condições</div>
                                <div style={{ fontSize: "13px", color: "#2D2319" }}>{health.other_conditions}</div>
                            </div>
                        )}
                    </section>
                )}

                {/* Medidas */}
                {health && (health.weight_kg || health.abs_cm || health.abi_cm) && (
                    <section style={{ marginBottom: "28px" }}>
                        <SectionTitle>Medidas Iniciais</SectionTitle>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                            {health.weight_kg && <MeasureCard label="Peso" value={`${health.weight_kg} kg`} />}
                            {health.abs_cm && <MeasureCard label="Abdômen" value={`${health.abs_cm} cm`} />}
                            {health.abi_cm && <MeasureCard label="Quadril/ABD inf." value={`${health.abi_cm} cm`} />}
                        </div>
                    </section>
                )}

                {/* Assinatura */}
                {sig && (
                    <section style={{ marginBottom: "0" }}>
                        <SectionTitle>Assinatura da Paciente</SectionTitle>
                        {sig.authorization_text && (
                            <div style={{
                                fontSize: "11px", color: "#8A7E60", lineHeight: "1.6",
                                padding: "12px", borderRadius: "8px",
                                background: "#FAFAF7", border: "1px solid #EDE5D3",
                                marginBottom: "16px",
                            }}>
                                {sig.authorization_text}
                            </div>
                        )}
                        {sig.signature_data && (
                            <div style={{ marginBottom: "8px" }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={sig.signature_data}
                                    alt="Assinatura digital"
                                    style={{
                                        maxHeight: "80px", border: "1px solid #EDE5D3",
                                        borderRadius: "8px", padding: "8px", background: "#FEFCF7",
                                    }}
                                />
                            </div>
                        )}
                        {sigDate && (
                            <div style={{ fontSize: "12px", color: "#A69060" }}>
                                Assinado eletronicamente em {sigDate}
                            </div>
                        )}
                    </section>
                )}
            </div>

            {/* CSS de impressão */}
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                    #documento-avaliacao {
                        border: none !important;
                        border-radius: 0 !important;
                        box-shadow: none !important;
                        margin: 0 !important;
                        max-width: 100% !important;
                    }
                }
            `}</style>
        </>
    );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <div style={{
            fontSize: "10px", fontWeight: 800, color: "#B8960C",
            letterSpacing: "0.12em", textTransform: "uppercase",
            marginBottom: "14px", paddingBottom: "6px",
            borderBottom: "1px solid #EDE5D3",
        }}>
            {children}
        </div>
    );
}

function Field({ label, value, fullWidth }: { label: string; value: string; fullWidth?: boolean }) {
    return (
        <div style={{ gridColumn: fullWidth ? "1 / -1" : undefined }}>
            <div style={{ fontSize: "9px", fontWeight: 700, color: "#BBA870", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "3px" }}>
                {label}
            </div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#2D2319" }}>{value}</div>
        </div>
    );
}

function MeasureCard({ label, value }: { label: string; value: string }) {
    return (
        <div style={{
            textAlign: "center", padding: "14px 12px", borderRadius: "10px",
            background: "rgba(184,150,12,0.05)", border: "1px solid rgba(184,150,12,0.15)",
        }}>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "#B8960C" }}>{value}</div>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#A69060", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "4px" }}>{label}</div>
        </div>
    );
}
