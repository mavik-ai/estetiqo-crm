import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SessaoForm } from "./SessaoForm";

export default async function NovaSessaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users").select("tenant_id").eq("id", user!.id).single();

  const { data: protocol } = await supabase
    .from("protocols")
    .select("id, total_sessions, completed_sessions, clients(name), services(name)")
    .eq("id", id)
    .eq("tenant_id", profile!.tenant_id)
    .single();

  if (!protocol) notFound();

  const clientRaw  = Array.isArray(protocol.clients)  ? protocol.clients[0]  : protocol.clients;
  const serviceRaw = Array.isArray(protocol.services) ? protocol.services[0] : protocol.services;
  const clientName  = (clientRaw  as { name: string } | null)?.name  ?? "—";
  const serviceName = (serviceRaw as { name: string } | null)?.name ?? "—";
  const nextSession = (protocol.completed_sessions ?? 0) + 1;

  return (
    <div className="px-6 py-5" style={{ background: "var(--background)", minHeight: "100%" }}>
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/protocolos/${id}`}
          style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            color: "var(--muted-foreground)", fontSize: "13px", textDecoration: "none", marginBottom: "12px",
          }}
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          {clientName}
        </Link>
        <h1 style={{
          fontFamily: "'Playfair Display', serif", fontSize: "22px",
          fontWeight: 700, color: "var(--foreground)", margin: 0,
        }}>
          Registrar Sessão #{nextSession}
        </h1>
        <p style={{ color: "var(--muted-foreground)", fontSize: "14px", marginTop: "2px" }}>
          {serviceName} · {protocol.completed_sessions}/{protocol.total_sessions} sessões concluídas
        </p>
      </div>

      <SessaoForm
        protocol={{
          id: protocol.id,
          total_sessions: protocol.total_sessions,
          completed_sessions: protocol.completed_sessions ?? 0,
          clientName,
          serviceName,
        }}
        nextSession={nextSession}
      />
    </div>
  );
}
