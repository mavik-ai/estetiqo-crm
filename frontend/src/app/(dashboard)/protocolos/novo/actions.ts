'use server'

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function criarProtocolo(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  const tenantId = profile!.tenant_id;

  const clientId       = formData.get('client_id')        as string;
  const serviceId      = formData.get('service_id')       as string;
  const totalSessions  = Number(formData.get('total_sessions'));
  const endDate        = (formData.get('expected_end_date') as string) || null;
  const targetWeightRaw = formData.get('target_weight') as string;
  const targetWeight   = targetWeightRaw ? Number(targetWeightRaw) : null;

  if (!clientId || !serviceId || !totalSessions || totalSessions < 1) {
    redirect('/protocolos/novo?error=campos');
  }

  const { data: protocol, error } = await supabase
    .from('protocols')
    .insert({
      tenant_id:          tenantId,
      client_id:          clientId,
      service_id:         serviceId,
      total_sessions:     totalSessions,
      completed_sessions: 0,
      status:             'active',
      expected_end_date:  endDate,
      target_weight:      targetWeight,
    })
    .select('id')
    .single();

  if (error || !protocol) {
    redirect('/protocolos/novo?error=save');
  }

  redirect(`/protocolos/${protocol.id}`);
}
