'use client'

import { useState, useTransition } from 'react';
import { salvarDadosClinica } from './actions';

interface TenantData {
  name: string | null;
  phone: string | null;
  email: string | null;
  cnpj: string | null;
  slug: string | null;
  cep: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  inscricao_municipal: string | null;
  regime_tributario: string | null;
}

interface Props {
  tenant: TenantData | null;
}

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
  border: '1px solid var(--border)',
  background: 'var(--accent)',
  fontSize: '14px',
  color: 'var(--foreground)',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
};

const sectionTitle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 700,
  color: 'var(--muted-foreground)',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  margin: '0 0 16px',
  paddingBottom: '8px',
  borderBottom: '1px solid var(--border)',
};

export function ClinicaForm({ tenant }: Props) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  // Endereço
  const [cep, setCep] = useState(tenant?.cep ?? '');
  const [logradouro, setLogradouro] = useState(tenant?.logradouro ?? '');
  const [bairro, setBairro] = useState(tenant?.bairro ?? '');
  const [cidade, setCidade] = useState(tenant?.cidade ?? '');
  const [estado, setEstado] = useState(tenant?.estado ?? '');
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState('');

  async function buscarCep(raw: string) {
    const digits = raw.replace(/\D/g, '');
    setCep(raw);
    if (digits.length !== 8) { setCepError(''); return; }
    setCepLoading(true);
    setCepError('');
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (data.erro) { setCepError('CEP não encontrado'); return; }
      setLogradouro(data.logradouro ?? '');
      setBairro(data.bairro ?? '');
      setCidade(data.localidade ?? '');
      setEstado(data.uf ?? '');
    } catch {
      setCepError('Erro ao buscar CEP');
    } finally {
      setCepLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await salvarDadosClinica(fd);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>

      {/* Dados Básicos */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px', marginBottom: '16px' }}>
        <p style={sectionTitle}>Dados Básicos</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={labelStyle}>Nome da Clínica *</label>
            <input name="name" type="text" defaultValue={tenant?.name ?? ''} required
              placeholder="Ex: Estética Michele Oliveira" style={inputStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Telefone / WhatsApp</label>
              <input name="phone" type="tel" defaultValue={tenant?.phone ?? ''}
                placeholder="(98) 99999-9999" style={inputStyle} />
              <p style={{ fontSize: '11px', color: '#BBA870', margin: '4px 0 0' }}>
                Aparece no rodapé do RSVP da cliente
              </p>
            </div>
            <div>
              <label style={labelStyle}>Email de contato</label>
              <input name="email" type="email" defaultValue={tenant?.email ?? ''}
                placeholder="contato@clinica.com.br" style={inputStyle} />
            </div>
          </div>
        </div>
      </div>

      {/* Endereço */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px', marginBottom: '16px' }}>
        <p style={sectionTitle}>Endereço</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* CEP */}
          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '14px', alignItems: 'flex-start' }}>
            <div>
              <label style={labelStyle}>CEP</label>
              <div style={{ position: 'relative' }}>
                <input
                  name="cep"
                  type="text"
                  value={cep}
                  onChange={(e) => buscarCep(e.target.value)}
                  placeholder="00000-000"
                  maxLength={9}
                  style={{ ...inputStyle, paddingRight: cepLoading ? '36px' : '14px' }}
                />
                {cepLoading && (
                  <div style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    width: '14px', height: '14px', borderRadius: '50%',
                    border: '2px solid #EDE5D3', borderTopColor: '#B8960C',
                    animation: 'spin 0.7s linear infinite',
                  }} />
                )}
              </div>
              {cepError && <p style={{ fontSize: '11px', color: '#D94444', margin: '4px 0 0' }}>{cepError}</p>}
            </div>
            <div>
              <label style={labelStyle}>Logradouro</label>
              <input name="logradouro" type="text" value={logradouro}
                onChange={e => setLogradouro(e.target.value)}
                placeholder="Rua / Av. / Travessa" style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Número</label>
              <input name="numero" type="text" defaultValue={tenant?.numero ?? ''}
                placeholder="123" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Complemento</label>
              <input name="complemento" type="text" defaultValue={tenant?.complemento ?? ''}
                placeholder="Sala 2, Andar 3..." style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Bairro</label>
              <input name="bairro" type="text" value={bairro}
                onChange={e => setBairro(e.target.value)}
                placeholder="Bairro" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Cidade</label>
              <input name="cidade" type="text" value={cidade}
                onChange={e => setCidade(e.target.value)}
                placeholder="São Luís" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>UF</label>
              <input name="estado" type="text" value={estado}
                onChange={e => setEstado(e.target.value.toUpperCase())}
                placeholder="MA" maxLength={2} style={inputStyle} />
            </div>
          </div>
        </div>
      </div>

      {/* Dados Fiscais */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px', marginBottom: '16px' }}>
        <p style={sectionTitle}>Dados Fiscais</p>
        <div>
          <label style={labelStyle}>CNPJ</label>
          <input name="cnpj" type="text" defaultValue={tenant?.cnpj ?? ''}
            placeholder="00.000.000/0001-00" style={inputStyle} />
          <p style={{ fontSize: '11px', color: '#BBA870', margin: '4px 0 0' }}>
            Pessoa Jurídica ou MEI. Usado para emissão de NFS-e.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
        {saved && (
          <span style={{ fontSize: '13px', color: '#2D8C4E', fontWeight: 600 }}>
            ✓ Dados salvos com sucesso!
          </span>
        )}
        <button
          type="submit"
          disabled={isPending}
          style={{
            padding: '11px 32px', borderRadius: '10px', border: 'none',
            background: isPending ? '#D4C8A8' : 'linear-gradient(135deg, #D4B86A, #B8960C)',
            color: '#161412', fontSize: '14px', fontWeight: 700,
            cursor: isPending ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            opacity: isPending ? 0.7 : 1,
          }}
        >
          {isPending ? 'Salvando...' : 'Salvar dados'}
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: translateY(-50%) rotate(360deg); } }`}</style>
    </form>
  );
}
