'use server'

import { createClient } from '@/utils/supabase/server';
import { headers } from 'next/headers';

export type AvaliacaoData = {
  // Etapa 1 — Dados Pessoais
  clientData: {
    birth_date: string | null;
    sex: string | null;
    phone: string | null;
    address: string | null;
  };
  // Etapa 2 — Histórico de Saúde
  anamnese: {
    smoker: boolean;
    allergy: boolean;
    pregnancy: boolean;
    heart_disease: boolean;
    anemia: boolean;
    depression: boolean;
    hypertension: boolean;
    previous_aesthetic_treatment: boolean;
    herpes: boolean;
    keloid: boolean;
    diabetes: boolean;
    hepatitis: boolean;
    hiv: boolean;
    skin_disease: boolean;
    cancer: boolean;
    contraceptive: boolean;
    has_other_conditions: boolean;
    other_conditions: string;
  };
  // Etapa 3 — Procedimento
  procedimento: {
    service_id: string;
    abs_cm: number | null;
    weight_kg: number | null;
    abi_cm: number | null;
    target_weight: number | null;
    expected_end_date: string | null;
    total_sessions: number;
  };
  // Etapa 4 — Assinatura
  signature: string | null;
  procedure_date: string;
};

export async function salvarAvaliacao(
  clientId: string,
  data: AvaliacaoData,
): Promise<{ error?: string; success?: boolean; protocolId?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Não autenticado.' };

  const { data: profile } = await supabase
    .from('users').select('tenant_id').eq('id', user.id).single();
  const tenantId = profile?.tenant_id;
  if (!tenantId) return { error: 'Tenant não encontrado.' };

  // Verifica que cliente pertence ao tenant
  const { data: client } = await supabase
    .from('clients').select('id, name').eq('id', clientId).eq('tenant_id', tenantId).single();
  if (!client) return { error: 'Cliente não encontrada.' };

  // 1. Atualiza dados pessoais da cliente
  const { error: clientError } = await supabase
    .from('clients')
    .update({
      birth_date: data.clientData.birth_date || null,
      sex:        data.clientData.sex || null,
      phone:      data.clientData.phone || null,
      address:    data.clientData.address || null,
    })
    .eq('id', clientId)
    .eq('tenant_id', tenantId);
  if (clientError) return { error: 'Erro ao atualizar dados da cliente.' };

  // 2. Upsert ficha de saúde
  const { data: existingHealth } = await supabase
    .from('health_records').select('id').eq('client_id', clientId).single();

  const healthPayload = {
    smoker:                       data.anamnese.smoker,
    allergy:                      data.anamnese.allergy,
    pregnancy:                    data.anamnese.pregnancy,
    heart_disease:               data.anamnese.heart_disease,
    anemia:                       data.anamnese.anemia,
    depression:                   data.anamnese.depression,
    hypertension:                 data.anamnese.hypertension,
    previous_aesthetic_treatment: data.anamnese.previous_aesthetic_treatment,
    herpes:                       data.anamnese.herpes,
    keloid:                       data.anamnese.keloid,
    diabetes:                     data.anamnese.diabetes,
    hepatitis:                    data.anamnese.hepatitis,
    hiv:                          data.anamnese.hiv,
    skin_disease:                data.anamnese.skin_disease,
    cancer:                       data.anamnese.cancer,
    contraceptive:               data.anamnese.contraceptive,
    other_conditions: data.anamnese.has_other_conditions ? (data.anamnese.other_conditions || null) : null,
    weight_kg: data.procedimento.weight_kg,
    abs_cm:    data.procedimento.abs_cm,
    abi_cm:    data.procedimento.abi_cm,
    updated_at: new Date().toISOString(),
  };

  if (existingHealth) {
    const { error: hErr } = await supabase
      .from('health_records').update(healthPayload).eq('id', existingHealth.id);
    if (hErr) return { error: 'Erro ao atualizar ficha de saúde.' };
  } else {
    const { error: hErr } = await supabase
      .from('health_records').insert({ ...healthPayload, client_id: clientId });
    if (hErr) return { error: 'Erro ao criar ficha de saúde.' };
  }

  // 3. Cria protocolo
  const { data: protocol, error: protoError } = await supabase
    .from('protocols')
    .insert({
      tenant_id:          tenantId,
      client_id:          clientId,
      service_id:         data.procedimento.service_id,
      total_sessions:     data.procedimento.total_sessions,
      completed_sessions: 0,
      status:             'active',
      target_weight:      data.procedimento.target_weight,
      expected_end_date:  data.procedimento.expected_end_date || null,
    })
    .select('id')
    .single();
  if (protoError) return { error: 'Erro ao criar protocolo.' };

  // 4. Salva assinatura digital (se fornecida)
  if (data.signature) {
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip') ?? 'unknown';
    const ua = headersList.get('user-agent') ?? '';

    const authText =
      `Declaro que as informações prestadas nesta ficha são verdadeiras e que fui devidamente orientada sobre o procedimento a ser realizado. ` +
      `Autorizo o início do tratamento estético, bem como o registro fotográfico de antes e depois para acompanhamento do protocolo. ` +
      `Estou ciente das recomendações de cuidados pós-procedimento e comprometo-me a segui-las. ` +
      `Em conformidade com a LGPD (Lei 13.709/2018), autorizo o uso dos meus dados pessoais exclusivamente para fins de atendimento nesta clínica. ` +
      `Avaliação realizada em ${data.procedure_date}.`;

    await supabase.from('digital_signatures').insert({
      tenant_id:          tenantId,
      client_id:          clientId,
      type:               'initial_assessment',
      authorization_text: authText,
      signature_data:     data.signature,
      ip_address:         ip,
      user_agent:         ua,
    });
  }

  return { success: true, protocolId: protocol.id };
}
