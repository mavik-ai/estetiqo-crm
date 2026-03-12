import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ClinicasClient } from './ClinicasClient';

export default async function ClinicsPage() {
    // Verificar autenticação e papel
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (profile?.role !== 'superadmin') redirect('/');

    // Usar admin client para bypassar RLS e enxergar todos os tenants
    const admin = createAdminClient();
    const { data: tenants } = await admin
        .from('tenants')
        .select('id, name, slug, subscription_status, trial_ends_at, grace_ends_at, courtesy_days, courtesy_starts_at, courtesy_note, created_at')
        .order('created_at', { ascending: false });

    return (
        <div className="p-8 pb-20">
            <div className="flex justify-between items-end mb-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                        Contas Cadastradas
                    </h1>
                    <p className="text-sm" style={{ color: '#D4C9A8' }}>
                        Gerencie status e acesso de todos os tenants da plataforma.
                    </p>
                </div>
                <span style={{ fontSize: '13px', color: '#9A8E70' }}>
                    {tenants?.length ?? 0} clínica{(tenants?.length ?? 0) !== 1 ? 's' : ''}
                </span>
            </div>

            <ClinicasClient tenants={tenants ?? []} />
        </div>
    );
}
