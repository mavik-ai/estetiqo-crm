'use server'

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export interface DayHours {
  day_of_week: number;
  is_open: boolean;
  open_time: string;
  close_time: string;
}

export async function salvarJanelaAtendimento(
  hours: DayHours[]
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users').select('tenant_id').eq('id', user.id).single();
  const tenantId = profile!.tenant_id;

  const rows = hours.map(h => ({
    tenant_id:   tenantId,
    day_of_week: h.day_of_week,
    is_open:     h.is_open,
    open_time:   h.open_time,
    close_time:  h.close_time,
  }));

  const { error } = await supabase
    .from('business_hours')
    .upsert(rows, { onConflict: 'tenant_id,day_of_week' });

  if (error) return { error: 'Erro ao salvar horários. Tente novamente.' };

  revalidatePath('/config/agenda');
  return { success: true };
}
