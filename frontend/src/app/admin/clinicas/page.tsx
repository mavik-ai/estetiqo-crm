import { createClient } from "@/utils/supabase/server";
import { ClinicasClient } from './ClinicasClient';

export default async function ClinicsPage() {
    const supabase = await createClient();

    const { data: tenants } = await supabase
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
