'use server'

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function criarServicoDemonstracao(): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  const tenantId = profile!.tenant_id;

  // Verificar se já existe serviço para não duplicar
  const { count } = await supabase
    .from('services')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', tenantId);

  if ((count ?? 0) > 0) {
    redirect('/servicos');
  }

  await supabase.from('services').insert({
    tenant_id:        tenantId,
    name:             'Modelagem Corporal',
    price:            150,
    duration_minutes: 60,
    is_active:        true,
  });

  redirect('/servicos');
}

export async function criarSalaDemonstracao(): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  const tenantId = profile!.tenant_id;

  const { count } = await supabase
    .from('rooms')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', tenantId);

  if ((count ?? 0) > 0) {
    redirect('/config/salas');
  }

  await supabase.from('rooms').insert({
    tenant_id: tenantId,
    name:      'Sala Principal',
    is_active: true,
  });

  redirect('/config/salas');
}
