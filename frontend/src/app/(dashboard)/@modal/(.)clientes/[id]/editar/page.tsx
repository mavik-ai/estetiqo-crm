import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { User } from "lucide-react";
import Link from "next/link";
import { InterceptingModal } from "@/components/ui/InterceptingModal";
import { editarDadosCliente } from "@/app/(dashboard)/clientes/[id]/editar/actions";
import { EditarClienteForm } from "./EditarClienteForm";

export default async function InterceptedEditarModal({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile } = await supabase
        .from("users").select("tenant_id").eq("id", user!.id).single();

    const { data: client } = await supabase
        .from("clients")
        .select("id, name, phone, email, birth_date, sex, address, cep")
        .eq("id", id)
        .eq("tenant_id", profile!.tenant_id)
        .single();

    if (!client) notFound();

    const action = editarDadosCliente.bind(null, id);

    return (
        <InterceptingModal size="centralized">
            <div style={{ padding: "24px 26px" }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", paddingBottom: "14px", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "linear-gradient(135deg, #D4B86A, #B8960C)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <User size={17} strokeWidth={1.8} color="#FFFDF7" />
                    </div>
                    <div>
                        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 700, margin: 0 }}>
                            Editar Dados
                        </h1>
                        <p style={{ fontSize: "12px", color: "var(--muted-foreground)", margin: "2px 0 0" }}>{client.name}</p>
                    </div>
                </div>

                {/* Form com CEP auto-fill e campos reativos — precisa ser Client Component */}
                <EditarClienteForm client={client} action={action} clientId={id} />
            </div>
        </InterceptingModal>
    );
}
