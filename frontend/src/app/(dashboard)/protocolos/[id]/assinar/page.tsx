import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AssinarForm } from "./AssinarForm";

export default async function AssinarProtocoloPage({
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
    .select("id, total_sessions, clients(name), services(name)")
    .eq("id", id)
    .eq("tenant_id", profile!.tenant_id)
    .single();

  if (!protocol) notFound();

  const clientRaw  = Array.isArray(protocol.clients)  ? protocol.clients[0]  : protocol.clients;
  const serviceRaw = Array.isArray(protocol.services) ? protocol.services[0] : protocol.services;
  const clientName  = (clientRaw  as { name: string } | null)?.name  ?? "—";
  const serviceName = (serviceRaw as { name: string } | null)?.name ?? "—";

  return (
    <div style={{ background: "#F6F2EA", minHeight: "100%", padding: "24px" }}>
      <div style={{ maxWidth: "540px", margin: "0 auto" }}>
        <Link
          href={`/protocolos/${id}`}
          style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            color: "#A69060", fontSize: "13px", textDecoration: "none", marginBottom: "16px",
          }}
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Ir para o protocolo
        </Link>

        <h1 style={{
          fontFamily: "'Playfair Display', serif", fontSize: "22px",
          fontWeight: 700, color: "#2D2319", margin: "0 0 4px",
        }}>
          Autorização de Início
        </h1>
        <p style={{ color: "#A69060", fontSize: "14px", margin: "0 0 24px" }}>
          {clientName} · {serviceName} · {protocol.total_sessions} sessões
        </p>

        <AssinarForm
          protocolId={id}
          clientName={clientName}
          serviceName={serviceName}
          totalSessions={protocol.total_sessions}
        />
      </div>
    </div>
  );
}
