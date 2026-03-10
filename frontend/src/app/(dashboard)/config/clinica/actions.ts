'use server'

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function salvarDadosClinica(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users').select('tenant_id').eq('id', user.id).single();
  const tenantId = profile?.tenant_id;
  if (!tenantId) redirect('/config/clinica');

  await supabase
    .from('tenants')
    .update({
      name:  (formData.get('name') as string)?.trim() || undefined,
      phone: (formData.get('phone') as string) || null,
      email: (formData.get('email') as string) || null,
      cnpj:  (formData.get('cnpj') as string) || null,
    })
    .eq('id', tenantId);

  redirect('/config/clinica?saved=1');
}
