'use server'

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function salvarDadosClinica(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users').select('tenant_id').eq('id', user.id).single();
  const tenantId = profile?.tenant_id;
  if (!tenantId) redirect('/config/clinica');

  const str = (key: string) => (formData.get(key) as string)?.trim() || null;

  await supabase
    .from('tenants')
    .update({
      name:                str('name') ?? undefined,
      phone:               str('phone'),
      email:               str('email'),
      cnpj:                str('cnpj'),
      // Endereço
      cep:                 str('cep'),
      logradouro:          str('logradouro'),
      numero:              str('numero'),
      complemento:         str('complemento'),
      bairro:              str('bairro'),
      cidade:              str('cidade'),
      estado:              str('estado'),
      // Fiscal
      inscricao_municipal: str('inscricao_municipal'),
      regime_tributario:   str('regime_tributario'),
    })
    .eq('id', tenantId);
}
