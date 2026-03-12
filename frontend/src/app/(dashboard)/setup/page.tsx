import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { SetupClient } from "./SetupClient";

const STEPS = [
    {
        id: 1,
        title: "Dados da Clínica",
        desc: "Nome, telefone e endereço da clínica",
        href: "/config/clinica",
    },
    {
        id: 2,
        title: "Serviços",
        desc: "Cadastre os tratamentos que você oferece",
        href: "/servicos",
    },
    {
        id: 3,
        title: "Salas",
        desc: "Defina as salas de atendimento",
        href: "/config/salas",
    },
    {
        id: 4,
        title: "Janela de Atendimento",
        desc: "Configure seus horários de funcionamento",
        href: "/config/agenda",
    },
    {
        id: 5,
        title: "Primeira Cliente",
        desc: "Cadastre sua primeira paciente no sistema",
        href: "/clientes/novo",
    },
];

export default async function SetupPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: profile } = await supabase
        .from("users")
        .select("tenant_id, role, tenants(name, phone, onboarding_completed_at)")
        .eq("id", user.id)
        .single();

    // Operadoras não configuram a clínica
    if (profile?.role === 'operator') redirect('/');

    // @ts-ignore - nested join
    const tenantRow = profile?.tenants as { name?: string; phone?: string | null; onboarding_completed_at?: string | null } | null;
    const tenantId = profile?.tenant_id;

    if (tenantRow?.onboarding_completed_at) {
        redirect("/");
    }

    const [servicesRes, roomsRes, hoursRes, clientsRes] = await Promise.all([
        supabase.from("services").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId!),
        supabase.from("rooms").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId!),
        supabase.from("business_hours").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId!),
        supabase.from("clients").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId!),
    ]);

    const completedFlags = [
        !!(tenantRow?.phone),   // Dados da clínica: preenchida quando tem telefone
        (servicesRes.count ?? 0) > 0,
        (roomsRes.count ?? 0) > 0,
        (hoursRes.count ?? 0) > 0,
        (clientsRes.count ?? 0) > 0,
    ];

    const steps = STEPS.map((s, i) => ({ ...s, done: completedFlags[i] }));
    const totalDone = completedFlags.filter(Boolean).length;
    const allDone = totalDone === STEPS.length;

    return <SetupClient steps={steps} totalDone={totalDone} allDone={allDone} />;
}
