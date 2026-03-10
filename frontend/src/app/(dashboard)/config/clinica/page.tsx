import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { ChevronLeft, Building2 } from 'lucide-react';
import { salvarDadosClinica } from './actions';
import { SavedToast } from '@/components/ui/SavedToast';
import { Suspense } from 'react';

interface Props {
  searchParams: Promise<{ saved?: string }>;
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
  border: '1px solid #EDE5D3',
  background: '#FEFCF7',
  fontSize: '14px',
  color: '#2D2319',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
};

export default async function ConfigClinicaPage({ searchParams }: Props) {
  const { saved } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('users').select('tenant_id').eq('id', user!.id).single();
  const { data: tenant } = await supabase
    .from('tenants')
    .select('name, phone, email, cnpj, slug')
    .eq('id', profile!.tenant_id)
    .single();

  return (
    <div style={{ padding: '24px', minHeight: '100%', background: '#F6F2EA' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Link
          href="/config"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            fontSize: '13px', color: '#A69060', textDecoration: 'none', marginBottom: '10px',
          }}
        >
          <ChevronLeft size={14} strokeWidth={2} />
          Configurações
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
            background: 'linear-gradient(135deg, #D4B86A, #B8960C)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Building2 size={20} strokeWidth={1.8} color="#FFFDF7" />
          </div>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 700, color: '#2D2319', margin: 0 }}>
              Dados da Clínica
            </h1>
            <p style={{ fontSize: '13px', color: '#A69060', margin: '2px 0 0' }}>
              Informações que aparecem nas comunicações com clientes
            </p>
          </div>
        </div>
      </div>

      <Suspense fallback={null}>
        <SavedToast message="Dados da clínica salvos com sucesso!" />
      </Suspense>

      {/* Formulário */}
      <form action={salvarDadosClinica}
        style={{ maxWidth: '560px' }}
      >
        <div style={{
          background: '#FFFFFF', border: '1px solid #EDE5D3',
          borderRadius: '16px', padding: '28px',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            <div>
              <label style={labelStyle}>Nome da Clínica *</label>
              <input
                name="name"
                type="text"
                defaultValue={tenant?.name ?? ''}
                required
                placeholder="Ex: Estética Michele Oliveira"
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Telefone / WhatsApp</label>
                <input
                  name="phone"
                  type="tel"
                  defaultValue={tenant?.phone ?? ''}
                  placeholder="(98) 99999-9999"
                  style={inputStyle}
                />
                <p style={{ fontSize: '11px', color: '#BBA870', margin: '4px 0 0' }}>
                  Aparece no rodapé do RSVP da cliente
                </p>
              </div>
              <div>
                <label style={labelStyle}>Email de contato</label>
                <input
                  name="email"
                  type="email"
                  defaultValue={tenant?.email ?? ''}
                  placeholder="contato@clinica.com.br"
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>CNPJ</label>
              <input
                name="cnpj"
                type="text"
                defaultValue={tenant?.cnpj ?? ''}
                placeholder="00.000.000/0001-00"
                style={inputStyle}
              />
            </div>

            {tenant?.slug && (
              <div>
                <label style={labelStyle}>Identificador único (slug)</label>
                <div style={{ ...inputStyle, background: '#F6F2EA', color: '#A69060' }}>
                  {tenant.slug}
                </div>
                <p style={{ fontSize: '11px', color: '#BBA870', margin: '4px 0 0' }}>
                  Não pode ser alterado após criação da conta
                </p>
              </div>
            )}

          </div>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            style={{
              padding: '11px 28px', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg, #D4B86A, #B8960C)',
              color: '#161412', fontSize: '14px', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Salvar dados
          </button>
        </div>
      </form>
    </div>
  );
}
