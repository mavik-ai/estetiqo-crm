'use client'

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Search, UserPlus, User, X } from "lucide-react";
import Link from "next/link";

interface Cliente {
  id: string;
  name: string;
  phone: string | null;
}

interface Props {
  /** Valor atual (id do cliente selecionado) */
  value: string;
  /** Callback ao selecionar */
  onChange: (id: string, name: string) => void;
  /** Placeholder */
  placeholder?: string;
  /** Se deve exibir link de cadastro quando não encontrar */
  showCadastroLink?: boolean;
  /** URL para cadastro rápido (default: /clientes/novo) */
  cadastroUrl?: string;
  /** Se disabled */
  disabled?: boolean;
}

export function ClienteSearch({
  value,
  onChange,
  placeholder = "Digite o nome da paciente...",
  showCadastroLink = true,
  cadastroUrl = "/clientes/novo",
  disabled = false,
}: Props) {
  const supabase = createClient();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedName, setSelectedName] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Buscar clientes ao digitar (debounce 250ms)
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("clients")
        .select("id, name, phone")
        .ilike("name", `%${query}%`)
        .order("name")
        .limit(8);
      setResults((data ?? []) as Cliente[]);
      setLoading(false);
      setOpen(true);
    }, 250);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function select(c: Cliente) {
    onChange(c.id, c.name);
    setSelectedName(c.name);
    setQuery("");
    setOpen(false);
  }

  function clear() {
    onChange("", "");
    setSelectedName("");
    setQuery("");
    setResults([]);
    setOpen(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  const showNoResult = open && !loading && query.length >= 2 && results.length === 0;

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      {/* Input / selecionado */}
      <div
        style={{
          display: "flex", alignItems: "center",
          border: open ? "1px solid rgba(184,150,12,0.5)" : "1px solid #EDE5D3",
          borderRadius: "10px", background: disabled ? "#F9F6F0" : "#FAFAF8",
          overflow: "hidden", transition: "border-color 0.15s",
        }}
      >
        <div style={{ padding: "0 10px", color: "#BBA870", display: "flex", alignItems: "center" }}>
          {value ? <User size={14} strokeWidth={1.5} /> : <Search size={14} strokeWidth={1.5} />}
        </div>

        {value ? (
          /* Cliente selecionado */
          <div style={{ flex: 1, padding: "10px 0", fontSize: "14px", fontWeight: 600, color: "#2D2319", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>{selectedName}</span>
            {!disabled && (
              <button
                type="button"
                onClick={clear}
                style={{ background: "none", border: "none", cursor: "pointer", padding: "0 10px", display: "flex", alignItems: "center", color: "#BBA870" }}
              >
                <X size={14} strokeWidth={2} />
              </button>
            )}
          </div>
        ) : (
          /* Input de busca */
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setOpen(true)}
            placeholder={placeholder}
            disabled={disabled}
            style={{
              flex: 1, padding: "10px 10px 10px 0", border: "none", background: "transparent",
              color: "#2D2319", fontSize: "14px", fontFamily: "inherit", outline: "none",
            }}
          />
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 200,
            background: "#FFFFFF", border: "1px solid #EDE5D3",
            borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
            overflow: "hidden",
          }}
        >
          {loading && (
            <p style={{ padding: "12px 14px", fontSize: "13px", color: "#A69060", margin: 0 }}>
              Buscando...
            </p>
          )}

          {results.map(c => (
            <button
              key={c.id}
              type="button"
              onMouseDown={e => { e.preventDefault(); select(c); }}
              style={{
                width: "100%", padding: "10px 14px", background: "none", border: "none",
                cursor: "pointer", display: "flex", alignItems: "center", gap: "10px",
                textAlign: "left", fontFamily: "inherit",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#FBF5EA")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%",
                background: "linear-gradient(135deg, #D4B86A, #B8960C)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "10px", fontWeight: 700, color: "#161412", flexShrink: 0,
              }}>
                {c.name.split(" ").slice(0, 2).map(p => p[0]?.toUpperCase()).join("")}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#2D2319" }}>{c.name}</p>
                {c.phone && <p style={{ margin: 0, fontSize: "11px", color: "#A69060" }}>{c.phone}</p>}
              </div>
            </button>
          ))}

          {/* Sem resultados + link de cadastro */}
          {showNoResult && (
            <div style={{ padding: "12px 14px", borderTop: results.length > 0 ? "1px solid #F0EBE0" : "none" }}>
              <p style={{ margin: "0 0 8px", fontSize: "12px", color: "#A69060" }}>
                Nenhuma paciente encontrada com "{query}"
              </p>
              {showCadastroLink && (
                <Link
                  href={`${cadastroUrl}?nome=${encodeURIComponent(query)}`}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    fontSize: "12px", fontWeight: 700, color: "#B8960C",
                    background: "rgba(184,150,12,0.08)", border: "1px solid rgba(184,150,12,0.2)",
                    borderRadius: "7px", padding: "6px 12px", textDecoration: "none",
                  }}
                >
                  <UserPlus size={12} strokeWidth={2} />
                  Cadastrar "{query}" agora
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
