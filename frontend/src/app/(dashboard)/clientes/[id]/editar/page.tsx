import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, User } from 'lucide-react';
import { editarDadosCliente } from './actions';

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

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('users').select('tenant_id').eq('id', user!.id).single();

  const { data: client } = await supabase
    .from('clients')
    .select('id, name, phone, email, birth_date, sex, address, cep, rating')
    .eq('id', id)
    .eq('tenant_id', profile!.tenant_id)
    .single();

  if (!client) notFound();

  const action = editarDadosCliente.bind(null, id);

  return (
    <div style={{ padding: '24px', minHeight: '100%', background: 'var(--background)' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Link
          href={`/clientes/${id}`}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            fontSize: '13px', color: 'var(--muted-foreground)', textDecoration: 'none', marginBottom: '10px',
          }}
        >
          <ChevronLeft size={14} strokeWidth={2} />
          {client.name}
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
            background: 'linear-gradient(135deg, #D4B86A, #B8960C)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <User size={20} strokeWidth={1.8} color="#FFFDF7" />
          </div>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 700, color: 'var(--foreground)', margin: 0 }}>
              Editar Dados
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', margin: '2px 0 0' }}>
              {client.name}
            </p>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <form action={action} style={{ maxWidth: '560px' }}>
        <div style={{
          background: 'var(--card)', border: '1px solid #EDE5D3',
          borderRadius: '16px', padding: '28px',
        }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Data de nascimento</label>
                <input name="birth_date" type="date" defaultValue={client.birth_date ?? ''} style={inputStyle} />
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

            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>CEP</label>
                <input name="cep" type="text" defaultValue={client.cep ?? ''} placeholder="00000-000" maxLength={9} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Endereço</label>
                <input name="address" type="text" defaultValue={client.address ?? ''} placeholder="Rua, número, bairro, cidade" style={inputStyle} />
              </div>
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
              <p style={{ fontSize: '11px', color: '#BBA870', margin: '4px 0 0' }}>
                Avaliação interna do potencial de negócio desta cliente (1–5).
              </p>
            </div>

          </div>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href={`/clientes/${id}`} style={{ fontSize: '13px', color: 'var(--muted-foreground)', textDecoration: 'none' }}>
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
    </div>
  );
}
