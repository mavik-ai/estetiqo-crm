'use client'

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search, Clock } from "lucide-react";

interface Client {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
  duration_minutes: number | null;
}

interface Protocol {
  id: string;
  status: string;
  total_sessions: number;
  completed_sessions: number;
  services: { name: string } | null;
}

interface Room {
  id: string;
  name: string;
}

interface Professional {
  id: string;
  name: string;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid #EDE5D3",
  background: "#FAFAF8",
  color: "#2D2319",
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

function addMinutes(timeStr: string, minutes: number): string {
  const [h, m] = timeStr.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

export default function NovoAgendamentoPage() {
  const router = useRouter();
  const supabase = createClient();

  // Form state
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientResults, setClientResults] = useState<Client[]>([]);
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");

  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [selectedProtocolId, setSelectedProtocolId] = useState("");

  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState("");

  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState("");

  const [date, setDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load services, rooms, professionals on mount
  useEffect(() => {
    async function loadOptions() {
      const [servicesRes, roomsRes, profRes] = await Promise.all([
        supabase.from("services").select("id, name, duration_minutes").eq("is_active", true).order("name"),
        supabase.from("rooms").select("id, name").eq("is_active", true).order("name"),
        supabase.from("users").select("id, name").in("role", ["admin", "operator"]).order("name"),
      ]);
      setServices((servicesRes.data ?? []) as Service[]);
      setRooms((roomsRes.data ?? []) as Room[]);
      setProfessionals((profRes.data ?? []) as Professional[]);
    }
    loadOptions();
  }, []);

  // Search clients
  const searchClients = useCallback(
    async (query: string) => {
      if (query.length < 2) {
        setClientResults([]);
        return;
      }
      const { data } = await supabase
        .from("clients")
        .select("id, name")
        .ilike("name", `%${query}%`)
        .limit(8);
      setClientResults((data ?? []) as Client[]);
    },
    [supabase]
  );

  useEffect(() => {
    const timer = setTimeout(() => searchClients(clientSearch), 300);
    return () => clearTimeout(timer);
  }, [clientSearch, searchClients]);

  // Load protocols when client changes
  useEffect(() => {
    if (!selectedClient) {
      setProtocols([]);
      setSelectedProtocolId("");
      return;
    }
    async function loadProtocols() {
      const { data } = await supabase
        .from("protocols")
        .select("id, status, total_sessions, completed_sessions, services(name)")
        .eq("client_id", selectedClient!.id)
        .eq("status", "active");
      setProtocols((data ?? []) as unknown as Protocol[]);
    }
    loadProtocols();
  }, [selectedClient]);

  // Auto-calculate end time when service or start time changes
  useEffect(() => {
    const service = services.find((s) => s.id === selectedServiceId);
    if (service?.duration_minutes && startTime) {
      setEndTime(addMinutes(startTime, service.duration_minutes));
    }
  }, [selectedServiceId, startTime, services]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClient || !selectedServiceId || !selectedRoomId || !date || !startTime || !endTime) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);
    setError(null);

    const startsAt = `${date}T${startTime}:00`;
    const endsAt = `${date}T${endTime}:00`;

    const { error: insertError } = await supabase.from("appointments").insert({
      client_id: selectedClient.id,
      service_id: selectedServiceId,
      protocol_id: selectedProtocolId || null,
      room_id: selectedRoomId,
      professional_id: selectedProfessionalId || null,
      starts_at: startsAt,
      ends_at: endsAt,
      notes: notes || null,
      rsvp_status: "pending",
      is_block: false,
      no_show: false,
    });

    if (insertError) {
      setError("Erro ao criar agendamento. Tente novamente.");
      setLoading(false);
      return;
    }

    router.push("/agenda");
  }

  const selectedService = services.find((s) => s.id === selectedServiceId);

