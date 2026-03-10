import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { ChevronLeft, UserCircle } from 'lucide-react';
import { PerfilForm } from './PerfilForm';

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('users')
    .select('name, role, avatar_initials')
    .eq('id', user!.id)
    .single();

  const name     = profile?.name ?? '';
  const role     = profile?.role === 'superadmin' ? 'Superadmin' : profile?.role === 'admin' ? 'Admin' : 'Operadora';
  const initials = profile?.avatar_initials ??
    name.split(' ').slice(0, 2).map((p: string) => p[0]?.toUpperCase() ?? '').join('');

  return (
    <div style={{ padding: '24px', minHeight: '100%', background: '#F6F2EA' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Link href="/config" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#A69060', textDecoration: 'none', marginBottom: '10px' }}>
          <ChevronLeft size={14} strokeWidth={2} />
          Configurações
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0, background: 'linear-gradient(135deg, #D4B86A, #B8960C)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserCircle size={20} strokeWidth={1.8} color="#FFFDF7" />
          </div>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 700, color: '#2D2319', margin: 0 }}>
              Meu Perfil
            </h1>
            <p style={{ fontSize: '13px', color: '#A69060', margin: '2px 0 0' }}>
              Dados pessoais e segurança da conta
            </p>
          </div>
        </div>
      </div>

      <PerfilForm
        name={name}
        email={user!.email ?? ''}
        role={role}
        initials={initials}
      />
    </div>
  );
}
