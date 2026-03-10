'use server'

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function assinarProtocolo(
  protocolId: string,
  signatureData: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users').select('tenant_id').eq('id', user.id).single();

  const { data: protocol } = await supabase
    .from('protocols')
    .select('client_id, services(name), total_sessions')
    .eq('id', protocolId)
    .eq('tenant_id', profile!.tenant_id)
    .single();

  if (!protocol) return { error: 'Protocolo não encontrado.' };

  const serviceRaw = Array.isArray(protocol.services) ? protocol.services[0] : protocol.services;
  const serviceName = (serviceRaw as { name: string } | null)?.name ?? 'protocolo';

  const { error } = await supabase.from('digital_signatures').insert({
    tenant_id:          profile!.tenant_id,
    client_id:          protocol.client_id,
    type:               'protocol_start',
    session_id:         null,
    authorization_text: `Autorizo o início do protocolo de ${serviceName} com ${protocol.total_sessions} sessões, conforme acordado.`,
    signature_data:     signatureData,
  });

  if (error) return { error: 'Erro ao salvar assinatura. Tente novamente.' };

  return { success: true };
}
