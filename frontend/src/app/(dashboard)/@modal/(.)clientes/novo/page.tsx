import { ClienteNovoForm } from "@/components/clientes/ClienteNovoForm";
import { InterceptingModal } from "@/components/ui/InterceptingModal";
import { UserPlus } from "lucide-react";

export default async function InterceptedNovaClienteModal({
    searchParams,
}: {
    searchParams: Promise<{ nome?: string }>;
}) {
    const sp = await searchParams;
    const nomeInicial = sp.nome ?? "";

    return (
        <InterceptingModal size="centralized">
            <div style={{
                background: "var(--background)",
                fontFamily: "var(--font-urbanist), sans-serif",
                padding: "24px",
                minHeight: "100%",
            }}>
                <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "12px",
                        background: "linear-gradient(135deg, rgba(212, 184, 106, 0.15), rgba(184, 150, 12, 0.05))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}>
                        <UserPlus size={20} color="#B8960C" />
                    </div>
                    <div>
                        <h1 style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "20px",
                            fontWeight: 700,
                            color: "var(--foreground)",
                            margin: 0,
                            lineHeight: "1.2"
                        }}>
                            Nova Cliente
                        </h1>
                        <p style={{ margin: 0, fontSize: "13px", color: "var(--muted-foreground)" }}>
                            Cadastre um novo contato na base
                        </p>
                    </div>
                </div>

                <ClienteNovoForm nomeInicial={nomeInicial} />
            </div>
        </InterceptingModal>
    );
}
