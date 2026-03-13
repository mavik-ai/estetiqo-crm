import { useState, useEffect } from "react";
import {
  Home, Calendar, Users, Settings, Bell, Plus,
  AlertCircle, ClipboardList, X, ChevronRight,
  TrendingUp, TrendingDown, CheckCircle, Clock,
  AlertTriangle, XCircle, CalendarOff, CalendarClock,
  Scissors, DollarSign, FileText, LogOut, Activity,
  AlertOctagon, Cake, Layers
} from "lucide-react";

// ─── UTILS ────────────────────────────────────────────────────────────────────
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
};

// ─── DESIGN TOKENS (herdados do v8) ──────────────────────────────────────────
const T = {
  gold:       "#B8960C",
  goldLight:  "#D4B86A",
  goldFaint:  "#FBF5EA",
  goldBorder: "#EDE5D3",
  dark:       "#2D2319",
  darkMid:    "#8A7E60",
  darkFaint:  "#A69060",
  cream:      "#FEFCF7",
  creamBg:    "#F6F2EA",
  creamMid:   "#F5EDE0",
  creamBdr:   "#EDE5D3",
  white:      "#FFFFFF",
  green:      "#2D8C4E",
  greenFaint: "#E8F5E9",
  blue:       "#3A7BD5",
  blueFaint:  "#E3F2FD",
  amber:      "#C4880A",
  amberFaint: "#FFF3E0",
  red:        "#D94444",
  redFaint:   "#FFEBEE",
};

// ─── DATA ─────────────────────────────────────────────────────────────────────
const notifications = [
  { icon: <AlertCircle size={13} />, text: "Tatiane Borges — protocolo 5 dias atrasado", action: "Agendar →", color: T.amber },
  { icon: <ClipboardList size={13} />, text: "3 protocolos próximos da última sessão", action: "Ver →", color: T.blue },
  { icon: <X size={13} />, text: "Julia Ramos cancelou às 09:30", action: "Reagendar →", color: T.red },
];

const appointments = [
  { time: "08:30", name: "Maria Silva",   initials: "MS", service: "Drenagem Linfática",  session: "6/10", sala: "Sala 1", prof: "Ana Paula", status: "confirmed" },
  { time: "09:00", name: "Ana Costa",     initials: "AC", service: "Criolipólise",         session: "3/8",  sala: "Sala 2", prof: "Michele",   status: "pending" },
  { time: "10:00", name: "Julia Ramos",   initials: "JR", service: "Laser Corporal",       session: "2/6",  sala: "Sala 1", prof: "Ana Paula", status: "cancelled" },
  { time: "11:00", name: "Carla Melo",    initials: "CM", service: "Massagem Modeladora",  session: "1/4",  sala: "Sala 2", prof: "Michele",   status: "confirmed" },
  { time: "14:00", name: "Paula Nunes",   initials: "PN", service: "Radiofrequência",      session: "4/5",  sala: "Sala 1", prof: "Ana Paula", status: "pending" },
  { time: "15:30", name: "Renata Luz",    initials: "RL", service: "Drenagem Linfática",   session: "2/10", sala: "Sala 2", prof: "Michele",   status: "confirmed" },
];

const statusConfig = {
  confirmed: { color: T.green, icon: <CheckCircle size={15} />,  label: "Confirmada",   iconSm: <CheckCircle size={13} /> },
  pending:   { color: T.blue,  icon: <Clock size={15} />,        label: "Pendente",     iconSm: <Clock size={13} /> },
  noresponse:{ color: T.amber, icon: <AlertTriangle size={15} />,label: "Sem resposta", iconSm: <AlertTriangle size={13} /> },
  cancelled: { color: T.red,   icon: <XCircle size={15} />,      label: "Cancelada",    iconSm: <XCircle size={13} /> },
};

const navItems = [
  { icon: <Home size={18} />,     label: "Dashboard",  id: "dashboard" },
  { icon: <Calendar size={18} />, label: "Agenda",     id: "agenda" },
  { icon: <Users size={18} />,    label: "Pacientes",  id: "pacientes" },
  { icon: <Layers size={18} />,   label: "Protocolos", id: "protocolos" },
  { icon: <FileText size={18} />, label: "Relatórios", id: "relatorios" },
];

const birthdays = [
  { name: "Marina Alves",    date: "11 de março",  days: 0 },
  { name: "Fernanda Rocha",  date: "13 de março",  days: 2 },
  { name: "Bianca Monteiro", date: "15 de março",  days: 4 },
];

