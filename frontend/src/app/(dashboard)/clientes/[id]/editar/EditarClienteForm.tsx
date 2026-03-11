'use client'

import { useState } from 'react';
import Link from 'next/link';

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  color: '#BBA870',
  letterSpacing: '0.03em',
  textTransform: 'uppercase' as const,
  marginBottom: '5px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid var(--border)',
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
  borderRadius: '14px',
  padding: '24px',
  marginBottom: '16px',
  maxWidth: '600px',
};

const sectionTitle: React.CSSProperties = {
  fontFamily: "'Playfair Display', serif",
  fontSize: '16px',
  fontWeight: 700,
  color: 'var(--foreground)',
  margin: '0 0 4px',
};

const sectionDesc: React.CSSProperties = {
  color: 'var(--muted-foreground)',
  fontSize: '13px',
  margin: '0 0 20px',
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

function formatBirthDm(birth_date: string | null): string {
  if (!birth_date) return '';
  const [, m, d] = birth_date.split('-');
  if (!m || !d) return '';
  return `${d}/${m}`;
}

function getBirthYear(birth_date: string | null): string {
  if (!birth_date) return '';
  const y = birth_date.split('-')[0];
  return y === '2000' ? '' : y;
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

      {/* ── SEÇÃO 1: Dados básicos ── */}
      <div style={card}>
        <h2 style={sectionTitle}>Dados básicos</h2>
        <p style={sectionDesc}>Informações principais da paciente</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={labelStyle}>Nome completo *</label>
            <input name="name" type="text" defaultValue={client.name ?? ''} required style={inputStyle} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '120px 100px 1fr', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Aniversário</label>
              <input
                name="birth_dm"
                type="text"
                defaultValue={formatBirthDm(client.birth_date)}
                placeholder="00/00"
                maxLength={5}
                onChange={e => {
                  let v = e.target.value.replace(/\D/g, '');
                  if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2, 4);
                  e.target.value = v;
                }}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Ano nasc.</label>
              <input
                name="birth_year"
                type="text"
                defaultValue={getBirthYear(client.birth_date)}
                placeholder="0000"
                maxLength={4}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Sexo</label>
              <select name="sex" defaultValue={client.sex ?? ''} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Não informado</option>
                <option value="F">Feminino</option>
                <option value="M">Masculino</option>
                <option value="O">Outro</option>
              </select>
            </div>
          </div>

          <div style={{ maxWidth: '160px' }}>
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

      {/* ── SEÇÃO 2: Informações para contato ── */}
      <div style={card}>
        <h2 style={sectionTitle}>Informações para contato</h2>
        <p style={sectionDesc}>Adicione informações que facilitem o contato com a cliente.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label style={labelStyle}>E-mail</label>
            <input name="email" type="email" defaultValue={client.email ?? ''} placeholder="exemplo@email.com" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>WhatsApp</label>
            <input name="phone" type="tel" defaultValue={client.phone ?? ''} placeholder="(99) 99999-9999" style={inputStyle} />
          </div>
        </div>
      </div>

      {/* ── SEÇÃO 3: Dados de endereço ── */}
      <div style={card}>
        <h2 style={sectionTitle}>Dados de endereço</h2>
        <p style={sectionDesc}>Adicione a localização da sua cliente.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 120px', gap: '14px' }}>
            <div>
              <label style={labelStyle}>
                CEP {fetchingCep && <span style={{ fontSize: '10px', color: '#B8960C' }}>buscando...</span>}
              </label>
              <input
                name="cep" type="text"
                value={cep} onChange={handleCepChange}
                placeholder="00000-000" maxLength={8}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>País</label>
              <input name="pais" type="text" defaultValue="Brasil" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Estado</label>
              <input
                name="uf" type="text"
                value={uf} onChange={e => setUf(e.target.value.toUpperCase())}
                placeholder="SP" maxLength={2}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Cidade</label>
              <input name="cidade" type="text" value={cidade} onChange={e => setCidade(e.target.value)} placeholder="Cidade" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Bairro</label>
              <input name="bairro" type="text" value={bairro} onChange={e => setBairro(e.target.value)} placeholder="Bairro X" style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 160px', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Rua</label>
              <input name="logradouro" type="text" value={logradouro} onChange={e => setLogradouro(e.target.value)} placeholder="Rua Y" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Número</label>
              <input name="numero" type="text" defaultValue={client.numero ?? ''} placeholder="77" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Complemento</label>
              <input name="complemento" type="text" defaultValue={client.complemento ?? ''} placeholder="Sala 153, Bloco B" style={inputStyle} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '600px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
