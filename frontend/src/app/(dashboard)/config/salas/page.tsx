'use client'

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { ArrowLeft, Plus, Pencil, Trash2, X, Check } from "lucide-react";

interface Room {
  id: string;
  name: string;
  active: boolean;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid var(--border)",
  background: "#FAFAF8",
  color: "var(--foreground)",
  fontSize: "14px",
  outline: "none",
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  fontWeight: 600,
  color: "#BBA870",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  marginBottom: "6px",
};

export default function SalasPage() {
  const supabase = createClient();

  const [tenantId, setTenantId] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Delete confirm
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function loadRooms(tid: string) {
    setLoading(true);
    const { data } = await supabase
      .from("rooms")
      .select("id, name, active")
      .eq("tenant_id", tid)
      .order("name");
    setRooms((data ?? []) as Room[]);
    setLoading(false);
  }

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("users")
        .select("tenant_id")
        .eq("id", user.id)
        .single();
      const tid = profile?.tenant_id;
      if (!tid) return;
      setTenantId(tid);
      await loadRooms(tid);
    }
    init();
  }, []);

  function openCreate() {
    setEditingRoom(null);
    setFormName("");
    setFormIsActive(true);
    setFormError(null);
    setShowModal(true);
  }

  function openEdit(room: Room) {
    setEditingRoom(room);
    setFormName(room.name);
    setFormIsActive(room.active);
    setFormError(null);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingRoom(null);
    setFormError(null);
  }

  async function handleSave() {
    if (!formName.trim()) {
      setFormError("O nome da sala é obrigatório.");
      return;
    }
    if (!tenantId) return;
    setFormLoading(true);
    setFormError(null);

    if (editingRoom) {
      const { error } = await supabase
        .from("rooms")
        .update({ name: formName.trim(), active: formIsActive })
        .eq("id", editingRoom.id)
        .eq("tenant_id", tenantId);
      if (error) {
        setFormError("Erro ao atualizar sala.");
        setFormLoading(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from("rooms")
        .insert({ name: formName.trim(), active: formIsActive, tenant_id: tenantId });
      if (error) {
        setFormError("Erro ao criar sala.");
        setFormLoading(false);
        return;
      }
    }

    setFormLoading(false);
    closeModal();
    await loadRooms(tenantId);
  }

  async function handleToggle(room: Room) {
    if (!tenantId) return;
    await supabase.from("rooms").update({ active: !room.active }).eq("id", room.id).eq("tenant_id", tenantId);
    await loadRooms(tenantId);
  }

  async function handleDelete(id: string) {
    if (!tenantId) return;
    setDeleteError(null);

    // Verificar agendamentos futuros nesta sala
    const now = new Date().toISOString();
    const { data: agendamentosFuturos } = await supabase
      .from("appointments")
      .select("id")
      .eq("room_id", id)
      .gte("starts_at", now)
      .limit(1);

    if (agendamentosFuturos && agendamentosFuturos.length > 0) {
      setDeleteError("Nao e possivel excluir: esta sala possui agendamentos futuros.");
      setDeletingId(null);
      setTimeout(() => setDeleteError(null), 5000);
      return;
    }

    await supabase.from("rooms").delete().eq("id", id).eq("tenant_id", tenantId);
    setDeletingId(null);
    await loadRooms(tenantId);
  }

  return (
    <div className="px-6 py-5" style={{ background: "var(--background)", minHeight: "100%" }}>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/config"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "var(--muted-foreground)",
            fontSize: "13px",
            textDecoration: "none",
            marginBottom: "12px",
          }}
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Configurações
        </Link>

        <div className="flex items-center justify-between gap-4">
          <div>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "22px",
                fontWeight: 700,
                color: "var(--foreground)",
                margin: 0,
              }}
            >
              Salas de Atendimento
            </h1>
            <p style={{ color: "var(--muted-foreground)", fontSize: "13px", marginTop: "2px" }}>
              {rooms.length} sala{rooms.length !== 1 ? "s" : ""} cadastrada{rooms.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={openCreate}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "linear-gradient(135deg, #D4B86A, #B8960C)",
              color: "#161412",
              fontSize: "13px",
              fontWeight: 600,
              padding: "9px 16px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              flexShrink: 0,
            }}
          >
            <Plus size={15} strokeWidth={2} />
            Nova Sala
          </button>
        </div>
      </div>

      {/* Mensagem de erro de exclusao */}
      {deleteError && (
        <div style={{
          padding: "12px 16px",
          borderRadius: "10px",
          background: "rgba(217,68,68,0.08)",
          border: "1px solid rgba(217,68,68,0.25)",
          color: "#D94444",
          fontSize: "13px",
          fontWeight: 500,
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}>
          <span style={{ fontSize: "16px" }}>⚠</span>
          {deleteError}
        </div>
      )}

      {/* Lista de salas */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              border: "3px solid #EDE5D3",
              borderTopColor: "#B8960C",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : rooms.length === 0 ? (
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "14px",
            padding: "60px 20px",
            textAlign: "center",
          }}
        >
          <p style={{ color: "var(--muted-foreground)", fontSize: "15px" }}>Nenhuma sala cadastrada ainda.</p>
          <button
            onClick={openCreate}
            style={{
              marginTop: "12px",
              background: "linear-gradient(135deg, #D4B86A, #B8960C)",
              color: "#161412",
              fontSize: "13px",
              fontWeight: 600,
              padding: "9px 20px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Criar primeira sala
          </button>
        </div>
      ) : (
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "14px",
            overflow: "hidden",
            maxWidth: "700px",
          }}
        >
          {rooms.map((room, idx) => (
            <div
              key={room.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                borderBottom: idx < rooms.length - 1 ? "1px solid #F0EBE0" : "none",
                gap: "12px",
              }}
            >
              {/* Info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: room.active ? "#2D8C4E" : "#D94444",
                    flexShrink: 0,
                  }}
                />
                <div>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "var(--foreground)",
                      margin: 0,
                    }}
                  >
                    {room.name}
                  </p>
                  <p
                    style={{
                      fontSize: "12px",
                      color: room.active ? "#2D8C4E" : "#D94444",
                      margin: 0,
                    }}
                  >
                    {room.active ? "Ativa" : "Inativa"}
                  </p>
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Toggle ativo/inativo */}
                <button
                  onClick={() => handleToggle(room)}
                  title={room.active ? "Desativar" : "Ativar"}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "34px",
                    height: "34px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    background: "transparent",
                    cursor: "pointer",
                    color: room.active ? "#2D8C4E" : "#D94444",
                    transition: "background 0.15s",
                  }}
                >
                  {room.active ? <Check size={15} strokeWidth={2} /> : <X size={15} strokeWidth={2} />}
                </button>

                {/* Editar */}
                <button
                  onClick={() => openEdit(room)}
                  title="Editar"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "34px",
                    height: "34px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    background: "transparent",
                    cursor: "pointer",
                    color: "var(--muted-foreground)",
                    transition: "background 0.15s",
                  }}
                >
                  <Pencil size={14} strokeWidth={1.5} />
                </button>

                {/* Excluir */}
                {deletingId === room.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(room.id)}
                      style={{
                        padding: "6px 10px",
                        fontSize: "12px",
                        fontWeight: 600,
                        borderRadius: "7px",
                        border: "1px solid rgba(217,68,68,0.3)",
                        background: "rgba(217,68,68,0.08)",
                        color: "#D94444",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => setDeletingId(null)}
                      style={{
                        padding: "6px 10px",
                        fontSize: "12px",
                        fontWeight: 600,
                        borderRadius: "7px",
                        border: "1px solid var(--border)",
                        background: "transparent",
                        color: "var(--muted-foreground)",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeletingId(room.id)}
                    title="Excluir"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "34px",
                      height: "34px",
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                      background: "transparent",
                      cursor: "pointer",
                      color: "#D94444",
                      transition: "background 0.15s",
                    }}
                  >
                    <Trash2 size={14} strokeWidth={1.5} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de criação/edição */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              padding: "28px",
              width: "100%",
              maxWidth: "420px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            }}
          >
            {/* Cabeçalho modal */}
            <div className="flex items-center justify-between mb-5">
              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "var(--foreground)",
                  margin: 0,
                }}
              >
                {editingRoom ? "Editar Sala" : "Nova Sala"}
              </h2>
              <button
                onClick={closeModal}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "30px",
                  height: "30px",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  background: "transparent",
                  cursor: "pointer",
                  color: "var(--muted-foreground)",
                }}
              >
                <X size={14} strokeWidth={2} />
              </button>
            </div>

            {/* Campo nome */}
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Nome da Sala *</label>
              <input
                type="text"
                placeholder="Ex: Sala 1, Sala VIP..."
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                style={inputStyle}
                autoFocus
              />
            </div>

            {/* Checkbox ativa */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1px solid var(--border)",
                background: "#FAFAF8",
                marginBottom: "20px",
                cursor: "pointer",
              }}
              onClick={() => setFormIsActive(!formIsActive)}
            >
              <div
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "5px",
                  border: formIsActive ? "none" : "2px solid #EDE5D3",
                  background: formIsActive ? "linear-gradient(135deg, #D4B86A, #B8960C)" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "all 0.15s",
                }}
              >
                {formIsActive && <Check size={11} strokeWidth={2.5} color="#161412" />}
              </div>
              <p style={{ fontSize: "14px", color: "var(--foreground)", margin: 0, fontWeight: 500, userSelect: "none" }}>
                Sala ativa
              </p>
            </div>

            {/* Erro */}
            {formError && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: "rgba(217,68,68,0.08)",
                  border: "1px solid rgba(217,68,68,0.2)",
                  color: "#D94444",
                  fontSize: "13px",
                  marginBottom: "16px",
                }}
              >
                {formError}
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-3">
              <button
                onClick={closeModal}
                style={{
                  flex: 1,
                  padding: "11px",
                  borderRadius: "10px",
                  border: "1px solid var(--border)",
                  background: "transparent",
                  color: "var(--muted-foreground)",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={formLoading}
                style={{
                  flex: 1,
                  padding: "11px",
                  borderRadius: "10px",
                  border: "none",
                  background: formLoading ? "#EDE5D3" : "linear-gradient(135deg, #D4B86A, #B8960C)",
                  color: "#161412",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: formLoading ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                }}
              >
                {formLoading ? "Salvando..." : editingRoom ? "Salvar alterações" : "Criar sala"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
