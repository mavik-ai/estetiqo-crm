'use server'

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function salvarPerfil(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const name    = (formData.get('name') as string)?.trim();
  const initials = (formData.get('avatar_initials') as string)?.trim().toUpperCase().slice(0, 2);

  await supabase
    .from('users')
    .update({
      name:            name || undefined,
      avatar_initials: initials || null,
    })
    .eq('id', user.id);
}

export async function alterarSenha(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const novaSenha   = formData.get('nova_senha') as string;
  const confirmar   = formData.get('confirmar_senha') as string;

  if (!novaSenha || novaSenha.length < 6) return { error: 'A senha precisa ter pelo menos 6 caracteres.' };
  if (novaSenha !== confirmar) return { error: 'As senhas não coincidem.' };

  const { error } = await supabase.auth.updateUser({ password: novaSenha });
  if (error) return { error: error.message };

  return { success: true };
}
