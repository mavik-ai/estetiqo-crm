'use server'

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function getAdminContext() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await supabase
        .from('users')
        .select('tenant_id, role')
        .eq('id', user.id)
        .single();

    if (!profile?.tenant_id || profile.role !== 'admin') {
        throw new Error('Acesso negado.');
    }

    return { supabase, tenantId: profile.tenant_id as string };
}

export async function criarMembro(formData: FormData): Promise<{ error?: string }> {
    const name = (formData.get('name') as string)?.trim();
    const email = (formData.get('email') as string)?.trim().toLowerCase();
    const role = (formData.get('role') as string) ?? 'operator';

    if (!name || !email) return { error: 'Nome e email são obrigatórios.' };

    const { tenantId } = await getAdminContext();
    const admin = createAdminClient();

    // Gera senha temporária aleatória
    const tempPassword = Math.random().toString(36).slice(-10) + 'A1!';

    // Cria usuário no Supabase Auth
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { name },
    });

    if (authError) {
        if (authError.message.includes('already registered')) {
            return { error: 'Este email já está cadastrado.' };
        }
        return { error: authError.message };
    }

    // Insere em users
    const initials = name.split(' ').slice(0, 2).map((p: string) => p[0]?.toUpperCase() ?? '').join('');
    const { error: dbError } = await admin
        .from('users')
        .insert({
            id: authData.user.id,
            tenant_id: tenantId,
            name,
            email,
            role: role === 'admin' ? 'admin' : 'operator',
            avatar_initials: initials,
            must_change_password: true,
            active: true,
        });

    if (dbError) {
        // Rollback: apaga usuário do auth se falhou no DB
        await admin.auth.admin.deleteUser(authData.user.id);
        return { error: 'Erro ao salvar usuário: ' + dbError.message };
    }

    revalidatePath('/config/equipe');
    return {};
}

export async function desativarMembro(userId: string): Promise<{ error?: string }> {
    const { supabase, tenantId } = await getAdminContext();

    const { error } = await supabase
        .from('users')
        .update({ active: false })
        .eq('id', userId)
        .eq('tenant_id', tenantId);

    if (error) return { error: error.message };

    revalidatePath('/config/equipe');
    return {};
}

export async function reativarMembro(userId: string): Promise<{ error?: string }> {
    const { supabase, tenantId } = await getAdminContext();

    const { error } = await supabase
        .from('users')
        .update({ active: true })
        .eq('id', userId)
        .eq('tenant_id', tenantId);

    if (error) return { error: error.message };

    revalidatePath('/config/equipe');
    return {};
}

export async function excluirMembro(userId: string): Promise<{ error?: string }> {
    const { supabase, tenantId } = await getAdminContext();
    const admin = createAdminClient();

    // Verifica que o usuário pertence ao tenant
    const { data: member } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .eq('tenant_id', tenantId)
        .single();

    if (!member) return { error: 'Usuário não encontrado.' };

    await supabase.from('users').delete().eq('id', userId).eq('tenant_id', tenantId);
    await admin.auth.admin.deleteUser(userId);

    revalidatePath('/config/equipe');
    return {};
}
