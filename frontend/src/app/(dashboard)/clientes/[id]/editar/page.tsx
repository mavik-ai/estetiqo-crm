import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, User } from 'lucide-react';
import { editarDadosCliente } from './actions';
import { EditarClienteForm } from './EditarClienteForm';

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
    .select('id, name, phone, email, birth_date, sex, cep, logradouro, numero, complemento, bairro, cidade, uf, rating')
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

      <EditarClienteForm client={client} action={action} clientId={id} />
    </div>
  );
}