const protocolAlerts = [
  { name: "Tatiane Borges",  protocol: "Drenagem Pós-Lipo · 7/10",  delayed: 5 },
  { name: "Camila Nunes",    protocol: "Radiofrequência · 4/8",      delayed: 3 },
  { name: "Letícia Pereira", protocol: "Tratamento Facial · 2/6",    delayed: 7 },
];

const rooms = [
  { room: "Sala 1", patient: "Maria Silva",  procedure: "Drenagem",  time: "08:30–10:00", prof: "Ana Paula", busy: true },
  { room: "Sala 2", patient: null,           procedure: null,        time: null,          prof: null,        busy: false },
];

// ─── SHARED STYLES ────────────────────────────────────────────────────────────
const card = {
  background: T.white,
  border: `1px solid ${T.creamBdr}`,
  borderRadius: "14px",
};
const sTitle = {
  color: T.darkFaint,
  fontWeight: 700,
  letterSpacing: "0.12em",
  fontSize: "10px",
  textTransform: "uppercase",
};
const sLink = {
  color: T.gold,
  fontWeight: 600,
  fontSize: "11px",
  display: "flex",
  alignItems: "center",
  gap: "2px",
  cursor: "pointer",
  background: "none",
  border: "none",
};

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
const NotifBanner = ({ activeNotif, setActiveNotif }) => (
  <div
    style={{
      ...card,
      border: `1px solid ${notifications[activeNotif].color}20`,
      borderRadius: "12px",
      padding: "10px 14px",
      display: "flex",
      alignItems: "center",
      gap: 10,
      position: "relative",
      overflow: "hidden",
    }}
  >
    <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 3, background: notifications[activeNotif].color, borderRadius: "12px 0 0 12px" }} />
    <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${notifications[activeNotif].color}12`, color: notifications[activeNotif].color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {notifications[activeNotif].icon}
    </div>
    <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: T.dark }}>{notifications[activeNotif].text}</div>
    <button style={{ color: notifications[activeNotif].color, fontSize: 11, fontWeight: 700, background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>
      {notifications[activeNotif].action}
    </button>
    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
      {notifications.map((_, i) => (
        <button key={i} onClick={() => setActiveNotif(i)} style={{ width: activeNotif === i ? 14 : 5, height: 5, borderRadius: 999, background: activeNotif === i ? T.gold : T.creamBdr, border: "none", cursor: "pointer", transition: "all 0.3s ease", padding: 0 }} />
      ))}
    </div>
  </div>
);

const KpiCard = ({ label, value, sub, icon, featured, trend, trendUp }) => (
  <div style={{
    borderRadius: 14, padding: "14px 16px",
    background: featured ? `linear-gradient(135deg, #C4A43A, ${T.gold})` : T.white,
    border: featured ? "none" : `1px solid ${T.creamBdr}`,
    boxShadow: featured ? "0 6px 20px rgba(184,150,12,0.2)" : "none",
    position: "relative", overflow: "hidden", flex: 1,
  }}>
    {featured && <div style={{ position: "absolute", top: 0, right: 0, width: 70, height: 70, borderRadius: "50%", background: "rgba(255,255,255,0.1)", transform: "translate(40%,-50%)" }} />}
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: featured ? "rgba(255,255,255,0.7)" : T.darkFaint }}>{label}</div>
      <div style={{ color: featured ? "rgba(255,255,255,0.5)" : T.goldLight, opacity: 0.7 }}>{icon}</div>
    </div>
    <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1, color: featured ? T.white : T.dark }}>{value}</div>
    {sub && (
      <div style={{ marginTop: 4, fontSize: 11, fontWeight: 500, color: featured ? "rgba(255,255,255,0.65)" : (trendUp ? T.green : T.amber), display: "flex", alignItems: "center", gap: 3 }}>
        {trend && (trendUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />)}
        {sub}
      </div>
    )}
  </div>
);

