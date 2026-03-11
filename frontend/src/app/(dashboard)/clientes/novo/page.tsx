import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ClienteNovoForm } from "@/components/clientes/ClienteNovoForm";

export default async function NovaClientePage({
    searchParams,
}: {
    searchParams: Promise<{ nome?: string }>;
}) {
    const sp = await searchParams;
    const nomeInicial = sp.nome ?? "";

    return (
        <div
            style={{
                padding: "24px",
                minHeight: "100%",
                background: "var(--background)",
                fontFamily: "var(--font-urbanist), sans-serif",
            }}
        >
            {/* Header */}
            <div style={{ marginBottom: "20px" }}>
                <Link
                    href="/clientes"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "13px",
                        color: "var(--muted-foreground)",
                        textDecoration: "none",
                        marginBottom: "8px",
                    }}
                >
                    <ChevronLeft size={14} strokeWidth={2} />
                    Voltar
                </Link>
                <h1
                    style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "22px",
                        fontWeight: 700,
                        color: "var(--foreground)",
                        margin: 0,
                    }}
                >
                    Nova Cliente
                </h1>
            </div>

            <ClienteNovoForm nomeInicial={nomeInicial} />
        </div>
    );
}
