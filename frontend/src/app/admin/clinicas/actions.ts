'use server'

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

async function getSuperadminClient() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (profile?.role !== 'superadmin') throw new Error('Sem permissão');
    return supabase;
}

export async function concederCortesia(tenantId: string, days: number, note: string) {
    const supabase = await getSuperadminClient();
    await supabase.from('tenants').update({
        subscription_status: 'courtesy',
        courtesy_days: days,
        courtesy_starts_at: new Date().toISOString(),
        courtesy_note: note || null,
    }).eq('id', tenantId);
    revalidatePath('/admin/clinicas');
}

export async function converterParaCarencia(tenantId: string) {
    const supabase = await getSuperadminClient();
    const graceEnd = new Date();
    graceEnd.setDate(graceEnd.getDate() + 7);
    await supabase.from('tenants').update({
        subscription_status: 'grace',
        grace_ends_at: graceEnd.toISOString(),
    }).eq('id', tenantId);
    revalidatePath('/admin/clinicas');
}

export async function expirarTenant(tenantId: string) {
    const supabase = await getSuperadminClient();
    await supabase.from('tenants').update({
        subscription_status: 'expired',
    }).eq('id', tenantId);
    revalidatePath('/admin/clinicas');
}

export async function ativarTenant(tenantId: string) {
    const supabase = await getSuperadminClient();
    await supabase.from('tenants').update({
        subscription_status: 'active',
    }).eq('id', tenantId);
    revalidatePath('/admin/clinicas');
}
