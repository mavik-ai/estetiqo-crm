'use server'

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function completarOnboarding() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: profile } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile?.tenant_id) return;

  await supabase
    .from('tenants')
    .update({ onboarding_completed_at: new Date().toISOString() })
    .eq('id', profile.tenant_id);

  revalidatePath('/');
}