// ─── WEB DASHBOARD ────────────────────────────────────────────────────────────
function WebDashboard() {
  const [activeNav, setActiveNav]     = useState("dashboard");
  const [activeNotif, setActiveNotif] = useState(0);
  const [activeFilter, setActiveFilter] = useState("all");
  const [hoveredRow, setHoveredRow]   = useState(null);

  useEffect(() => {
    const t = setInterval(() => setActiveNotif(p => (p + 1) % notifications.length), 4000);
    return () => clearInterval(t);
  }, []);

  const filters = [
    { id: "all",       label: "Todos",        count: appointments.length },
    { id: "confirmed", label: "Confirmadas",  count: appointments.filter(a => a.status === "confirmed").length },
    { id: "pending",   label: "Pendentes",    count: appointments.filter(a => a.status === "pending").length },
    { id: "cancelled", label: "Canceladas",   count: appointments.filter(a => a.status === "cancelled").length },
  ];
  const filtered = activeFilter === "all" ? appointments : appointments.filter(a => a.status === activeFilter);

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Urbanist', sans-serif", background: T.creamBg }}>
      <link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* SIDEBAR */}
      <div style={{ width: 220, flexShrink: 0, background: T.cream, borderRight: `1px solid ${T.creamBdr}`, display: "flex", flexDirection: "column", justifyContent: "space-between", position: "sticky", top: 0, height: "100vh" }}>
        <div>
          {/* Logo */}
          <div style={{ padding: "24px 20px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: `linear-gradient(135deg, ${T.goldLight}, ${T.gold})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 10px rgba(184,150,12,0.25)" }}>
                <Scissors size={15} color={T.cream} strokeWidth={2.5} />
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: T.dark, letterSpacing: "-0.02em" }}>estetiqo</div>
            </div>
            <div style={{ marginTop: 6, fontSize: 9, fontWeight: 700, color: "#BBA870", letterSpacing: "0.12em", textTransform: "uppercase" }}>Clínica Michele</div>
          </div>

          {/* Nav */}
          <div style={{ padding: "0 12px" }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", color: "#BBA870", padding: "0 10px", marginBottom: 6, textTransform: "uppercase" }}>Menu</div>
            {navItems.map(item => {
              const isActive = activeNav === item.id;
              return (
                <button key={item.id} onClick={() => setActiveNav(item.id)} style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
                  borderRadius: 10, marginBottom: 2, border: isActive ? `1px solid ${T.creamBdr}` : "1px solid transparent",
                  background: isActive ? `linear-gradient(135deg, ${T.goldFaint}, #F8F0E0)` : "transparent",
                  color: isActive ? T.gold : T.darkMid, cursor: "pointer", fontFamily: "'Urbanist', sans-serif",
                }}>
                  <div style={{ opacity: isActive ? 1 : 0.5 }}>{item.icon}</div>
                  <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 500 }}>{item.label}</span>
                  {isActive && <div style={{ marginLeft: "auto", width: 4, height: 16, borderRadius: 999, background: `linear-gradient(180deg, ${T.gold}, ${T.goldLight})` }} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom */}
        <div style={{ padding: "12px" }}>
          <div style={{ borderTop: `1px solid ${T.creamMid}`, marginBottom: 8 }} />
          {[
            { icon: <Settings size={17} />, label: "Configurações" },
            { icon: <LogOut size={17} />,   label: "Sair" },
          ].map((item, i) => (
            <button key={i} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 10, border: "none", background: "transparent", color: T.darkMid, cursor: "pointer", fontFamily: "'Urbanist', sans-serif", fontSize: 13, fontWeight: 500, marginBottom: 2 }}>
              <div style={{ opacity: 0.5 }}>{item.icon}</div>{item.label}
            </button>
          ))}
          {/* User */}
          <div style={{ marginTop: 8, borderRadius: 10, padding: "10px", display: "flex", alignItems: "center", gap: 10, background: T.goldFaint, border: `1px solid ${T.creamBdr}` }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${T.goldLight}, ${T.gold})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: T.cream, flexShrink: 0 }}>MO</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.dark, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Michele Oliveira</div>
              <div style={{ fontSize: 10, color: "#BBA870" }}>Gestora</div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, overflow: "auto" }}>

        {/* TOPBAR */}
        <div style={{ padding: "14px 24px", background: T.cream, borderBottom: `1px solid ${T.creamBdr}`, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: T.dark }}>{getGreeting()}, Michele</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.gold }} />
              <span style={{ fontSize: 12, color: T.darkFaint }}>Quarta-feira, 11 Mar 2026</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, background: `linear-gradient(135deg, ${T.goldLight}, ${T.gold})`, color: T.cream, border: "none", cursor: "pointer", fontFamily: "'Urbanist', sans-serif", fontSize: 12, fontWeight: 700, boxShadow: "0 3px 12px rgba(184,150,12,0.25)" }}>
              <Plus size={14} strokeWidth={2.5} /> Novo agendamento
            </button>
            <div style={{ position: "relative" }}>
              <button style={{ width: 40, height: 40, borderRadius: "50%", background: T.white, border: `1px solid ${T.creamBdr}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Bell size={17} color={T.gold} />
              </button>
              <div style={{ position: "absolute", top: -2, right: -2, width: 17, height: 17, borderRadius: "50%", background: "#EF4444", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(239,68,68,0.4)" }}>
                <span style={{ color: T.white, fontSize: 9, fontWeight: 800 }}>3</span>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div style={{ padding: "20px 24px" }}>

          {/* NOTIF */}
          <div style={{ marginBottom: 16 }}>
            <NotifBanner activeNotif={activeNotif} setActiveNotif={setActiveNotif} />
          </div>

          {/* KPIs */}
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <KpiCard label="Atendimentos hoje" value="12" sub="3 restantes" icon={<Calendar size={14} />} featured />
            <KpiCard label="Horários vagos" value="3" sub="próximo: 13:00" icon={<CalendarClock size={14} />} />
            <KpiCard label="Faltas do mês" value="2" sub="-60% vs fev" icon={<CalendarOff size={14} />} trend trendUp={false} />
            <KpiCard label="Faturamento mês" value="R$24.6k" sub="+12% · 72% da meta" icon={<TrendingUp size={14} />} trend trendUp />
          </div>

          {/* MAIN GRID */}
          <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: 16 }}>

            {/* TABELA DE SESSÕES */}
            <div style={{ ...card, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={sTitle}>Sessões de hoje</div>
                <button style={sLink}>Ver agenda completa <ChevronRight size={13} /></button>
              </div>

              {/* Filtros */}
              <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                {filters.map(f => (
                  <button key={f.id} onClick={() => setActiveFilter(f.id)} style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8,
                    background: activeFilter === f.id ? T.gold : T.goldFaint,
                    color: activeFilter === f.id ? T.cream : T.darkMid,
                    border: `1px solid ${activeFilter === f.id ? T.gold : T.creamBdr}`,
                    fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Urbanist', sans-serif",
                  }}>
                    {f.label}
                    <span style={{ background: activeFilter === f.id ? "rgba(255,255,255,0.25)" : T.creamBdr, color: activeFilter === f.id ? T.cream : T.darkFaint, padding: "1px 6px", borderRadius: 6, fontSize: 10, fontWeight: 700 }}>{f.count}</span>
                  </button>
                ))}
              </div>

              {/* Header da tabela */}
              <div style={{ display: "grid", gridTemplateColumns: "28px 44px 1fr 1fr 52px 60px 56px 80px", gap: 8, paddingBottom: 8, borderBottom: `1px solid ${T.creamMid}`, alignItems: "center" }}>
                {["", "Hora", "Paciente", "Serviço", "Sessão", "Sala", "Profissional", "Status"].map((h, i) => (
                  <div key={i} style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#BBA870" }}>{h}</div>
                ))}
              </div>

              {/* Rows */}
              {filtered.map((a, i) => {
                const sc = statusConfig[a.status];
                const isU = a.status !== "confirmed";
                const isH = hoveredRow === i;
                return (
                  <div key={i}
                    onMouseEnter={() => setHoveredRow(i)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      display: "grid", gridTemplateColumns: "28px 44px 1fr 1fr 52px 60px 56px 80px",
                      gap: 8, alignItems: "center",
                      padding: isH ? "10px 6px" : "10px 0",
                      margin: isH ? "0 -6px" : "0",
                      borderBottom: i < filtered.length - 1 ? `1px solid ${T.creamMid}` : "none",
                      background: isH ? T.goldFaint : "transparent",
                      borderRadius: isH ? 8 : 0,
                      position: "relative", cursor: "pointer",
                      transition: "all 0.15s",
                    }}>
                    <div style={{ color: sc.color, display: "flex", justifyContent: "center" }}>{sc.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.gold }}>{a.time}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: isU ? `${sc.color}12` : T.creamMid, border: `1px solid ${isU ? sc.color + "22" : T.creamBdr}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 9, fontWeight: 800, color: isU ? sc.color : T.darkFaint }}>{a.initials}</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: isU ? "#B8860B" : T.dark, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</span>
                    </div>
                    <div style={{ fontSize: 12, color: T.darkMid, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.service}</div>
                    <span style={{ padding: "2px 8px", borderRadius: 6, background: T.goldFaint, border: `1px solid ${T.creamBdr}`, color: T.gold, fontSize: 10, fontWeight: 700, textAlign: "center" }}>{a.session}</span>
                    <div style={{ fontSize: 11, color: T.darkFaint }}>{a.sala}</div>
                    <div style={{ fontSize: 11, color: T.darkFaint, fontWeight: 600 }}>{a.prof}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, color: sc.color, fontSize: 11, fontWeight: 600 }}>
                      {sc.iconSm} {sc.label}
                    </div>
                  </div>
                );
              })}

              {/* Legenda */}
              <div style={{ display: "flex", gap: 16, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.creamMid}` }}>
                {Object.entries(statusConfig).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: 5, color: v.color }}>
                    {v.iconSm} <span style={{ color: T.darkFaint, fontSize: 10, fontWeight: 500 }}>{v.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* COLUNA LATERAL */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

              {/* Salas agora */}
              <div style={{ borderRadius: 14, padding: 14, background: `linear-gradient(135deg, #C4A43A, ${T.gold})`, boxShadow: "0 6px 20px rgba(184,150,12,0.22)" }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", marginBottom: 10 }}>Salas agora</div>
                {rooms.map((r, i) => (
                  <div key={i} style={{ background: r.busy ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 12px", marginBottom: i === 0 ? 6 : 0, border: `1px solid ${r.busy ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)"}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: T.white }}>{r.room}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: r.busy ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)", color: r.busy ? T.white : "rgba(255,255,255,0.5)", letterSpacing: "0.06em" }}>{r.busy ? "EM ATENDIMENTO" : "LIVRE"}</span>
                    </div>
                    {r.busy && (
                      <div style={{ marginTop: 4 }}>
                        <div style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.9)" }}>{r.patient}</div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", marginTop: 1 }}>{r.procedure} · {r.time}</div>
                      </div>
                    )}
                    {!r.busy && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>Nenhum agendamento agora</div>}
                  </div>
                ))}
              </div>

              {/* Aniversariantes */}
              <div style={{ ...card, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={sTitle}>🎂 Aniversariantes</div>
                  <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: T.amberFaint, color: T.amber }}>Esta semana</span>
                </div>
                {birthdays.map((b, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: i < birthdays.length - 1 ? `1px solid ${T.creamMid}` : "none" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.amberFaint, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: T.amber, flexShrink: 0 }}>
                      {b.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: T.dark }}>{b.name}</div>
                      <div style={{ fontSize: 10, color: T.darkFaint }}>{b.date}</div>
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: b.days === 0 ? T.amberFaint : T.creamMid, color: b.days === 0 ? T.amber : T.darkFaint }}>{b.days === 0 ? "Hoje 🎉" : `Em ${b.days}d`}</span>
                  </div>
                ))}
              </div>

              {/* Alertas de protocolo */}
              <div style={{ ...card, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={sTitle}>Protocolos atrasados</div>
                  <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: T.amberFaint, color: T.amber }}>{protocolAlerts.length} alertas</span>
                </div>
                {protocolAlerts.map((a, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: i < protocolAlerts.length - 1 ? `1px solid ${T.creamMid}` : "none" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: T.amberFaint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <AlertOctagon size={13} color={T.amber} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: T.dark, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</div>
                      <div style={{ fontSize: 10, color: T.darkFaint, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.protocol}</div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: T.amber, flexShrink: 0 }}>+{a.delayed}d</span>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MOBILE DASHBOARD ─────────────────────────────────────────────────────────
function MobileDashboard() {
  const [activeNav, setActiveNav]       = useState("home");
  const [activeNotif, setActiveNotif]   = useState(0);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    const t = setInterval(() => setActiveNotif(p => (p + 1) % notifications.length), 4000);
    return () => clearInterval(t);
  }, []);

  const filters = [
    { id: "all",       label: "Todos",       count: appointments.length },
    { id: "confirmed", label: "Confirm.",    count: appointments.filter(a => a.status === "confirmed").length },
    { id: "pending",   label: "Pendentes",   count: appointments.filter(a => a.status === "pending").length },
    { id: "cancelled", label: "Canceladas",  count: appointments.filter(a => a.status === "cancelled").length },
  ];
  const filtered = activeFilter === "all" ? appointments : appointments.filter(a => a.status === activeFilter);

  const mobileNavItems = [
    { icon: <Home size={21} />,     label: "Home",     id: "home" },
    { icon: <Calendar size={21} />, label: "Agenda",   id: "agenda" },
    { icon: <Users size={21} />,    label: "Pacientes", id: "pacientes" },
    { icon: <Layers size={21} />,   label: "Protoc.",  id: "protocolos" },
    { icon: <Settings size={21} />, label: "Config",   id: "config" },
  ];

  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", minHeight: "100vh", background: `linear-gradient(160deg, #F5EDE0 0%, #E8DFD0 40%, #F0E8D8 100%)`, padding: "40px 0 60px", fontFamily: "'Urbanist', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Phone frame */}
      <div style={{ position: "relative", width: 393, height: 852 }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 55, overflow: "hidden", background: "linear-gradient(145deg, #E8E0D0, #D0C8B8)", boxShadow: "0 50px 100px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.5) inset" }}>
          <div style={{ position: "absolute", borderRadius: 48, overflow: "hidden", top: 6, left: 6, right: 6, bottom: 6, background: "#FEFCF7" }}>

            {/* Status bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 28px 4px", position: "relative" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.dark }}>9:41</div>
              <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", top: 8, width: 126, height: 34, background: "#000", borderRadius: 20 }} />
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <svg width="16" height="12" viewBox="0 0 16 12" fill={T.dark}><rect x="0" y="3" width="3" height="9" rx="1" opacity="0.3"/><rect x="4.5" y="2" width="3" height="10" rx="1" opacity="0.5"/><rect x="9" y="1" width="3" height="11" rx="1" opacity="0.7"/><rect x="13.5" y="0" width="3" height="12" rx="1"/></svg>
                <div style={{ position: "relative", width: 25, height: 12 }}>
                  <div style={{ position: "absolute", inset: 0, borderRadius: 3, border: `1px solid ${T.dark}`, opacity: 0.35 }} />
                  <div style={{ position: "absolute", top: 2, left: 2, bottom: 2, width: 18, borderRadius: 2, background: T.dark }} />
                </div>
              </div>
            </div>

            {/* Scrollable content */}
            <div style={{ height: "calc(100% - 100px)", overflowY: "auto", padding: "0 0 8px" }}>

              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "8px 20px 12px" }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: T.gold }}>Estetiqo</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, color: T.dark, fontSize: 20, lineHeight: 1.2, marginTop: 2 }}>{getGreeting()}, Michele</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.gold }} />
                    <div style={{ fontSize: 11, color: "#A69060", fontWeight: 500 }}>Quarta, 11 Mar 2026</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ position: "relative" }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: T.white, border: `1px solid ${T.creamBdr}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Bell size={16} color={T.gold} />
                    </div>
                    <div style={{ position: "absolute", top: -1, right: -1, width: 16, height: 16, borderRadius: "50%", background: "#EF4444", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: T.white, fontSize: 8, fontWeight: 800 }}>3</span>
                    </div>
                  </div>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: `linear-gradient(135deg, ${T.goldLight}, ${T.gold})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: T.cream }}>MO</div>
                </div>
              </div>

              {/* Notif */}
              <div style={{ padding: "0 20px 12px" }}>
                <div style={{ ...card, border: `1px solid ${notifications[activeNotif].color}18`, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, position: "relative", overflow: "hidden", borderRadius: 12 }}>
                  <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 3, background: notifications[activeNotif].color }} />
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: `${notifications[activeNotif].color}12`, color: notifications[activeNotif].color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {notifications[activeNotif].icon}
                  </div>
                  <div style={{ flex: 1, fontSize: 12, fontWeight: 500, color: T.dark }}>{notifications[activeNotif].text}</div>
                  <button style={{ color: notifications[activeNotif].color, fontSize: 10, fontWeight: 700, background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>{notifications[activeNotif].action}</button>
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 6 }}>
                  {notifications.map((_, i) => (
                    <button key={i} onClick={() => setActiveNotif(i)} style={{ width: activeNotif === i ? 12 : 4, height: 4, borderRadius: 999, background: activeNotif === i ? T.gold : T.creamBdr, border: "none", cursor: "pointer", padding: 0, transition: "all 0.3s" }} />
                  ))}
                </div>
              </div>

              {/* KPIs 2×2 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "0 20px 12px" }}>
                {/* Featured */}
                <div style={{ borderRadius: 14, padding: "12px 14px", background: `linear-gradient(135deg, #C4A43A, ${T.gold})`, boxShadow: "0 4px 15px rgba(184,150,12,0.2)", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, right: 0, width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.1)", transform: "translate(40%,-40%)" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                    <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)" }}>Atendimentos</div>
                    <Calendar size={12} color="rgba(255,255,255,0.5)" />
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: T.white, lineHeight: 1 }}>12</div>
                  <div style={{ fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>3 restantes</div>
                </div>
                {/* Faturamento */}
                <div style={{ ...card, padding: "12px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                    <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.darkFaint }}>Faturamento</div>
                    <TrendingUp size={12} color={T.green} style={{ opacity: 0.5 }} />
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: T.dark, lineHeight: 1 }}>R$24,6k</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 2, fontSize: 10, fontWeight: 500, color: T.green }}>
                    <TrendingUp size={10} /> +12% · 72% meta
                  </div>
                </div>
                {/* Horários vagos */}
                <div style={{ ...card, padding: "12px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                    <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.darkFaint }}>Horários vagos</div>
                    <CalendarClock size={12} color={T.amber} style={{ opacity: 0.5 }} />
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: T.dark, lineHeight: 1 }}>3</div>
                  <div style={{ fontSize: 10, fontWeight: 500, color: "#BBA870", marginTop: 2 }}>próximo: 13:00</div>
                </div>
                {/* Faltas */}
                <div style={{ ...card, padding: "12px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                    <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.darkFaint }}>Faltas do mês</div>
                    <CalendarOff size={12} color={T.green} style={{ opacity: 0.5 }} />
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: T.dark, lineHeight: 1 }}>2</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 2, fontSize: 10, fontWeight: 500, color: T.green }}>
                    <TrendingDown size={10} /> -60% vs fev
                  </div>
                </div>
              </div>

              {/* Sessões do dia */}
              <div style={{ margin: "0 20px 12px", ...card, padding: 14, borderRadius: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={sTitle}>Sessões de hoje</div>
                  <button style={sLink} >Ver todos <ChevronRight size={12} /></button>
                </div>
                {/* Filtros scroll */}
                <div style={{ display: "flex", gap: 6, marginBottom: 10, overflowX: "auto", scrollbarWidth: "none" }}>
                  {filters.map(f => (
                    <button key={f.id} onClick={() => setActiveFilter(f.id)} style={{
                      display: "flex", alignItems: "center", gap: 4, padding: "4px 10px",
                      borderRadius: 6, flexShrink: 0, cursor: "pointer",
                      background: activeFilter === f.id ? T.gold : T.goldFaint,
                      color: activeFilter === f.id ? T.cream : T.darkMid,
                      border: `1px solid ${activeFilter === f.id ? T.gold : T.creamBdr}`,
                      fontSize: 10, fontWeight: 600, fontFamily: "'Urbanist', sans-serif",
                    }}>
                      {f.label}
                      <span style={{ background: activeFilter === f.id ? "rgba(255,255,255,0.25)" : T.creamBdr, color: activeFilter === f.id ? T.cream : T.darkFaint, padding: "0 4px", borderRadius: 5, fontSize: 9, fontWeight: 700 }}>{f.count}</span>
                    </button>
                  ))}
                </div>
                {/* List */}
                {filtered.map((a, i) => {
                  const sc = statusConfig[a.status];
                  const isU = a.status !== "confirmed";
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 10, paddingBottom: 10, borderBottom: i < filtered.length - 1 ? `1px solid ${T.creamMid}` : "none" }}>
                      <div style={{ color: sc.color, flexShrink: 0 }}>{sc.iconSm}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.gold, flexShrink: 0, width: 38 }}>{a.time}</div>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: isU ? `${sc.color}12` : T.creamMid, border: `1px solid ${isU ? sc.color + "22" : T.creamBdr}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 8, fontWeight: 800, color: isU ? sc.color : T.darkFaint }}>{a.initials}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: isU ? "#B8860B" : T.dark, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</span>
                          <span style={{ padding: "0 5px", borderRadius: 5, background: T.goldFaint, border: `1px solid ${T.creamBdr}`, color: T.gold, fontSize: 9, fontWeight: 700, flexShrink: 0 }}>{a.session}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 1 }}>
                          <span style={{ fontSize: 10, color: T.darkMid, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.service}</span>
                          <span style={{ color: T.creamBdr }}>·</span>
                          <span style={{ fontSize: 10, color: T.darkFaint, fontWeight: 600, flexShrink: 0 }}>{a.prof}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {/* Legenda */}
                <div style={{ display: "flex", gap: 10, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.creamMid}`, flexWrap: "wrap" }}>
                  {Object.entries(statusConfig).map(([k, v]) => (
                    <div key={k} style={{ display: "flex", alignItems: "center", gap: 3, color: v.color }}>
                      {v.iconSm} <span style={{ color: T.darkFaint, fontSize: 9, fontWeight: 500 }}>{v.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick actions */}
              <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", padding: "4px 20px 16px" }}>
                {[
                  { icon: <Plus size={20} strokeWidth={2} />,        label: "Agendar" },
                  { icon: <Users size={20} strokeWidth={1.8} />,      label: "Paciente" },
                  { icon: <Layers size={20} strokeWidth={1.8} />,     label: "Protocolo" },
                  { icon: <Activity size={20} strokeWidth={1.8} />,   label: "Check-up" },
                ].map((a, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer" }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, #FFFDF7, #FBF5EA)", border: `1px solid ${T.creamBdr}`, color: T.gold, display: "flex", alignItems: "center", justifyContent: "center" }}>{a.icon}</div>
                    <span style={{ fontSize: 9, fontWeight: 600, color: T.darkFaint }}>{a.label}</span>
                  </div>
                ))}
              </div>

            </div>

            {/* Bottom nav */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80, paddingBottom: 20, background: T.white, borderTop: `1px solid ${T.creamBdr}`, display: "flex", alignItems: "center", justifyContent: "space-around", paddingLeft: 16, paddingRight: 16 }}>
              {mobileNavItems.map(nav => {
                const isActive = activeNav === nav.id;
                return (
                  <button key={nav.id} onClick={() => setActiveNav(nav.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, color: isActive ? T.gold : "#C4B890", border: "none", background: "none", cursor: "pointer", fontFamily: "'Urbanist', sans-serif" }}>
                    <div style={{ opacity: isActive ? 1 : 0.4 }}>{nav.icon}</div>
                    <div style={{ fontSize: 9, fontWeight: isActive ? 700 : 500 }}>{nav.label}</div>
                    {isActive && <div style={{ width: 14, height: 2.5, borderRadius: 999, background: `linear-gradient(90deg, ${T.gold}, ${T.goldLight})`, marginTop: -1 }} />}
                  </button>
                );
              })}
            </div>

          </div>
        </div>
        {/* Phone buttons */}
        <div style={{ position: "absolute", right: 0, top: 110, width: 4, height: 60, borderRadius: "0 2px 2px 0", background: "#C0B8A0", transform: "translateX(1px)" }} />
        <div style={{ position: "absolute", left: 0, top: 96,  width: 4, height: 32, borderRadius: "2px 0 0 2px", background: "#C0B8A0", transform: "translateX(-1px)" }} />
        <div style={{ position: "absolute", left: 0, top: 140, width: 4, height: 48, borderRadius: "2px 0 0 2px", background: "#C0B8A0", transform: "translateX(-1px)" }} />
        <div style={{ position: "absolute", left: 0, top: 200, width: 4, height: 48, borderRadius: "2px 0 0 2px", background: "#C0B8A0", transform: "translateX(-1px)" }} />
      </div>
    </div>
  );
}

