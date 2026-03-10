'use server'

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function getTenantId() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

    return { supabase, tenantId: profile!.tenant_id as string };
}

export async function marcarNoShow(appointmentId: string): Promise<{ error?: string }> {
    const { supabase, tenantId } = await getTenantId();

    const { error } = await supabase
        .from('appointments')
        .update({ no_show: true })
        .eq('id', appointmentId)
        .eq('tenant_id', tenantId);

    if (error) return { error: error.message };

    revalidatePath('/agenda');
    revalidatePath('/');
    return {};
}

export async function cancelarAgendamento(appointmentId: string): Promise<{ error?: string }> {
    const { supabase, tenantId } = await getTenantId();

    const { error } = await supabase
        .from('appointments')
        .update({ rsvp_status: 'cancelled' })
        .eq('id', appointmentId)
        .eq('tenant_id', tenantId);

    if (error) return { error: error.message };

    revalidatePath('/agenda');
    revalidatePath('/');
    return {};
}

export async function confirmarRSVPAdmin(appointmentId: string): Promise<{ error?: string }> {
    const { supabase, tenantId } = await getTenantId();

    const { error } = await supabase
        .from('appointments')
        .update({ rsvp_status: 'confirmed' })
        .eq('id', appointmentId)
        .eq('tenant_id', tenantId);

    if (error) return { error: error.message };

    revalidatePath('/agenda');
    revalidatePath('/');
    return {};
}
