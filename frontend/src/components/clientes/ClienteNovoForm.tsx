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
    textTransform: "uppercase" as const,
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
    margin: "0 0 4px",
};

const sectionDesc: React.CSSProperties = {
    color: "var(--muted-foreground)",
    fontSize: "13px",
    margin: "0 0 20px",
};

export function ClienteNovoForm({ nomeInicial = "" }: { nomeInicial?: string }) {
    const [isPending, startTransition] = useTransition();

    // ViaCEP
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
            } catch { /* silencioso */ } finally {
                setFetchingCep(false);
            }
        }
    };

    return (
        <form action={(formData) => {
            startTransition(() => { criarCliente(formData); });
        }}>

            {/* ── SEÇÃO 1: Dados básicos ── */}
            <div style={card}>
                <h2 style={sectionTitle}>Dados básicos</h2>
                <p style={sectionDesc}>Informações principais da paciente</p>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {/* Nome */}
                    <div>
                        <label htmlFor="name" style={labelStyle}>Nome completo *</label>
                        <input
                            id="name" name="name" type="text" required
                            defaultValue={nomeInicial}
                            placeholder="Nome da paciente"
                            style={inputStyle}
                        />
                    </div>

                    {/* Aniversário + Ano + Sexo */}
                    <div style={{ display: "grid", gridTemplateColumns: "120px 100px 1fr", gap: "14px" }}>
                        <div>
                            <label htmlFor="birth_dm" style={labelStyle}>Aniversário</label>
                            <input
                                id="birth_dm" name="birth_dm" type="text"
                                placeholder="00/00"
                                maxLength={5}
                                onChange={e => {
                                    // máscara DD/MM
                                    let v = e.target.value.replace(/\D/g, "");
                                    if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2, 4);
                                    e.target.value = v;
                                }}
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label htmlFor="birth_year" style={labelStyle}>Ano nasc.</label>
                            <input
                                id="birth_year" name="birth_year" type="text"
                                placeholder="0000"
                                maxLength={4}
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
                </div>
            </div>

            {/* ── SEÇÃO 2: Informações para contato ── */}
            <div style={card}>
                <h2 style={sectionTitle}>Informações para contato</h2>
                <p style={sectionDesc}>Adicione informações que facilitem o contato com a cliente.</p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <div>
                        <label htmlFor="email" style={labelStyle}>E-mail</label>
                        <input
                            id="email" name="email" type="email"
                            placeholder="exemplo@email.com"
                            style={inputStyle}
                        />
                    </div>
                    <div>
                        <label htmlFor="phone" style={labelStyle}>WhatsApp</label>
                        <input
                            id="phone" name="phone" type="text"
                            placeholder="(99) 99999-9999"
                            maxLength={15}
                            onChange={e => {
                                let v = e.target.value.replace(/\D/g, '');
                                if (v.length > 11) v = v.slice(0, 11);
                                if (v.length > 6) v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
                                else if (v.length > 2) v = `(${v.slice(0,2)}) ${v.slice(2)}`;
                                else if (v.length > 0) v = `(${v}`;
                                e.target.value = v;
                            }}
                            style={inputStyle}
                        />
                    </div>
                </div>
            </div>

            {/* ── SEÇÃO 3: Dados de endereço ── */}
            <div style={card}>
                <h2 style={sectionTitle}>Dados de endereço</h2>
                <p style={sectionDesc}>Adicione a localização da sua cliente.</p>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {/* CEP + País + Estado */}
                    <div style={{ display: "grid", gridTemplateColumns: "140px 1fr 120px", gap: "14px" }}>
                        <div>
                            <label htmlFor="cep" style={labelStyle}>
                                CEP {fetchingCep && <span style={{ fontSize: "10px", color: "#B8960C" }}>buscando...</span>}
                            </label>
                            <input
                                id="cep" name="cep" type="text"
                                value={cep} onChange={handleCepChange}
                                placeholder="00000-000"
                                maxLength={8}
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label htmlFor="pais" style={labelStyle}>País</label>
                            <input
                                id="pais" name="pais" type="text"
                                defaultValue="Brasil"
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label htmlFor="uf" style={labelStyle}>Estado</label>
                            <input
                                id="uf" name="uf" type="text"
                                value={uf} onChange={e => setUf(e.target.value.toUpperCase())}
                                placeholder="SP"
                                maxLength={2}
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    {/* Cidade + Bairro */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                        <div>
                            <label htmlFor="cidade" style={labelStyle}>Cidade</label>
                            <input
                                id="cidade" name="cidade" type="text"
                                value={cidade} onChange={e => setCidade(e.target.value)}
                                placeholder="Cidade"
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label htmlFor="bairro" style={labelStyle}>Bairro</label>
                            <input
                                id="bairro" name="bairro" type="text"
                                value={bairro} onChange={e => setBairro(e.target.value)}
                                placeholder="Bairro X"
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    {/* Rua + Número + Complemento */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 160px", gap: "14px" }}>
                        <div>
                            <label htmlFor="logradouro" style={labelStyle}>Rua</label>
                            <input
                                id="logradouro" name="logradouro" type="text"
                                value={logradouro} onChange={e => setLogradouro(e.target.value)}
                                placeholder="Rua Y"
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label htmlFor="numero" style={labelStyle}>Número</label>
                            <input
                                id="numero" name="numero" type="text"
                                placeholder="77"
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label htmlFor="complemento" style={labelStyle}>Complemento</label>
                            <input
                                id="complemento" name="complemento" type="text"
                                placeholder="Sala 153, Bloco B"
                                style={inputStyle}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Botão */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                    type="submit"
                    disabled={isPending}
                    style={{
                        background: isPending ? "var(--muted)" : "linear-gradient(135deg, #D4B86A, #B8960C)",
                        color: isPending ? "var(--muted-foreground)" : "#161412",
                        fontWeight: 700,
                        fontSize: "14px",
                        padding: "11px 32px",
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
