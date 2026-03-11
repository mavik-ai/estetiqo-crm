'use client'

import { useState } from 'react';
import Link from 'next/link';

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 700,
  color: '#BBA870',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '10px',
  border: '1px solid #EDE5D3',
  background: 'var(--accent)',
  fontSize: '14px',
  color: 'var(--foreground)',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
};

const card: React.CSSProperties = {
  background: 'var(--card)',
  border: '1px solid #EDE5D3',
  borderRadius: '16px',
  padding: '28px',
  marginBottom: '16px',
  maxWidth: '560px',
};

const sectionTitle: React.CSSProperties = {
  fontFamily: "'Playfair Display', serif",
  fontSize: '15px',
  fontWeight: 700,
  color: 'var(--foreground)',
  marginBottom: '16px',
};

interface ClientData {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  birth_date: string | null;
  sex: string | null;
  cep: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
  rating: number | null;
}

function parseBirthDate(birth_date: string | null) {
  if (!birth_date) return { day: '', month: '', year: '' };
  const [y, m, d] = birth_date.split('-');
  return { day: String(Number(d)), month: m, year: y !== '2000' ? y : '' };
}

export function EditarClienteForm({
  client,
  action,
  clientId,
}: {
  client: ClientData;
  action: (formData: FormData) => Promise<void>;
  clientId: string;
}) {
  const birth = parseBirthDate(client.birth_date);

  const [cep, setCep] = useState(client.cep ?? '');
  const [logradouro, setLogradouro] = useState(client.logradouro ?? '');
  const [bairro, setBairro] = useState(client.bairro ?? '');
  const [cidade, setCidade] = useState(client.cidade ?? '');
  const [uf, setUf] = useState(client.uf ?? '');
  const [fetchingCep, setFetchingCep] = useState(false);

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 8) val = val.slice(0, 8);
    setCep(val);
    if (val.length === 8) {
      setFetchingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${val}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setLogradouro(data.logradouro ?? '');
          setBairro(data.bairro ?? '');
          setCidade(data.localidade ?? '');
          setUf(data.uf ?? '');
        }
      } catch { /* silencioso */ } finally {
        setFetchingCep(false);
      }
    }
  };

  return (
    <form action={action}>
      {/* Dados Pessoais */}
      <div style={card}>
        <p style={sectionTitle}>Dados Pessoais</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={labelStyle}>Nome completo *</label>
            <input name="name" type="text" defaultValue={client.name ?? ''} required style={inputStyle} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Telefone / WhatsApp</label>
              <input name="phone" type="tel" defaultValue={client.phone ?? ''} placeholder="(98) 99999-9999" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>E-mail</label>
              <input name="email" type="email" defaultValue={client.email ?? ''} placeholder="email@exemplo.com" style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Data de nascimento</label>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 100px', gap: '10px' }}>
              <input
                name="birth_day"
                type="number"
                min={1} max={31}
                placeholder="Dia"
                defaultValue={birth.day}
                style={inputStyle}
              />
              <select name="birth_month" defaultValue={birth.month} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Mês</option>
                {["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
                  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"]
                  .map((m, i) => (
                    <option key={i + 1} value={String(i + 1).padStart(2, '0')}>{m}</option>
                ))}
              </select>
              <input
                name="birth_year"
                type="number"
                min={1900}
                max={new Date().getFullYear()}
                placeholder="Ano"
                defaultValue={birth.year}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Sexo</label>
              <select name="sex" defaultValue={client.sex ?? ''} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Não informado</option>
                <option value="F">Feminino</option>
                <option value="M">Masculino</option>
                <option value="O">Outro</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Potencial da cliente</label>
              <select name="rating" defaultValue={(client.rating ?? 1).toString()} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="1">⭐</option>
                <option value="2">⭐⭐</option>
                <option value="3">⭐⭐⭐</option>
                <option value="4">⭐⭐⭐⭐</option>
                <option value="5">⭐⭐⭐⭐⭐</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Endereço */}
      <div style={card}>
        <p style={sectionTitle}>Endereço</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ maxWidth: '160px' }}>
            <label style={labelStyle}>
              CEP {fetchingCep && <span style={{ fontSize: '11px', color: '#B8960C', marginLeft: '4px' }}>buscando...</span>}
            </label>
            <input
              name="cep"
              type="text"
              value={cep}
              onChange={handleCepChange}
              placeholder="00000000"
              maxLength={8}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Logradouro</label>
              <input
                name="logradouro"
                type="text"
                value={logradouro}
                onChange={e => setLogradouro(e.target.value)}
                placeholder="Rua / Avenida..."
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Número</label>
              <input name="numero" type="text" defaultValue={client.numero ?? ''} placeholder="123" style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Complemento</label>
            <input name="complemento" type="text" defaultValue={client.complemento ?? ''} placeholder="Apto, bloco... (opcional)" style={inputStyle} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Bairro</label>
              <input name="bairro" type="text" value={bairro} onChange={e => setBairro(e.target.value)} placeholder="Bairro" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Cidade</label>
              <input name="cidade" type="text" value={cidade} onChange={e => setCidade(e.target.value)} placeholder="Cidade" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>UF</label>
              <input name="uf" type="text" value={uf} onChange={e => setUf(e.target.value.toUpperCase())} placeholder="SP" maxLength={2} style={inputStyle} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href={`/clientes/${clientId}`} style={{ fontSize: '13px', color: 'var(--muted-foreground)', textDecoration: 'none' }}>
          Cancelar
        </Link>
        <button
          type="submit"
          style={{
            padding: '11px 28px', borderRadius: '10px', border: 'none',
            background: 'linear-gradient(135deg, #D4B86A, #B8960C)',
            color: '#161412', fontSize: '14px', fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Salvar alterações
        </button>
      </div>
    </form>
  );
}
