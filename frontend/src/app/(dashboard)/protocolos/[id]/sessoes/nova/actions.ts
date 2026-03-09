'use server'

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function registrarSessao(protocolId: string, formData: FormData): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Calcular próximo número de sessão
  const { data: lastSession } = await supabase
    .from('sessions')
    .select('session_number')
    .eq('protocol_id', protocolId)
    .order('session_number', { ascending: false })
    .limit(1)
    .single();

  const nextSessionNumber = (lastSession?.session_number ?? 0) + 1;

  const absCmRaw     = formData.get('abs_cm')     as string;
  const abiCmRaw     = formData.get('abi_cm')     as string;
  const weightKgRaw  = formData.get('weight_kg')  as string;
  const procedureNotes = (formData.get('procedure_notes') as string) || null;
  const performedAt  = (formData.get('performed_at') as string) || new Date().toISOString().split('T')[0];

  const { error: sessionError } = await supabase.from('sessions').insert({
    protocol_id:      protocolId,
    session_number:   nextSessionNumber,
    abs_cm:           absCmRaw     ? Number(absCmRaw)    : null,
    abi_cm:           abiCmRaw     ? Number(abiCmRaw)    : null,
    weight_kg:        weightKgRaw  ? Number(weightKgRaw) : null,
    procedure_notes:  procedureNotes,
    performed_at:     performedAt,
  });

  if (sessionError) {
    redirect(`/protocolos/${protocolId}/sessoes/nova?error=save`);
  }

  // Atualizar completed_sessions e status do protocolo
  const { data: protocol } = await supabase
    .from('protocols')
    .select('completed_sessions, total_sessions')
    .eq('id', protocolId)
    .single();

  if (protocol) {
    const newCompleted = (protocol.completed_sessions ?? 0) + 1;
    const newStatus    = newCompleted >= protocol.total_sessions ? 'completed' : 'active';

    await supabase
      .from('protocols')
      .update({ completed_sessions: newCompleted, status: newStatus })
      .eq('id', protocolId);
  }

  redirect(`/protocolos/${protocolId}`);
}
