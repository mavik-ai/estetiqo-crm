import { InterceptingModal } from "@/components/ui/InterceptingModal";
import ClienteFichaView from "@/components/clientes/ClienteFichaView";

export default async function InterceptedClienteModal({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return (
        <InterceptingModal size="oversize">
            <div style={{ padding: "24px 28px", height: "100%", display: "flex", flexDirection: "column" }}>
                <ClienteFichaView id={id} isModal />
            </div>
        </InterceptingModal>
    );
}
