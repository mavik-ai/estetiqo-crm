'use client'

import Link from "next/link";
import {
  DoorOpen, Users, Building2, ChevronRight,
  Scissors, MessageCircle, CalendarClock,
} from "lucide-react";

interface ConfigCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  disabled?: boolean;
  badge?: string;
}

const configCards: ConfigCard[] = [
  {
    icon: <Building2 size={22} strokeWidth={1.5} />,
    title: "Clínica",
    description: "Dados da clínica e preferências gerais",
    href: "/config/clinica",
  },
  {
    icon: <Scissors size={22} strokeWidth={1.5} />,
    title: "Serviços",
    description: "Cadastre e gerencie os serviços oferecidos",
    href: "/servicos",
  },
  {
    icon: <DoorOpen size={22} strokeWidth={1.5} />,
    title: "Salas",
    description: "Gerencie as salas de atendimento",
    href: "/config/salas",
  },
  {
    icon: <CalendarClock size={22} strokeWidth={1.5} />,
    title: "Janela de Atendimento",
    description: "Configure horários e dias de funcionamento",
    href: "/config/agenda",
    disabled: true,
    badge: "Em breve",
  },
  {
    icon: <MessageCircle size={22} strokeWidth={1.5} />,
    title: "WhatsApp",
    description: "Conecte sua instância para envios automáticos",
    href: "/config/whatsapp",
    disabled: true,
    badge: "Em breve",
  },
  {
    icon: <Users size={22} strokeWidth={1.5} />,
    title: "Usuários",
    description: "Gerencie operadores e permissões",
    href: "/config/usuarios",
    disabled: true,
    badge: "Em breve",
  },
];

function CardInner({ card }: { card: ConfigCard }) {
  return (
    <div
      style={{
        background: card.disabled ? "var(--muted)" : "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        padding: "22px 22px 20px",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        boxSizing: "border-box",
        opacity: card.disabled ? 0.65 : 1,
        cursor: card.disabled ? "not-allowed" : "pointer",
        position: "relative",
        overflow: "hidden",
        transition: "box-shadow 0.18s ease, border-color 0.18s ease",
      }}
    >
      {/* Barra dourada no topo — só para cards ativos */}
      {!card.disabled && (
        <div
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0,
            height: "3px",
            background: "linear-gradient(90deg, #D4B86A 0%, #B8960C 100%)",
          }}
        />
      )}

      {/* Ícone + badge/seta */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "18px" }}>
        <div
          style={{
            width: "46px",
            height: "46px",
            borderRadius: "13px",
            background: card.disabled
              ? "rgba(184,150,12,0.04)"
              : "linear-gradient(135deg, rgba(212,184,106,0.15) 0%, rgba(184,150,12,0.10) 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: card.disabled ? "#C4B07A" : "#B8960C",
            flexShrink: 0,
          }}
        >
          {card.icon}
        </div>

        {card.badge ? (
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              color: "#BBA870",
              background: "var(--background)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              padding: "2px 8px",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {card.badge}
          </span>
        ) : (
          <div
            style={{
              width: "26px",
              height: "26px",
              borderRadius: "50%",
              background: "rgba(184,150,12,0.07)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronRight size={14} strokeWidth={2} color="#B8960C" />
          </div>
        )}
      </div>

      {/* Texto */}
      <div style={{ flex: 1 }}>
        <p
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "15px",
            fontWeight: 700,
            color: card.disabled ? "var(--muted-foreground)" : "var(--foreground)",
            margin: "0 0 5px",
          }}
        >
          {card.title}
        </p>
        <p
          style={{
            fontSize: "12px",
            color: "var(--muted-foreground)",
            margin: 0,
            lineHeight: "1.55",
          }}
        >
          {card.description}
        </p>
      </div>
    </div>
  );
}

export default function ConfigPage() {
  return (
    <div style={{ background: "var(--background)", minHeight: "100%", padding: "28px 24px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "22px",
            fontWeight: 700,
            color: "var(--foreground)",
            margin: 0,
          }}
        >
          Configurações
        </h1>
        <p style={{ color: "var(--muted-foreground)", fontSize: "13px", marginTop: "3px" }}>
          Gerencie as configurações do sistema
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "14px",
          maxWidth: "740px",
          alignItems: "stretch",
        }}
      >
        {configCards.map((card) =>
          card.disabled ? (
            <div key={card.href} style={{ display: "flex" }}>
              <CardInner card={card} />
            </div>
          ) : (
            <Link
              key={card.href}
              href={card.href}
              style={{ textDecoration: "none", display: "flex" }}
              onMouseEnter={(e) => {
                const el = e.currentTarget.firstElementChild as HTMLElement;
                if (el) {
                  el.style.boxShadow = "0 6px 20px rgba(184,150,12,0.12)";
                  el.style.borderColor = "rgba(184,150,12,0.35)";
                }
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget.firstElementChild as HTMLElement;
                if (el) {
                  el.style.boxShadow = "none";
                  el.style.borderColor = "#EDE5D3";
                }
              }}
            >
              <CardInner card={card} />
            </Link>
          )
        )}
      </div>
    </div>
  );
}
