'use server'

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
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

// Gera slug a partir do nome (ex: "Clínica Rosa" → "clinica-rosa")
function slugify(name: string): string {
    return name
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60);
}

// Gera senha temporária segura
function generatePassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!';
    return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export async function criarTenant(formData: FormData): Promise<{ error?: string; tempPassword?: string }> {
    const supabase = await getSuperadminClient();
    const admin = createAdminClient();

    const name = (formData.get('name') as string)?.trim();
    const email = (formData.get('email') as string)?.trim().toLowerCase();
    const adminName = (formData.get('adminName') as string)?.trim();
    if (!name || !email) return { error: 'Nome e email são obrigatórios.' };

    // Gerar slug único
    let slug = slugify(name);
    const { data: existing } = await supabase.from('tenants').select('id').eq('slug', slug).single();
    if (existing) slug = `${slug}-${Date.now().toString().slice(-4)}`;

    // Criar tenant
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 7);
    const { data: tenant, error: tenantErr } = await supabase.from('tenants').insert({
        name,
        slug,
        subscription_status: 'trial',
        trial_ends_at: trialEnd.toISOString(),
    }).select('id').single();
    if (tenantErr || !tenant) return { error: tenantErr?.message ?? 'Erro ao criar clínica.' };

    // Criar usuário no Supabase Auth
    const tempPassword = generatePassword();
    const { data: authUser, error: authErr } = await admin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
    });
    if (authErr || !authUser.user) {
        // Rollback: remover tenant criado
        await supabase.from('tenants').delete().eq('id', tenant.id);
        return { error: authErr?.message ?? 'Erro ao criar usuário.' };
    }

    // Inserir na tabela users
    await supabase.from('users').insert({
        id: authUser.user.id,
        name: adminName || name,
        tenant_id: tenant.id,
        role: 'admin',
        must_change_password: true,
    });

    revalidatePath('/admin/clinicas');
    return { tempPassword };
}

export async function atualizarTenant(tenantId: string, name: string, slug: string): Promise<{ error?: string }> {
    const supabase = await getSuperadminClient();
    const { error } = await supabase.from('tenants').update({ name: name.trim(), slug: slug.trim() }).eq('id', tenantId);
    if (error) return { error: error.message };
    revalidatePath('/admin/clinicas');
    return {};
}

export async function deletarTenant(tenantId: string): Promise<{ error?: string }> {
    const supabase = await getSuperadminClient();
    const admin = createAdminClient();

    // Buscar usuários do tenant para deletar do Auth
    const { data: users } = await supabase.from('users').select('id').eq('tenant_id', tenantId);
    if (users) {
        for (const u of users) {
            await admin.auth.admin.deleteUser(u.id);
        }
    }

    // Deletar tenant (cascade cuida do resto via FK)
    const { error } = await supabase.from('tenants').delete().eq('id', tenantId);
    if (error) return { error: error.message };
    revalidatePath('/admin/clinicas');
    return {};
}
