'use server'

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function excluirCliente(clientId: string): Promise<{ error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

    const tenantId = profile!.tenant_id as string;

    // Verificar se o cliente pertence a este tenant
    const { data: cliente } = await supabase
        .from('clients')
        .select('id')
        .eq('id', clientId)
        .eq('tenant_id', tenantId)
        .single();

    if (!cliente) {
        return { error: 'Cliente nao encontrado.' };
    }

    // Verificar agendamentos futuros
    const now = new Date().toISOString();
    const { data: agendamentosFuturos } = await supabase
        .from('appointments')
        .select('id')
        .eq('client_id', clientId)
        .eq('tenant_id', tenantId)
        .gte('starts_at', now)
        .limit(1);

    if (agendamentosFuturos && agendamentosFuturos.length > 0) {
        return { error: 'Nao e possivel excluir: esta cliente possui agendamentos futuros.' };
    }

    // Verificar protocolos ativos
    const { data: protocolosAtivos } = await supabase
        .from('protocols')
        .select('id')
        .eq('client_id', clientId)
        .eq('tenant_id', tenantId)
        .eq('status', 'active')
        .limit(1);

    if (protocolosAtivos && protocolosAtivos.length > 0) {
        return { error: 'Nao e possivel excluir: esta cliente possui protocolos ativos.' };
    }

    // Excluir o cliente
    const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId)
        .eq('tenant_id', tenantId);

    if (error) return { error: error.message };

    revalidatePath('/clientes');
    return {};
}
