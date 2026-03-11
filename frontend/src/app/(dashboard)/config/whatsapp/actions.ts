'use server'

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function criarInstanciaWhatsapp(formData: FormData) {
  const phone = formData.get('phone') as string;
  if (!phone || phone.length < 10) return { error: "Número inválido." };

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) return { error: "Autenticação requerida" };

  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    const response = await fetch(`${backendUrl}/api/v1/whatsapp/instance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}` // Repassando token do Admin logado pro Backend FastAPI
      },
      body: JSON.stringify({ phone }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: errorData.detail || "Erro ao conectar backend" };
    }

    const data = await response.json();
    revalidatePath('/config/whatsapp');
    return data; // { status, qrcode, message }
  } catch (err) {
    return { error: "Falha na comunicação com o servidor" };
  }
}

export async function consultarStatusWhatsapp() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) return { error: "Autenticação requerida" };

  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    const response = await fetch(`${backendUrl}/api/v1/whatsapp/instance/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      },
      // cache: 'no-store' pra forçar sempre buscar fresco pro short polling
      cache: 'no-store'
    });

    if (!response.ok) {
      return { error: "Erro ao consultar status" };
    }

    const data = await response.json();
    return data; // { status, phone }
  } catch (err) {
    return { error: "Falha na comunicação com o servidor" };
  }
}

export async function desconectarWhatsapp() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) return { error: "Autenticação requerida" };

  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    const response = await fetch(`${backendUrl}/api/v1/whatsapp/instance`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    if (!response.ok) {
      return { error: "Erro ao desconectar" };
    }

    revalidatePath('/config/whatsapp');
    return { success: true };
  } catch (err) {
    return { error: "Falha na comunicação com o servidor" };
  }
}
