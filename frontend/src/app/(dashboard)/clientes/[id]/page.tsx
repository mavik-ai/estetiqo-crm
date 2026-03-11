import ClienteFichaView from "@/components/clientes/ClienteFichaView";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function ClienteFichaPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return (
        <div
            style={{
                padding: "24px",
                minHeight: "100%",
                background: "var(--background)",
                fontFamily: "var(--font-urbanist), sans-serif",
            }}
        >
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
                        marginBottom: "10px",
                    }}
                >
                    <ChevronLeft size={14} strokeWidth={2} />
                    Pacientes
                </Link>
            </div>
            <ClienteFichaView id={id} />
        </div>
    );
}
