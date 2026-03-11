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

export async function reagendarAgendamento(
    appointmentId: string,
    novaData: string,
    novoHorario: string,
    novaSalaId: string,
    durationMin: number,
): Promise<{ error?: string }> {
    const { supabase, tenantId } = await getTenantId();

    const { data: appt } = await supabase
        .from('appointments')
        .select('id')
        .eq('id', appointmentId)
        .eq('tenant_id', tenantId)
        .single();
    if (!appt) return { error: 'Agendamento não encontrado.' };

    const [h, m] = novoHorario.split(':').map(Number);
    const endMin = h * 60 + m + durationMin;
    const endH = Math.floor(endMin / 60) % 24;
    const endM = endMin % 60;
    const startsAt = `${novaData}T${novoHorario}:00-03:00`;
    const endsAt = `${novaData}T${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00-03:00`;

    const { data: conflict } = await supabase
        .from('appointments')
        .select('id')
        .eq('room_id', novaSalaId)
        .eq('is_block', false)
        .eq('no_show', false)
        .neq('rsvp_status', 'cancelled')
        .neq('id', appointmentId)
        .lt('starts_at', endsAt)
        .gt('ends_at', startsAt)
        .limit(1);

    if (conflict && conflict.length > 0)
        return { error: 'Conflito: esta sala já está ocupada neste horário.' };

    const { error: updateError } = await supabase
        .from('appointments')
        .update({ starts_at: startsAt, ends_at: endsAt, room_id: novaSalaId })
        .eq('id', appointmentId)
        .eq('tenant_id', tenantId);

    if (updateError) return { error: updateError.message };

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
