'use server'

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function editarDadosCliente(clientId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users').select('tenant_id').eq('id', user.id).single();
  const tenantId = profile?.tenant_id;
  if (!tenantId) redirect('/clientes');

  const ratingRaw = formData.get('rating') as string;

  await supabase
    .from('clients')
    .update({
      name:       (formData.get('name') as string)?.trim() || undefined,
      phone:      (formData.get('phone') as string) || null,
      email:      (formData.get('email') as string) || null,
      birth_date: (formData.get('birth_date') as string) || null,
      sex:        (formData.get('sex') as string) || null,
      cep:        (formData.get('cep') as string) || null,
      address:    (formData.get('address') as string) || null,
      rating:     ratingRaw ? Number(ratingRaw) : Number('1'),
    })
    .eq('id', clientId)
    .eq('tenant_id', tenantId);

  redirect(`/clientes/${clientId}?saved=1`);
}
