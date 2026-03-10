import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { AvaliacaoForm } from './AvaliacaoForm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function NovaAvaliacaoPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('users').select('tenant_id').eq('id', user!.id).single();
  const tenantId = profile!.tenant_id;

  const [clientRes, healthRes, servicosRes] = await Promise.all([
    supabase
      .from('clients')
      .select('id, name, birth_date, sex, phone, address')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single(),
    supabase
      .from('health_records')
      .select('*')
      .eq('client_id', id)
      .single(),
    supabase
      .from('services')
      .select('id, name')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('name'),
  ]);

  if (!clientRes.data) notFound();

  const client   = clientRes.data;
  const health   = healthRes.data ?? null;
  const servicos = servicosRes.data ?? [];

  return (
    <div style={{ background: '#F6F2EA', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px 16px' }}>
        <Link
          href={`/clientes/${id}`}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            fontSize: '13px', color: '#A69060', textDecoration: 'none', marginBottom: '12px',
          }}
        >
          <ChevronLeft size={14} strokeWidth={2} />
          {client.name}
        </Link>

        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '22px', fontWeight: 700, color: '#2D2319', margin: '0 0 4px',
        }}>
          Nova Avaliação
        </h1>
        <p style={{ fontSize: '13px', color: '#A69060', margin: 0 }}>
          Ficha de anamnese e procedimento · {client.name}
        </p>
      </div>

      <AvaliacaoForm
        clientId={id}
        clientName={client.name}
        servicos={servicos}
        initialClient={{
          birth_date: client.birth_date,
          sex:        client.sex,
          phone:      client.phone,
          address:    client.address,
        }}
        initialHealth={health}
      />
    </div>
  );
}
