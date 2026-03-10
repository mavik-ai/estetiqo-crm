import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Building2, Layers, Users, CalendarPlus, Sparkles, Zap } from "lucide-react";
import { criarServicoDemonstracao, criarSalaDemonstracao } from "./actions";

interface Step {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: string;
  href: string;
  done: boolean;
  quickAction?: React.ReactNode;
}

export default async function BemVindoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("tenant_id, name")
    .eq("id", user!.id)
    .single();

  const tenantId  = profile!.tenant_id;
  const firstName = (profile?.name ?? "").split(" ")[0] || "bem-vinda";

  // Verificar progresso de cada etapa
  const [roomsRes, servicesRes, clientsRes, appointmentsRes] = await Promise.all([
    supabase.from("rooms").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId),
    supabase.from("services").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId),
    supabase.from("clients").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId),
    supabase.from("appointments").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId),
  ]);

  const hasRooms        = (roomsRes.count        ?? 0) > 0;
  const hasServices     = (servicesRes.count      ?? 0) > 0;
  const hasClients      = (clientsRes.count       ?? 0) > 0;
  const hasAppointments = (appointmentsRes.count  ?? 0) > 0;

  const steps: Step[] = [
    {
      id: 1,
      icon: <Building2 size={22} strokeWidth={1.5} />,
      title: "Configure as salas da clínica",
      description: "Cadastre as salas onde os atendimentos acontecem. Cada agendamento será vinculado a uma sala.",
      cta: "Gerenciar Salas",
      href: "/config/salas",
      done: hasRooms,
      quickAction: !hasRooms ? (
        <form action={criarSalaDemonstracao}>
          <button
            type="submit"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--muted-foreground)",
              fontFamily: "inherit",
              padding: 0,
              textDecoration: "underline",
              textDecorationStyle: "dotted",
            }}
          >
            <Zap size={11} strokeWidth={2} />
            Criar &ldquo;Sala Principal&rdquo; automaticamente
          </button>
        </form>
      ) : undefined,
    },
    {
      id: 2,
      icon: <Layers size={22} strokeWidth={1.5} />,
      title: "Adicione os serviços oferecidos",
      description: "Cadastre os serviços com nome, preço e duração. Eles aparecem no formulário de agendamento.",
      cta: "Cadastrar Serviços",
      href: "/servicos",
      done: hasServices,
      quickAction: !hasServices ? (
        <form action={criarServicoDemonstracao}>
          <button
            type="submit"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--muted-foreground)",
              fontFamily: "inherit",
              padding: 0,
              textDecoration: "underline",
              textDecorationStyle: "dotted",
            }}
          >
            <Zap size={11} strokeWidth={2} />
            Criar &ldquo;Modelagem Corporal&rdquo; automaticamente
          </button>
        </form>
      ) : undefined,
    },
    {
      id: 3,
      icon: <Users size={22} strokeWidth={1.5} />,
      title: "Cadastre sua primeira paciente",
      description: "Adicione os dados pessoais e a ficha de saúde da paciente. Ela estará disponível para agendamento.",
      cta: "Nova Paciente",
      href: "/clientes/novo",
      done: hasClients,
    },
    {
      id: 4,
      icon: <CalendarPlus size={22} strokeWidth={1.5} />,
      title: "Agende seu primeiro atendimento",
      description: "Com sala, serviço e paciente cadastrados, você já pode criar o primeiro agendamento.",
      cta: "Novo Agendamento",
      href: "/agenda/novo",
      done: hasAppointments,
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const allDone        = completedCount === steps.length;
  const pct            = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="px-6 py-5" style={{ background: "var(--background)", minHeight: "100%" }}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={18} strokeWidth={1.5} color="#B8960C" />
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#B8960C", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Primeiros Passos
          </span>
        </div>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "26px",
            fontWeight: 700,
            color: "var(--foreground)",
            margin: "0 0 6px",
          }}
        >
          Bem-vinda, {firstName}!
        </h1>
        <p style={{ color: "var(--muted-foreground)", fontSize: "14px", margin: 0 }}>
          Configure o Estetiqo em 4 passos simples e comece a atender.
        </p>
      </div>

      {/* Barra de progresso geral */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "14px",
          padding: "20px 24px",
          marginBottom: "24px",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--foreground)" }}>
            {allDone ? "Configuração concluída! 🎉" : `${completedCount} de ${steps.length} etapas concluídas`}
          </span>
          <span style={{ fontSize: "20px", fontWeight: 700, color: "#B8960C" }}>{pct}%</span>
        </div>
        <div style={{ background: "#EDE5D3", borderRadius: "99px", height: "10px", overflow: "hidden" }}>
          <div
            style={{
              background: "linear-gradient(90deg, #D4B86A, #B8960C)",
              borderRadius: "99px",
              height: "100%",
              width: `${pct}%`,
              transition: "width 0.5s ease",
            }}
          />
        </div>

        {allDone && (
          <div className="flex justify-end mt-3">
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "linear-gradient(135deg, #D4B86A, #B8960C)",
                color: "#161412",
                fontSize: "13px",
                fontWeight: 700,
                padding: "8px 16px",
                borderRadius: "8px",
                textDecoration: "none",
              }}
            >
              Ir para o Dashboard
              <ArrowRight size={14} strokeWidth={2} />
            </Link>
          </div>
        )}
      </div>

      {/* Lista de passos */}
      <div className="flex flex-col gap-3">
        {steps.map((step, idx) => {
          const isNext = !step.done && steps.slice(0, idx).every((s) => s.done);
          return (
            <div
              key={step.id}
              style={{
                background: "var(--card)",
                border: step.done
                  ? "1px solid #D4EDC4"
                  : isNext
                  ? "1px solid #D4B86A"
                  : "1px solid #EDE5D3",
                borderRadius: "14px",
                padding: "20px 24px",
                opacity: !step.done && !isNext && completedCount < idx ? 0.6 : 1,
              }}
            >
              <div className="flex items-start gap-4">
                {/* Ícone de status */}
                <div
                  style={{
                    flexShrink: 0,
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: step.done
                      ? "rgba(45,140,78,0.10)"
                      : isNext
                      ? "linear-gradient(135deg, #FBF5EA, #F3E8CC)"
                      : "#F6F2EA",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: step.done ? "#2D8C4E" : isNext ? "#B8960C" : "#A69060",
                  }}
                >
                  {step.done ? <CheckCircle2 size={22} strokeWidth={1.5} /> : step.icon}
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: step.done ? "#2D8C4E" : "#BBA870",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      Passo {step.id}
                    </span>
                    {step.done && (
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          color: "#2D8C4E",
                          background: "rgba(45,140,78,0.10)",
                          padding: "2px 8px",
                          borderRadius: "20px",
                        }}
                      >
                        Concluído
                      </span>
                    )}
                    {isNext && (
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          color: "#B8960C",
                          background: "rgba(184,150,12,0.10)",
                          padding: "2px 8px",
                          borderRadius: "20px",
                        }}
                      >
                        Próximo
                      </span>
                    )}
                  </div>
                  <h3
                    style={{
                      fontSize: "15px",
                      fontWeight: 700,
                      color: step.done ? "#5A7A5A" : "#2D2319",
                      margin: "0 0 4px",
                      textDecoration: step.done ? "line-through" : "none",
                    }}
                  >
                    {step.title}
                  </h3>
                  <p style={{ fontSize: "13px", color: "var(--muted-foreground)", margin: "0 0 12px" }}>
                    {step.description}
                  </p>

                  {!step.done && (
                    <div className="flex items-center gap-3 flex-wrap">
                      <Link
                        href={step.href}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          background: isNext
                            ? "linear-gradient(135deg, #D4B86A, #B8960C)"
                            : "transparent",
                          color: isNext ? "#161412" : "#A69060",
                          border: isNext ? "none" : "1px solid #EDE5D3",
                          fontSize: "12px",
                          fontWeight: 700,
                          padding: "7px 14px",
                          borderRadius: "8px",
                          textDecoration: "none",
                        }}
                      >
                        {step.cta}
                        <ArrowRight size={12} strokeWidth={2.5} />
                      </Link>
                      {step.quickAction}
                    </div>
                  )}
                </div>

                {/* Círculo numerado */}
                <div
                  style={{
                    flexShrink: 0,
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: step.done ? "rgba(45,140,78,0.10)" : "#F0EBE0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: step.done ? "#2D8C4E" : "#BBA870",
                  }}
                >
                  {step.done ? "✓" : step.id}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Link para o dashboard */}
      <div className="flex justify-center mt-8">
        <Link
          href="/"
          style={{
            fontSize: "13px",
            color: "var(--muted-foreground)",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          Pular por agora e ir ao Dashboard →
        </Link>
      </div>
    </div>
  );
}
