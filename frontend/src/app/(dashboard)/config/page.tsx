'use client'

import Link from "next/link";
import { DoorOpen, Users, Building2, ChevronRight } from "lucide-react";

interface ConfigCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}

const configCards: ConfigCard[] = [
  {
    icon: <DoorOpen size={22} strokeWidth={1.5} />,
    title: "Salas",
    description: "Gerencie as salas de atendimento",
    href: "/config/salas",
  },
  {
    icon: <Users size={22} strokeWidth={1.5} />,
    title: "Usuários",
    description: "Gerencie operadores e permissões",
    href: "/config/usuarios",
  },
  {
    icon: <Building2 size={22} strokeWidth={1.5} />,
    title: "Clínica",
    description: "Dados da clínica e preferências",
    href: "/config/clinica",
  },
];

export default function ConfigPage() {
  return (
    <div className="px-6 py-5" style={{ background: "#F6F2EA", minHeight: "100%" }}>
      {/* Header */}
      <div className="mb-6">
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "22px",
            fontWeight: 700,
            color: "#2D2319",
            margin: 0,
          }}
        >
          Configurações
        </h1>
        <p style={{ color: "#A69060", fontSize: "13px", marginTop: "2px" }}>
          Gerencie as configurações do sistema
        </p>
      </div>

      {/* Cards de seção */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" style={{ maxWidth: "800px" }}>
        {configCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            style={{ textDecoration: "none" }}
          >
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid #EDE5D3",
                borderRadius: "14px",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                transition: "box-shadow 0.15s ease, border-color 0.15s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.boxShadow = "0 4px 16px rgba(184,150,12,0.10)";
                el.style.borderColor = "rgba(184,150,12,0.30)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.boxShadow = "none";
                el.style.borderColor = "#EDE5D3";
              }}
            >
              <div className="flex items-start justify-between">
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: "rgba(184,150,12,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#B8960C",
                    flexShrink: 0,
                  }}
                >
                  {card.icon}
                </div>
                <ChevronRight size={16} strokeWidth={1.5} color="#BBA870" />
              </div>

              <div>
                <p
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#2D2319",
                    margin: "0 0 4px",
                  }}
                >
                  {card.title}
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#A69060",
                    margin: 0,
                    lineHeight: "1.4",
                  }}
                >
                  {card.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
