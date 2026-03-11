import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Circle, ArrowRight, Sparkles } from "lucide-react";
import { completarOnboarding } from "./actions";

const STEPS = [
  {
    id: 1,
    title: "Dados da Clínica",
    desc: "Nome, telefone e endereço da clínica",
    href: "/config/dados",
    checkQuery: null, // verificado via tenants.name
  },
  {
    id: 2,
    title: "Serviços",
    desc: "Cadastre os tratamentos que você oferece",
    href: "/config/servicos",
    checkQuery: "services",
  },
  {
    id: 3,
    title: "Salas",
    desc: "Defina as salas de atendimento",
    href: "/config/salas",
    checkQuery: "rooms",
  },
  {
    id: 4,
    title: "Janela de Atendimento",
    desc: "Configure seus horários de funcionamento",
    href: "/config/agenda",
    checkQuery: "business_hours",
  },
  {
    id: 5,
    title: "Primeira Cliente",
    desc: "Cadastre sua primeira paciente no sistema",
    href: "/clientes/novo",
    checkQuery: "clients",
  },
];

export default async function SetupPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("tenant_id, role, tenants(name, onboarding_completed_at)")
    .eq("id", user.id)
    .single();

  // @ts-ignore - nested join
  const tenantRow = profile?.tenants as { name?: string; onboarding_completed_at?: string | null } | null;
  const tenantId = profile?.tenant_id;

  // Se já completou, redireciona
  if (tenantRow?.onboarding_completed_at) {
    redirect("/");
  }

  // Verificar quais passos estão concluídos
  const [servicesRes, roomsRes, hoursRes, clientsRes] = await Promise.all([
    supabase.from("services").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId!),
    supabase.from("rooms").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId!),
    supabase.from("business_hours").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId!),
    supabase.from("clients").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId!),
  ]);

  const completed = [
    !!(tenantRow?.name),           // Step 1: dados da clínica
    (servicesRes.count ?? 0) > 0,  // Step 2: serviços
    (roomsRes.count ?? 0) > 0,     // Step 3: salas
    (hoursRes.count ?? 0) > 0,     // Step 4: janela
    (clientsRes.count ?? 0) > 0,   // Step 5: cliente
  ];

  const totalDone = completed.filter(Boolean).length;
  const allDone = totalDone === STEPS.length;

  return (
    <div
      style={{
        minHeight: "100%",
        background: "var(--background)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "48px 24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "540px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #D4B86A, #B8960C)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <Sparkles size={24} strokeWidth={1.8} color="#FFFDF7" />
          </div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "26px",
              fontWeight: 700,
              color: "var(--foreground)",
              margin: "0 0 8px",
            }}
          >
            Bem-vinda ao Estetiqo!
          </h1>
          <p style={{ fontSize: "14px", color: "var(--muted-foreground)", margin: 0 }}>
            Siga os passos abaixo para configurar sua clínica e começar a usar o sistema.
          </p>
        </div>

        {/* Barra de progresso */}
        <div style={{ marginBottom: "32px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#BBA870", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Progresso
            </span>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--foreground)" }}>
              {totalDone}/{STEPS.length} passos
            </span>
          </div>
          <div style={{ height: "6px", background: "#EDE5D3", borderRadius: "99px", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${(totalDone / STEPS.length) * 100}%`,
                background: "linear-gradient(90deg, #D4B86A, #B8960C)",
                borderRadius: "99px",
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>

        {/* Passos */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "32px" }}>
          {STEPS.map((step, idx) => {
            const done = completed[idx];
            return (
              <Link
                key={step.id}
                href={step.href}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: "16px 20px",
                    background: done ? "rgba(184,150,12,0.06)" : "var(--card)",
                    border: `1px solid ${done ? "rgba(184,150,12,0.25)" : "var(--border)"}`,
                    borderRadius: "12px",
                    cursor: "pointer",
                    transition: "border-color 0.15s",
                  }}
                >
                  {done ? (
                    <CheckCircle2 size={22} strokeWidth={2} color="#B8960C" style={{ flexShrink: 0 }} />
                  ) : (
                    <Circle size={22} strokeWidth={1.5} color="#C5AA72" style={{ flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "14px",
                        fontWeight: 700,
                        color: done ? "#B8960C" : "var(--foreground)",
                      }}
                    >
                      {step.id}. {step.title}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--muted-foreground)" }}>
                      {step.desc}
                    </p>
                  </div>
                  {!done && (
                    <ArrowRight size={16} strokeWidth={2} color="#A69060" style={{ flexShrink: 0 }} />
                  )}
                  {done && (
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#B8960C",
                        background: "rgba(184,150,12,0.12)",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        flexShrink: 0,
                      }}
                    >
                      Feito
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Ações */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
          {allDone ? (
            <form action={completarOnboarding} style={{ width: "100%" }}>
              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "12px",
                  border: "none",
                  background: "linear-gradient(135deg, #D4B86A, #B8960C)",
                  color: "#161412",
                  fontSize: "15px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Concluir configuração →
              </button>
            </form>
          ) : (
            <p style={{ fontSize: "12px", color: "var(--muted-foreground)", textAlign: "center" }}>
              Complete todos os passos para liberar o sistema completo.
            </p>
          )}
          <Link
            href="/"
            style={{
              fontSize: "13px",
              color: "var(--muted-foreground)",
              textDecoration: "none",
            }}
          >
            Pular por agora — configurar depois
          </Link>
        </div>
      </div>
    </div>
  );
}
