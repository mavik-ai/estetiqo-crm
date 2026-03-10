import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NovoProtocoloForm } from "./NovoProtocoloForm";

const errorMessages: Record<string, string> = {
  campos: "Preencha os campos obrigatórios (cliente, serviço e número de sessões).",
  save:   "Erro ao salvar protocolo. Tente novamente.",
};

export default async function NovoProtocoloPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; nome?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", user!.id)
    .single();

  const tenantId = profile!.tenant_id;

  const { data: servicesRes } = await supabase
    .from("services")
    .select("id, name")
    .eq("tenant_id", tenantId)
    .eq("active", true)
    .order("name");

  const services = servicesRes ?? [];

  const params = await searchParams;
  const errorKey = params.error;
  const errorMsg = errorKey ? (errorMessages[errorKey] ?? "Erro inesperado.") : null;

  return (
    <div className="px-6 py-5" style={{ background: "var(--background)", minHeight: "100%" }}>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/protocolos"
          style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            color: "var(--muted-foreground)", fontSize: "13px", textDecoration: "none", marginBottom: "12px",
          }}
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Protocolos
        </Link>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "22px", fontWeight: 700, color: "var(--foreground)", margin: 0,
          }}
        >
          Novo Protocolo
        </h1>
      </div>

      <NovoProtocoloForm services={services} errorMsg={errorMsg} />
    </div>
  );
}
