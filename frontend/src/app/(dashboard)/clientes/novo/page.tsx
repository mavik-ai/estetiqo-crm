import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { criarCliente } from "./actions";

const healthFields: { key: string; label: string }[] = [
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

const card: React.CSSProperties = {
    background: "#FFFFFF",
    border: "1px solid #EDE5D3",
    borderRadius: "14px",
    padding: "24px",
    marginBottom: "16px",
};

const sectionTitle: React.CSSProperties = {
    fontFamily: "'Playfair Display', serif",
    fontSize: "16px",
    fontWeight: 700,
    color: "#2D2319",
    marginBottom: "4px",
};

export default async function NovaClientePage({
    searchParams,
}: {
    searchParams: Promise<{ nome?: string }>;
}) {
    const sp = await searchParams;
    const nomeInicial = sp.nome ?? "";

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
                        marginBottom: "8px",
                    }}
                >
                    <ChevronLeft size={14} strokeWidth={2} />
                    Voltar
                </Link>
                <h1
                    style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "22px",
                        fontWeight: 700,
                        color: "#2D2319",
                        margin: 0,
                    }}
                >
                    Nova Cliente
                </h1>
            </div>

            <form action={criarCliente}>
                {/* Seção 1: Dados Pessoais */}
                <div style={card}>
                    <h2 style={sectionTitle}>Dados Pessoais</h2>
                    <p style={{ color: "#A69060", fontSize: "13px", margin: "0 0 20px" }}>
                        Informações básicas da cliente
                    </p>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr",
                            gap: "14px",
                        }}
                    >
                        {/* Nome completo — full width */}
                        <div>
                            <label htmlFor="name" style={labelStyle}>
                                Nome completo *
                            </label>
                            <input
                                id="name"
                                type="text"
                                name="name"
                                required
                                defaultValue={nomeInicial}
                                placeholder="Nome da cliente"
                                style={inputStyle}
                            />
                        </div>

                        {/* Grid 2 colunas */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                                gap: "14px",
                            }}
                        >
                            <div>
                                <label htmlFor="birth_date" style={labelStyle}>
                                    Data de nascimento
                                </label>
                                <input
                                    id="birth_date"
                                    type="date"
                                    name="birth_date"
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label htmlFor="sex" style={labelStyle}>
                                    Sexo
                                </label>
                                <select id="sex" name="sex" style={inputStyle}>
                                    <option value="">Selecionar...</option>
                                    <option value="F">Feminino</option>
                                    <option value="M">Masculino</option>
                                    <option value="O">Outro</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="phone" style={labelStyle}>
                                    Telefone
                                </label>
                                <input
                                    id="phone"
                                    type="text"
                                    name="phone"
                                    placeholder="(99) 99999-9999"
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label htmlFor="rating" style={labelStyle}>
                                    Avaliação inicial
                                </label>
                                <select id="rating" name="rating" style={inputStyle}>
                                    <option value="">Sem avaliação</option>
                                    <option value="1">1 estrela</option>
                                    <option value="2">2 estrelas</option>
                                    <option value="3">3 estrelas</option>
                                    <option value="4">4 estrelas</option>
                                    <option value="5">5 estrelas</option>
                                </select>
                            </div>
                        </div>

                        {/* Endereço — full width */}
                        <div>
                            <label htmlFor="address" style={labelStyle}>
                                Endereço
                            </label>
                            <input
                                id="address"
                                type="text"
                                name="address"
                                placeholder="Rua, número, bairro, cidade"
                                style={inputStyle}
                            />
                        </div>
                    </div>
                </div>

                {/* Seção 2: Ficha de Saúde */}
                <div style={card}>
                    <h2 style={sectionTitle}>Ficha de Saúde</h2>
                    <p style={{ color: "#A69060", fontSize: "13px", margin: "0 0 20px" }}>
                        16 perguntas obrigatórias
                    </p>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                            gap: "8px",
                            marginBottom: "14px",
                        }}
                    >
                        {healthFields.map(({ key, label }) => (
                            <label
                                key={key}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    background: "#FBF5EA",
                                    border: "1px solid #EDE5D3",
                                    borderRadius: "8px",
                                    padding: "10px 12px",
                                    cursor: "pointer",
                                    fontSize: "13px",
                                    color: "#2D2319",
                                    fontWeight: 500,
                                }}
                            >
                                <input
                                    type="checkbox"
                                    name={key}
                                    style={{
                                        accentColor: "#B8960C",
                                        width: "15px",
                                        height: "15px",
                                        flexShrink: 0,
                                        cursor: "pointer",
                                    }}
                                />
                                {label}
                            </label>
                        ))}
                    </div>

                    {/* Outros problemas */}
                    <div>
                        <label htmlFor="other_conditions" style={labelStyle}>
                            Outros problemas de saúde não citados acima
                        </label>
                        <textarea
                            id="other_conditions"
                            name="other_conditions"
                            placeholder="Descreva outros problemas de saúde relevantes..."
                            rows={3}
                            style={{
                                ...inputStyle,
                                resize: "vertical",
                                lineHeight: "1.5",
                            }}
                        />
                    </div>
                </div>

                {/* Botão submit */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                    }}
                >
                    <button
                        type="submit"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            background: "linear-gradient(135deg, #D4B86A, #B8960C)",
                            color: "#161412",
                            fontWeight: 700,
                            fontSize: "14px",
                            padding: "11px 28px",
                            borderRadius: "9px",
                            border: "none",
                            cursor: "pointer",
                            fontFamily: "var(--font-urbanist), sans-serif",
                            letterSpacing: "0.01em",
                            width: "100%",
                        }}
                    >
                        Salvar Cliente
                    </button>
                </div>

                <style>{`
                    @media (min-width: 640px) {
                        button[type="submit"] {
                            width: auto !important;
                        }
                    }
                `}</style>
            </form>
        </div>
    );
}
