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

    // Montar birth_date: dia + mês obrigatórios, ano opcional (usa 2000 se não informado)
    const day   = (formData.get('birth_day')   as string)?.padStart(2, '0');
    const month = (formData.get('birth_month') as string)?.padStart(2, '0');
    const year  = (formData.get('birth_year')  as string)?.trim() || '2000';
    const birthDate = day && month ? `${year}-${month}-${day}` : null;

    const { data: client, error } = await supabase
        .from('clients')
        .insert({
            tenant_id:   tenantId,
            name:        formData.get('name') as string,
            birth_date:  birthDate,
            sex:         (formData.get('sex')   as string) || null,
            phone:       (formData.get('phone') as string) || null,
            email:       (formData.get('email') as string) || null,
            cep:         (formData.get('cep')   as string) || null,
            logradouro:  (formData.get('logradouro')  as string) || null,
            numero:      (formData.get('numero')      as string) || null,
            complemento: (formData.get('complemento') as string) || null,
            bairro:      (formData.get('bairro')      as string) || null,
            cidade:      (formData.get('cidade')      as string) || null,
            uf:          (formData.get('uf')           as string) || null,
        })
        .select('id')
        .single();

    if (error || !client) redirect('/clientes?error=1');

    redirect(`/clientes/${client.id}`);
}
