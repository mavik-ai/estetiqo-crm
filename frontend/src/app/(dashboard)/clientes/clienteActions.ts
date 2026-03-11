'use server'

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// Atualizar um campo simples do cliente (inline edit)
export async function atualizarCampoCliente(
    clientId: string,
    campo: 'phone' | 'email' | 'sex' | 'birth_date' | 'address',
    valor: string
): Promise<{ error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

    const tenantId = profile!.tenant_id;

    const { error } = await supabase
        .from('clients')
        .update({ [campo]: valor || null, updated_at: new Date().toISOString() })
        .eq('id', clientId)
        .eq('tenant_id', tenantId);

    if (error) return { error: error.message };

    revalidatePath(`/clientes/${clientId}`);
    revalidatePath('/clientes');
    return {};
}

// Atualizar o rating (estrelas) inline
export async function atualizarRating(
    clientId: string,
    rating: number
): Promise<{ error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

    const tenantId = profile!.tenant_id;

    const { error } = await supabase
        .from('clients')
        .update({ rating, updated_at: new Date().toISOString() })
        .eq('id', clientId)
        .eq('tenant_id', tenantId);

    if (error) return { error: error.message };

    revalidatePath(`/clientes/${clientId}`);
    revalidatePath('/clientes');
    return {};
}

// Adicionar uma nota ao cliente
export async function adicionarNota(
    clientId: string,
    content: string
): Promise<{ error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

    const tenantId = profile!.tenant_id;

    if (!content.trim()) return { error: 'Conteúdo não pode ser vazio.' };

    const { error } = await supabase
        .from('client_notes')
        .insert({
            client_id: clientId,
            tenant_id: tenantId,
            content: content.trim(),
        });

    if (error) return { error: error.message };

    revalidatePath(`/clientes/${clientId}`);
    return {};
}
