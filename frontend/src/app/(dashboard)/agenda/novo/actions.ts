'use server'

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

import { randomUUID } from "crypto";

export async function criarAgendamento(formData: FormData): Promise<{ error: string } | void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  const tenantId = profile!.tenant_id;

  const clientId   = formData.get('client_id')      as string;
  const serviceId  = formData.get('service_id')     as string;
  const roomId     = formData.get('room_id')        as string;
  const startsAt   = formData.get('starts_at')      as string;
  const endsAt     = formData.get('ends_at')        as string;
  const protocolId = (formData.get('protocol_id')   as string) || null;
  const professId  = (formData.get('professional_id') as string) || null;
  const notes      = (formData.get('notes')         as string) || null;

  if (!clientId || !serviceId || !roomId || !startsAt || !endsAt) {
    return { error: 'Preencha todos os campos obrigatórios.' };
  }

  // Validação de conflito: mesma sala, horários sobrepostos, mesmo tenant (ignora cancelados)
  const { data: conflicts } = await supabase
    .from('appointments')
    .select('id')
    .eq('room_id', roomId)
    .eq('tenant_id', tenantId)
    .eq('no_show', false)
    .neq('rsvp_status', 'cancelled')
    .lt('starts_at', endsAt)
    .gt('ends_at', startsAt)
    .limit(1);

  if (conflicts && conflicts.length > 0) {
    return { error: 'Sala já ocupada neste horário. Escolha outro horário ou sala.' };
  }

  const rsvpToken = randomUUID().replace(/-/g, '').substring(0, 16);

  const { error: insertError } = await supabase.from('appointments').insert({
    tenant_id:       tenantId,
    client_id:       clientId,
    service_id:      serviceId,
    protocol_id:     protocolId,
    room_id:         roomId,
    professional_id: professId,
    starts_at:       startsAt,
    ends_at:         endsAt,
    notes,
    rsvp_status: 'pending',
    rsvp_token:  rsvpToken,
    is_block:    false,
    no_show:     false,
  });

  if (insertError) {
    return { error: 'Erro ao criar agendamento. Tente novamente.' };
  }

  redirect('/agenda');
}
