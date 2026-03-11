'use client'

import { useState, useTransition } from "react";
import { criarCliente } from "@/app/(dashboard)/clientes/novo/actions";

const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    fontSize: "14px",
    color: "var(--foreground)",
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
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "14px",
    padding: "24px",
    marginBottom: "16px",
};

const sectionTitle: React.CSSProperties = {
    fontFamily: "'Playfair Display', serif",
    fontSize: "16px",
    fontWeight: 700,
    color: "var(--foreground)",
    marginBottom: "4px",
};

export function ClienteNovoForm({ nomeInicial = "" }: { nomeInicial?: string }) {
    const [isPending, startTransition] = useTransition();

    // Endereço
    const [cep, setCep] = useState("");
    const [logradouro, setLogradouro] = useState("");
    const [bairro, setBairro] = useState("");
    const [cidade, setCidade] = useState("");
    const [uf, setUf] = useState("");
    const [fetchingCep, setFetchingCep] = useState(false);

    const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, "");
        if (val.length > 8) val = val.slice(0, 8);
        setCep(val);

        if (val.length === 8) {
            setFetchingCep(true);
            try {
                const res = await fetch(`https://viacep.com.br/ws/${val}/json/`);
                const data = await res.json();
                if (!data.erro) {
                    setLogradouro(data.logradouro ?? "");
                    setBairro(data.bairro ?? "");
                    setCidade(data.localidade ?? "");
                    setUf(data.uf ?? "");
                }
            } catch {
                // silencioso — usuário preenche manualmente
            } finally {
                setFetchingCep(false);
            }
        }
    };

    return (
        <form action={(formData) => {
            startTransition(() => { criarCliente(formData); });
        }}>
            {/* Dados Pessoais */}
            <div style={card}>
                <h2 style={sectionTitle}>Dados Pessoais</h2>
                <p style={{ color: "var(--muted-foreground)", fontSize: "13px", margin: "0 0 20px" }}>
                    Informações básicas da paciente
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {/* Nome */}
                    <div>
                        <label htmlFor="name" style={labelStyle}>Nome completo *</label>
                        <input
                            id="name"
                            type="text"
                            name="name"
                            required
                            defaultValue={nomeInicial}
                            placeholder="Nome da paciente"
                            style={inputStyle}
                        />
                    </div>

                    {/* Nascimento + Sexo */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px" }}>
                        <div>
                            <label style={labelStyle}>Dia e mês de nascimento</label>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                                <input
                                    type="number"
                                    name="birth_day"
                                    min={1} max={31}
                                    placeholder="Dia"
                                    style={inputStyle}
                                />
                                <select name="birth_month" style={{ ...inputStyle, cursor: "pointer" }}>
                                    <option value="">Mês</option>
                                    {["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
                                      "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"]
                                      .map((m, i) => (
                                        <option key={i + 1} value={String(i + 1).padStart(2, "0")}>{m}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="birth_year" style={labelStyle}>Ano de nascimento</label>
                            <input
                                id="birth_year"
                                type="number"
                                name="birth_year"
                                min={1900}
                                max={new Date().getFullYear()}
                                placeholder="Ex: 1990"
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label htmlFor="sex" style={labelStyle}>Sexo</label>
                            <select id="sex" name="sex" style={{ ...inputStyle, cursor: "pointer" }}>
                                <option value="">Selecionar...</option>
                                <option value="F">Feminino</option>
                                <option value="M">Masculino</option>
                                <option value="O">Outro</option>
                            </select>
                        </div>
                    </div>

                    {/* Contato */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
                        <div>
                            <label htmlFor="phone" style={labelStyle}>Telefone / WhatsApp</label>
                            <input
                                id="phone"
                                type="text"
                                name="phone"
                                placeholder="(99) 99999-9999"
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label htmlFor="email" style={labelStyle}>E-mail</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="email@exemplo.com"
                                style={inputStyle}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Endereço */}
            <div style={card}>
                <h2 style={sectionTitle}>Endereço</h2>
                <p style={{ color: "var(--muted-foreground)", fontSize: "13px", margin: "0 0 20px" }}>
                    Digite o CEP para preencher automaticamente
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {/* CEP */}
                    <div style={{ maxWidth: "160px" }}>
                        <label htmlFor="cep" style={labelStyle}>
                            CEP {fetchingCep && <span style={{ fontSize: "11px", color: "#B8960C", marginLeft: "4px" }}>buscando...</span>}
                        </label>
                        <input
                            id="cep"
                            name="cep"
                            type="text"
                            value={cep}
                            onChange={handleCepChange}
                            placeholder="00000000"
                            maxLength={8}
                            style={inputStyle}
                        />
                    </div>

                    {/* Logradouro + Número */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: "14px" }}>
                        <div>
                            <label htmlFor="logradouro" style={labelStyle}>Logradouro</label>
                            <input
                                id="logradouro"
                                name="logradouro"
                                type="text"
                                value={logradouro}
                                onChange={e => setLogradouro(e.target.value)}
                                placeholder="Rua / Avenida..."
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label htmlFor="numero" style={labelStyle}>Número</label>
                            <input
                                id="numero"
                                name="numero"
                                type="text"
                                placeholder="123"
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    {/* Complemento */}
                    <div>
                        <label htmlFor="complemento" style={labelStyle}>Complemento</label>
                        <input
                            id="complemento"
                            name="complemento"
                            type="text"
                            placeholder="Apto, bloco, sala... (opcional)"
                            style={inputStyle}
                        />
                    </div>

                    {/* Bairro + Cidade + UF */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px", gap: "14px" }}>
                        <div>
                            <label htmlFor="bairro" style={labelStyle}>Bairro</label>
                            <input
                                id="bairro"
                                name="bairro"
                                type="text"
                                value={bairro}
                                onChange={e => setBairro(e.target.value)}
                                placeholder="Bairro"
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label htmlFor="cidade" style={labelStyle}>Cidade</label>
                            <input
                                id="cidade"
                                name="cidade"
                                type="text"
                                value={cidade}
                                onChange={e => setCidade(e.target.value)}
                                placeholder="Cidade"
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label htmlFor="uf" style={labelStyle}>UF</label>
                            <input
                                id="uf"
                                name="uf"
                                type="text"
                                value={uf}
                                onChange={e => setUf(e.target.value.toUpperCase())}
                                placeholder="SP"
                                maxLength={2}
                                style={inputStyle}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Botão submit */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                    type="submit"
                    disabled={isPending}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: isPending ? "var(--muted)" : "linear-gradient(135deg, #D4B86A, #B8960C)",
                        color: isPending ? "var(--muted-foreground)" : "#161412",
                        fontWeight: 700,
                        fontSize: "14px",
                        padding: "11px 28px",
                        borderRadius: "9px",
                        border: "none",
                        cursor: isPending ? "not-allowed" : "pointer",
                        fontFamily: "var(--font-urbanist), sans-serif",
                        opacity: isPending ? 0.7 : 1,
                    }}
                >
                    {isPending ? "Salvando..." : "Salvar Cliente"}
                </button>
            </div>
        </form>
    );
}
