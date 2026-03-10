import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import { JanelaForm } from "./JanelaForm";
import type { DayHours } from "./actions";

export default async function JanelaAtendimentoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users").select("tenant_id").eq("id", user!.id).single();
  const tenantId = profile!.tenant_id;

  const { data: hoursData } = await supabase
    .from("business_hours")
    .select("day_of_week, is_open, open_time, close_time")
    .eq("tenant_id", tenantId)
    .order("day_of_week");

  const hours = (hoursData ?? []) as DayHours[];

  return (
    <div className="px-6 py-5" style={{ background: "var(--background)", minHeight: "100%" }}>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/config"
          style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            color: "var(--muted-foreground)", fontSize: "13px", textDecoration: "none", marginBottom: "12px",
          }}
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Configurações
        </Link>
        <div className="flex items-center gap-3">
          <div style={{
            width: "40px", height: "40px", borderRadius: "11px",
            background: "linear-gradient(135deg, rgba(212,184,106,0.15), rgba(184,150,12,0.10))",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Clock size={18} strokeWidth={1.5} color="#B8960C" />
          </div>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 700, color: "var(--foreground)", margin: 0 }}>
              Janela de Atendimento
            </h1>
            <p style={{ color: "var(--muted-foreground)", fontSize: "13px", marginTop: "2px" }}>
              Configure os dias e horários de funcionamento da clínica
            </p>
          </div>
        </div>
      </div>

      {/* Dica */}
      <div style={{
        background: "linear-gradient(135deg, #FBF5EA, #F3E8CC)",
        border: "1px solid rgba(184,150,12,0.2)",
        borderRadius: "12px", padding: "14px 18px", marginBottom: "20px",
        fontSize: "12px", color: "var(--muted-foreground)",
      }}>
        <strong style={{ color: "var(--foreground)" }}>Dica:</strong> Use o botão "Copiar p/ todos" para replicar o horário de um dia para os demais rapidamente.
        Dias marcados como fechados não aparecerão na agenda.
      </div>

      <JanelaForm initial={hours} />
    </div>
  );
}