  return (
    <div className="px-6 py-5" style={{ background: "#F6F2EA", minHeight: "100%" }}>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/agenda"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "#A69060",
            fontSize: "13px",
            textDecoration: "none",
            marginBottom: "12px",
          }}
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Agenda
        </Link>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "22px",
            fontWeight: 700,
            color: "#2D2319",
            margin: 0,
          }}
        >
          Novo Agendamento
        </h1>
      </div>

      {/* Card formulário */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #EDE5D3",
          borderRadius: "14px",
          padding: "28px",
          maxWidth: "680px",
        }}
      >
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Paciente */}
          <div style={{ position: "relative" }}>
            <label style={labelStyle}>Paciente *</label>
            <div style={{ position: "relative" }}>
              <Search
                size={15}
                strokeWidth={1.5}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#BBA870",
                  pointerEvents: "none",
                }}
              />
              <input
                type="text"
                placeholder="Buscar paciente..."
                value={selectedClient ? selectedClient.name : clientSearch}
                onChange={(e) => {
                  setClientSearch(e.target.value);
                  setSelectedClient(null);
                  setShowClientDropdown(true);
                }}
                onFocus={() => setShowClientDropdown(true)}
                onBlur={() => setTimeout(() => setShowClientDropdown(false), 200)}
                style={{ ...inputStyle, paddingLeft: "38px" }}
              />
            </div>
            {showClientDropdown && clientResults.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  background: "#FFFFFF",
                  border: "1px solid #EDE5D3",
                  borderRadius: "10px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                  zIndex: 50,
                  overflow: "hidden",
                  marginTop: "4px",
                }}
              >
                {clientResults.map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => {
                      setSelectedClient(client);
                      setClientSearch(client.name);
                      setShowClientDropdown(false);
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 14px",
                      fontSize: "14px",
                      color: "#2D2319",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      borderBottom: "1px solid #F0EBE0",
                      fontFamily: "inherit",
                    }}
                  >
                    {client.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Serviço */}
          <div>
            <label style={labelStyle}>Serviço *</label>
            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              style={{ ...inputStyle, cursor: "pointer" }}
              required
            >
              <option value="">Selecionar serviço...</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                  {s.duration_minutes ? ` (${s.duration_minutes} min)` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Protocolo (opcional) */}
          {selectedClient && (
            <div>
              <label style={labelStyle}>Protocolo (opcional)</label>
              <select
                value={selectedProtocolId}
                onChange={(e) => setSelectedProtocolId(e.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                <option value="">Nenhum protocolo vinculado</option>
                {protocols.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.services?.name ?? "Protocolo"} — {p.completed_sessions}/{p.total_sessions} sessões
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sala */}
          <div>
            <label style={labelStyle}>Sala *</label>
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              style={{ ...inputStyle, cursor: "pointer" }}
              required
            >
              <option value="">Selecionar sala...</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Profissional */}
          <div>
            <label style={labelStyle}>Profissional</label>
            <select
              value={selectedProfessionalId}
              onChange={(e) => setSelectedProfessionalId(e.target.value)}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              <option value="">Selecionar profissional...</option>
              {professionals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Data e horários */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label style={labelStyle}>Data *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ ...inputStyle }}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Hora início *</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                style={{ ...inputStyle }}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Hora fim</label>
              <div style={{ position: "relative" }}>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  style={{ ...inputStyle }}
                />
                {selectedService?.duration_minutes && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      marginTop: "4px",
                      color: "#B8960C",
                      fontSize: "11px",
                    }}
                  >
                    <Clock size={11} strokeWidth={1.5} />
                    <span>Calculado: {selectedService.duration_minutes} min</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label style={labelStyle}>Observações</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações sobre o agendamento..."
              rows={3}
              style={{ ...inputStyle, resize: "vertical", lineHeight: "1.5" }}
            />
          </div>

          {/* Erro */}
          {error && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                background: "rgba(217,68,68,0.08)",
                border: "1px solid rgba(217,68,68,0.2)",
                color: "#D94444",
                fontSize: "13px",
              }}
            >
              {error}
            </div>
          )}

          {/* Botão submit */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? "#EDE5D3" : "linear-gradient(135deg, #D4B86A, #B8960C)",
                color: "#161412",
                fontSize: "14px",
                fontWeight: 700,
                padding: "11px 28px",
                borderRadius: "10px",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                transition: "opacity 0.15s",
              }}
            >
              {loading ? "Agendando..." : "Agendar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
