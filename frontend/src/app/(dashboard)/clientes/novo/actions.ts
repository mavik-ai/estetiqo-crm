'use server'

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function criarCliente(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

    const tenantId = profile!.tenant_id;

    // 1. Inserir em clients
    const { data: client, error } = await supabase
        .from('clients')
        .insert({
            tenant_id: tenantId,
            name: formData.get('name') as string,
            birth_date: (formData.get('birth_date') as string) || null,
            sex: (formData.get('sex') as string) || null,
            phone: (formData.get('phone') as string) || null,
            address: (formData.get('address') as string) || null,
            rating: Number(formData.get('rating')) || null,
        })
        .select('id')
        .single();

    if (error || !client) redirect('/clientes?error=1');

    // 2. Inserir health_record
    const boolField = (name: string) => formData.get(name) === 'on';

    await supabase.from('health_records').insert({
        client_id: client.id,
        smoker: boolField('smoker'),
        allergy: boolField('allergy'),
        pregnancy: boolField('pregnancy'),
        heart_disease: boolField('heart_disease'),
        anemia: boolField('anemia'),
        depression: boolField('depression'),
        hypertension: boolField('hypertension'),
        previous_aesthetic_treatment: boolField('previous_aesthetic_treatment'),
        herpes: boolField('herpes'),
        keloid: boolField('keloid'),
        diabetes: boolField('diabetes'),
        hepatitis: boolField('hepatitis'),
        hiv: boolField('hiv'),
        skin_disease: boolField('skin_disease'),
        cancer: boolField('cancer'),
        contraceptive: boolField('contraceptive'),
        other_conditions: (formData.get('other_conditions') as string) || null,
    });

    redirect(`/clientes/${client.id}`);
}