// ─── VIEW SWITCHER ────────────────────────────────────────────────────────────
export default function EstetiqoDashboard() {
  const [view, setView] = useState("Web");

  return (
    <div style={{ fontFamily: "'Urbanist', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Toggle bar */}
      <div style={{ background: T.cream, borderBottom: `1px solid ${T.creamBdr}`, padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${T.goldLight}, ${T.gold})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Scissors size={13} color={T.cream} strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: T.dark, letterSpacing: "-0.01em" }}>estetiqo</span>
          <span style={{ fontSize: 10, color: "#BBA870", marginLeft: 4 }}>— Dashboard Wireframe v1.0</span>
        </div>
        <div style={{ display: "inline-flex", background: T.creamMid, borderRadius: 10, padding: 3, gap: 2 }}>
          {["Web", "Mobile"].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: "5px 18px", borderRadius: 8, border: "none", cursor: "pointer",
              fontSize: 12, fontWeight: 700, transition: "all 0.2s",
              background: view === v ? T.gold : "transparent",
              color: view === v ? T.cream : T.darkMid,
              boxShadow: view === v ? "0 2px 8px rgba(184,150,12,0.3)" : "none",
              fontFamily: "'Urbanist', sans-serif",
            }}>{v}</button>
          ))}
        </div>
        <div style={{ fontSize: 10, color: "#BBA870" }}>estetiqo.com · SaaS Multitenant</div>
      </div>

      {view === "Web"    && <WebDashboard />}
      {view === "Mobile" && <MobileDashboard />}
    </div>
  );
}
