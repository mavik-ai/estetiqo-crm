'use server'

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

interface SessaoData {
  weightBefore: number | null;
  weightAfter: number | null;
  absCm: number | null;
  abiCm: number | null;
  procedureNotes: string | null;
  performedAt: string;
  signatureData: string | null;
  photosBefore: string[];
  photosAfter: string[];
}

export async function registrarSessaoCompleta(
  protocolId: string,
  data: SessaoData
): Promise<{ success: true; sessionId: string } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users').select('tenant_id').eq('id', user.id).single();
  const tenantId = profile!.tenant_id;

  // Verificar duplicidade: já existe sessão neste protocolo no mesmo dia?
  const dayStart = `${data.performedAt}T00:00:00-03:00`;
  const dayEnd   = `${data.performedAt}T23:59:59-03:00`;
  const { data: dupSession } = await supabase
    .from('sessions')
    .select('session_number')
    .eq('protocol_id', protocolId)
    .gte('performed_at', dayStart)
    .lte('performed_at', dayEnd)
    .limit(1)
    .maybeSingle();

  if (dupSession) {
    return { error: `Já existe a sessão #${dupSession.session_number} registrada neste protocolo hoje. Só é permitida uma sessão por dia por protocolo.` };
  }

  // Próximo número de sessão
  const { data: lastSession } = await supabase
    .from('sessions')
    .select('session_number')
    .eq('protocol_id', protocolId)
    .order('session_number', { ascending: false })
    .limit(1)
    .single();

  const nextSessionNumber = (lastSession?.session_number ?? 0) + 1;

  // Criar sessão
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .insert({
      protocol_id:      protocolId,
      session_number:   nextSessionNumber,
      abs_cm:           data.absCm,
      abi_cm:           data.abiCm,
      weight_before_kg: data.weightBefore,
      weight_after_kg:  data.weightAfter,
      procedure_notes:  data.procedureNotes,
      performed_at:     `${data.performedAt}T12:00:00-03:00`,
    })
    .select('id')
    .single();

  if (sessionError || !session) {
    return { error: 'Erro ao registrar sessão. Tente novamente.' };
  }

  const sessionId = session.id;

  // Registrar fotos antes
  if (data.photosBefore.length > 0) {
    await supabase.from('session_photos').insert(
      data.photosBefore.map(path => ({
        session_id: sessionId,
        storage_path: path,
        photo_type: 'before',
      }))
    );
  }

  // Registrar fotos depois
  if (data.photosAfter.length > 0) {
    await supabase.from('session_photos').insert(
      data.photosAfter.map(path => ({
        session_id: sessionId,
        storage_path: path,
        photo_type: 'after',
      }))
    );
  }

  // Registrar assinatura da sessão
  if (data.signatureData) {
    const { data: client } = await supabase
      .from('protocols').select('client_id').eq('id', protocolId).single();

    await supabase.from('digital_signatures').insert({
      tenant_id:          tenantId,
      client_id:          client!.client_id,
      session_id:         sessionId,
      type:               'session',
      authorization_text: `Confirmo que a sessão #${nextSessionNumber} foi realizada conforme procedimento.`,
      signature_data:     data.signatureData,
    });
  }

  // Atualizar protocolo
  const { data: protocol } = await supabase
    .from('protocols')
    .select('completed_sessions, total_sessions')
    .eq('id', protocolId)
    .single();

  if (protocol) {
    const newCompleted = (protocol.completed_sessions ?? 0) + 1;
    const newStatus = newCompleted >= protocol.total_sessions ? 'completed' : 'active';
    await supabase
      .from('protocols')
      .update({ completed_sessions: newCompleted, status: newStatus })
      .eq('id', protocolId);
  }

  return { success: true, sessionId };
}
