import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { ChevronLeft, Building2 } from 'lucide-react';
import { ClinicaForm } from './ClinicaForm';

export default async function ConfigClinicaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('users').select('tenant_id').eq('id', user!.id).single();
  const { data: tenant } = await supabase
    .from('tenants')
    .select('name, phone, email, cnpj, slug, cep, logradouro, numero, complemento, bairro, cidade, estado, inscricao_municipal, regime_tributario')
    .eq('id', profile!.tenant_id)
    .single();

  return (
    <div style={{ padding: '24px', minHeight: '100%', background: 'var(--background)' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Link
          href="/config"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            fontSize: '13px', color: 'var(--muted-foreground)', textDecoration: 'none', marginBottom: '10px',
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
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 700, color: 'var(--foreground)', margin: 0 }}>
              Dados da Clínica
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', margin: '2px 0 0' }}>
              Informações que aparecem nas comunicações com clientes e para emissão de NFS-e
            </p>
          </div>
        </div>
      </div>

      <ClinicaForm tenant={tenant} />
    </div>
  );
}
