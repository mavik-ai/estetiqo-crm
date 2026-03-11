'use client'

import { useState, useRef } from 'react';
import Link from 'next/link';

const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "10px", fontWeight: 700, color: "#BBA870",
    letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "5px",
};
const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", borderRadius: "9px",
    border: "1px solid var(--border)", background: "var(--card)", fontSize: "13px",
    color: "var(--foreground)", fontFamily: "var(--font-urbanist), sans-serif",
    outline: "none", boxSizing: "border-box",
};

// Aplicar máscara de telefone (99) 99999-9999
function maskPhone(v: string): string {
    const d = v.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2) return d.length ? `(${d}` : '';
    if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`;
    return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
}

interface Client {
    id: string; name: string; phone: string | null;
    email: string | null; birth_date: string | null;
    sex: string | null; address: string | null; cep: string | null;
}

export function EditarClienteForm({ client, action, clientId }: {
    client: Client; action: (formData: FormData) => Promise<void>; clientId: string;
}) {
    const [phone, setPhone] = useState(client.phone ?? '');
    const [cep, setCep] = useState(client.cep ?? '');
    const [address, setAddress] = useState(client.address ?? '');
    const [loadingCep, setLoadingCep] = useState(false);

    // Extrair partes da data existente: YYYY-MM-DD ou 2000-MM-DD
    const parts = client.birth_date ? client.birth_date.split('-') : ['', '', ''];
    const storedYear = parts[0] === '2000' ? '' : (parts[0] ?? '');
    const [birthDay, setBirthDay] = useState(parts[2] ?? '');
    const [birthMonth, setBirthMonth] = useState(parts[1] ?? '');
    const [birthYear, setBirthYear] = useState(storedYear);

    async function handleCepBlur() {
        const raw = cep.replace(/\D/g, '');
        if (raw.length !== 8) return;
        setLoadingCep(true);
        try {
            const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
            const data = await res.json();
            if (!data.erro) {
                setAddress(`${data.logradouro}, ${data.bairro}, ${data.localidade}/${data.uf}`);
            }
        } catch {}
        setLoadingCep(false);
    }

    return (
        <form action={action}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                {/* Nome */}
                <div>
                    <label style={labelStyle}>Nome completo *</label>
                    <input name="name" type="text" defaultValue={client.name ?? ''} required style={inputStyle} />
                </div>

                {/* Telefone + E-mail */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                        <label style={labelStyle}>Telefone / WhatsApp</label>
                        <input name="phone" type="tel" value={phone} placeholder="(99) 99999-9999" style={inputStyle}
                            onChange={e => setPhone(maskPhone(e.target.value))} />
                    </div>
                    <div>
                        <label style={labelStyle}>E-mail</label>
                        <input name="email" type="email" defaultValue={client.email ?? ''} placeholder="email@exemplo.com" style={inputStyle} />
                    </div>
                </div>

                {/* Data de Nascimento: Dia + Mês + Ano opcional */}
                <div>
                    <label style={labelStyle}>Data de nascimento (dia e mês obrigatórios, ano opcional)</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '80px 90px 110px', gap: '10px' }}>
                        <div>
                            <input name="birth_day" type="number" min={1} max={31} value={birthDay} placeholder="Dia"
                                onChange={e => setBirthDay(e.target.value)} style={{ ...inputStyle, textAlign: 'center' }} />
                        </div>
                        <div>
                            <select name="birth_month" value={birthMonth} onChange={e => setBirthMonth(e.target.value)}
                                style={{ ...inputStyle, cursor: 'pointer' }}>
                                <option value="">Mês</option>
                                {['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'].map((m, i) => (
                                    <option key={i+1} value={String(i+1).padStart(2,'0')}>{m}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <input name="birth_year" type="number" min={1930} max={2025} value={birthYear} placeholder="Ano (opcional)"
                                onChange={e => setBirthYear(e.target.value)} style={{ ...inputStyle, textAlign: 'center' }} />
                        </div>
                    </div>
                </div>

                {/* Sexo */}
                <div>
                    <label style={labelStyle}>Sexo</label>
                    <select name="sex" defaultValue={client.sex ?? ''} style={{ ...inputStyle, cursor: 'pointer' }}>
                        <option value="">Não informado</option>
                        <option value="F">Feminino</option>
                        <option value="M">Masculino</option>
                        <option value="O">Outro</option>
                    </select>
                </div>

                {/* CEP + Endereço */}
                <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '12px' }}>
                    <div>
                        <label style={labelStyle}>CEP {loadingCep && '(buscando...)'}</label>
                        <input name="cep" type="text" value={cep} placeholder="00000-000" maxLength={9}
                            onChange={e => setCep(e.target.value.replace(/\D/g,'').slice(0,8))}
                            onBlur={handleCepBlur}
                            style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>Endereço</label>
                        <input name="address" type="text" value={address} placeholder="Rua, número, bairro, cidade"
                            onChange={e => setAddress(e.target.value)} style={inputStyle} />
                    </div>
                </div>

            </div>

            {/* Ações */}
            <div style={{ marginTop: '18px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <Link href="/clientes" style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', fontWeight: 600, color: 'var(--muted-foreground)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                    Cancelar
                </Link>
                <button type="submit" style={{ padding: '9px 22px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #D4B86A, #B8960C)', color: '#161412', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                    Salvar alterações
                </button>
            </div>
        </form>
    );
}
