'use server'

import { createClient } from '@/utils/supabase/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export async function confirmarRSVP(token: string): Promise<void> {
  const supabase = await createClient();
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip') ?? 'unknown';

  const { data: appt } = await supabase
    .from('appointments')
    .select('id, rsvp_status')
    .eq('rsvp_token', token)
    .single();

  if (!appt) redirect(`/c/${token}?action=erro`);
  if (appt.rsvp_status === 'confirmed') redirect(`/c/${token}?action=confirmed`);

  await supabase
    .from('appointments')
    .update({ rsvp_status: 'confirmed', rsvp_responded_at: new Date().toISOString() })
    .eq('id', appt.id);

  await supabase.from('rsvp_responses').insert({
    appointment_id: appt.id,
    token,
    action: 'confirmed',
    ip_address: ip,
  });

  redirect(`/c/${token}?action=confirmed`);
}

export async function cancelarRSVP(token: string): Promise<void> {
  const supabase = await createClient();
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip') ?? 'unknown';

  const { data: appt } = await supabase
    .from('appointments')
    .select('id, rsvp_status')
    .eq('rsvp_token', token)
    .single();

  if (!appt) redirect(`/c/${token}?action=erro`);

  await supabase
    .from('appointments')
    .update({ rsvp_status: 'cancelled', rsvp_responded_at: new Date().toISOString() })
    .eq('id', appt.id);

  await supabase.from('rsvp_responses').insert({
    appointment_id: appt.id,
    token,
    action: 'cancelled',
    ip_address: ip,
  });

  redirect(`/c/${token}?action=cancelled`);
}
