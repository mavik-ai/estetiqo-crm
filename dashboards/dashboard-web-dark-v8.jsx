import { useState, useEffect } from "react";
import { Home, Calendar, Users, FileText, MessageSquare, Monitor, Settings, LogOut, Bell, Plus, AlertCircle, ClipboardList, X, ChevronRight, TrendingUp, TrendingDown, CheckCircle, Clock, AlertTriangle, XCircle, Send, BarChart3, CalendarOff, CalendarClock } from "lucide-react";

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
};

const notifications = [
  { icon: <AlertCircle size={14} />, text: "2 clientes não confirmaram presença", action: "Ver pendentes", color: "#F0C040" },
  { icon: <ClipboardList size={14} />, text: "1 protocolo vence esta semana", action: "Ver protocolo", color: "#7CB3F0" },
  { icon: <X size={14} />, text: "Julia Ramos cancelou às 09:30", action: "Reagendar", color: "#F07070" },
];

const navItems = [
  { icon: <Home size={18} />, label: "Dashboard", id: "dashboard" },
  { icon: <Calendar size={18} />, label: "Agenda", id: "agenda" },
  { icon: <Users size={18} />, label: "Clientes", id: "clientes" },
  { icon: <FileText size={18} />, label: "Protocolos", id: "protocolos" },
  { icon: <MessageSquare size={18} />, label: "RSVP", id: "rsvp" },
  { icon: <Monitor size={18} />, label: "Serviços", id: "servicos" },
  { icon: <BarChart3 size={18} />, label: "Relatórios", id: "relatorios" },
];

const appointments = [
  { time: "08:30", name: "Maria Silva", initials: "MS", service: "Drenagem Linfática", protocol: "6/10", sala: "Sala 1", prof: "Ana Paula", status: "confirmed" },
  { time: "09:00", name: "Ana Costa", initials: "AC", service: "Criolipólise", protocol: "3/8", sala: "Sala 2", prof: "Michele", status: "pending" },
  { time: "10:00", name: "Julia Ramos", initials: "JR", service: "Laser Corporal", protocol: "2/6", sala: "Sala 1", prof: "Ana Paula", status: "noresponse" },
  { time: "11:00", name: "Carla Melo", initials: "CM", service: "Massagem Modelad.", protocol: "1/4", sala: "Sala 2", prof: "Michele", status: "confirmed" },
  { time: "14:00", name: "Paula Nunes", initials: "PN", service: "Radiofrequência", protocol: "4/5", sala: "Sala 1", prof: "Ana Paula", status: "pending" },
  { time: "15:30", name: "Renata Luz", initials: "RL", service: "Drenagem Linfática", protocol: "2/10", sala: "Sala 2", prof: "Michele", status: "confirmed" },
];

const statusConfig = {
  confirmed: { color: "#6EE7A0", icon: <CheckCircle size={16} />, label: "Confirmado" },
  pending: { color: "#7CB3F0", icon: <Clock size={16} />, label: "Pendente" },
  noresponse: { color: "#F0C040", icon: <AlertTriangle size={16} />, label: "Sem resposta" },
  cancelled: { color: "#F07070", icon: <XCircle size={16} />, label: "Cancelou" },
};

export default function DashboardWebDarkV8() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [activeNotif, setActiveNotif] = useState(0);
  const [activeFilter, setActiveFilter] = useState("all");
  const [hoveredRow, setHoveredRow] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => { setActiveNotif((prev) => (prev + 1) % notifications.length); }, 4000);
    return () => clearInterval(timer);
  }, []);

  const filtered = activeFilter === "all" ? appointments : appointments.filter(a => a.status === activeFilter);
  const card = { background: "#252219", border: "1px solid #33301F", borderRadius: "14px" };
  const sTitle = { color: "#9A8E70", fontWeight: 700, letterSpacing: "0.12em", fontSize: "10px", textTransform: "uppercase" };
  const sLink = { color: "#D4B86A", fontWeight: 600, fontSize: "11px", display: "flex", alignItems: "center", gap: "2px", cursor: "pointer" };
  const filters = [
    { id: "all", label: "Todos", count: appointments.length },
    { id: "confirmed", label: "Confirmados", count: appointments.filter(a => a.status === "confirmed").length },
    { id: "pending", label: "Pendentes", count: appointments.filter(a => a.status === "pending").length },
    { id: "noresponse", label: "Sem resposta", count: appointments.filter(a => a.status === "noresponse").length },
  ];

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Urbanist', sans-serif", background: "#161412" }}>
      <link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* SIDEBAR */}
      <div className="flex flex-col justify-between flex-shrink-0" style={{ width: "220px", background: "#1C1A17", borderRight: "1px solid #2A2518" }}>
        <div>
          <div className="px-5 pt-6 pb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #D4B86A, #B8960C)", boxShadow: "0 3px 10px rgba(212,184,106,0.2)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1C1A17" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              </div>
              <div className="font-bold" style={{ color: "#FFFFFF", fontSize: "17px", letterSpacing: "-0.02em" }}>Estetiqo</div>
            </div>
          </div>
          <div className="px-3">
            <div style={{ color: "#6B5F40", fontSize: "9px", fontWeight: 700, letterSpacing: "0.15em", padding: "0 10px", marginBottom: "6px" }}>MENU</div>
            {navItems.map((item) => (
              <button key={item.id} onClick={() => setActiveNav(item.id)} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 transition-all" style={{ background: activeNav === item.id ? "linear-gradient(135deg, #2A2518, #252015)" : "transparent", border: activeNav === item.id ? "1px solid #3D3520" : "1px solid transparent", color: activeNav === item.id ? "#D4B86A" : "#9A8E70" }}>
                <div style={{ opacity: activeNav === item.id ? 1 : 0.5 }}>{item.icon}</div>
                <span style={{ fontSize: "13px", fontWeight: activeNav === item.id ? 700 : 500 }}>{item.label}</span>
                {activeNav === item.id && <div className="ml-auto w-1 h-4 rounded-full" style={{ background: "linear-gradient(180deg, #B8960C, #D4B86A)" }} />}
              </button>
            ))}
          </div>
        </div>
        <div className="px-3 pb-4">
          <div className="mb-2" style={{ borderTop: "1px solid #2A2518" }} />
          {[{ icon: <Settings size={18} />, label: "Configurações" }, { icon: <LogOut size={18} />, label: "Sair" }].map((item, i) => (
            <button key={i} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5" style={{ color: "#9A8E70" }}>
              <div style={{ opacity: 0.5 }}>{item.icon}</div><span style={{ fontSize: "13px", fontWeight: 500 }}>{item.label}</span>
            </button>
          ))}
          <div className="mt-2 rounded-lg p-2.5 flex items-center gap-2.5" style={{ background: "#252219", border: "1px solid #33301F" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: "linear-gradient(135deg, #D4B86A, #B8960C)", color: "#1C1A17" }}>MO</div>
            <div className="min-w-0">
              <div className="font-semibold truncate" style={{ color: "#FFFFFF", fontSize: "12px" }}>Michele Oliveira</div>
              <div style={{ color: "#9A8E70", fontSize: "10px" }}>Admin</div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 overflow-auto">
        <div className="flex justify-between items-center px-6 py-4" style={{ background: "#1C1A17", borderBottom: "1px solid #2A2518" }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, color: "#FFFFFF", fontSize: "22px" }}>{getGreeting()}, Michele</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#D4B86A" }} />
              <span style={{ color: "#9A8E70", fontSize: "12px" }}>Segunda, 09 Mar 2026</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: "linear-gradient(135deg, #D4B86A, #B8960C)", color: "#1C1A17", boxShadow: "0 3px 12px rgba(212,184,106,0.2)", fontSize: "12px", fontWeight: 700 }}><Plus size={15} strokeWidth={2.5} /> Novo agendamento</button>
            <div className="relative w-10 h-10 rounded-full flex items-center justify-center cursor-pointer" style={{ background: "#252219", border: "1px solid #33301F" }}>
              <Bell size={18} style={{ color: "#D4B86A" }} />
              <div className="absolute -top-0.5 -right-0.5 rounded-full flex items-center justify-center" style={{ background: "#EF4444", width: "17px", height: "17px", boxShadow: "0 2px 8px rgba(239,68,68,0.5)" }}><span className="text-white font-bold" style={{ fontSize: "9px" }}>3</span></div>
            </div>
          </div>
        </div>

        <div className="px-6 py-5" style={{ background: "#161412" }}>
          {/* ALERTAS */}
          <div className="rounded-xl px-4 py-2.5 flex items-center gap-3 mb-4 relative overflow-hidden" style={{ ...card, border: `1px solid ${notifications[activeNotif].color}18` }}>
            <div className="absolute top-0 left-0 bottom-0 w-0.5" style={{ background: notifications[activeNotif].color }} />
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${notifications[activeNotif].color}12`, color: notifications[activeNotif].color }}>{notifications[activeNotif].icon}</div>
            <div className="flex-1" style={{ color: "#FFFFFF", fontSize: "13px", fontWeight: 500 }}>{notifications[activeNotif].text}</div>
            <button className="flex items-center gap-0.5 flex-shrink-0" style={{ color: notifications[activeNotif].color, fontSize: "11px", fontWeight: 700 }}>{notifications[activeNotif].action} <ChevronRight size={12} /></button>
            <div className="flex gap-1 flex-shrink-0 ml-1">
              {notifications.map((_, i) => (<button key={i} onClick={() => setActiveNotif(i)} className="rounded-full transition-all" style={{ width: activeNotif === i ? "14px" : "5px", height: "5px", background: activeNotif === i ? "#D4B86A" : "#33301F", transition: "all 0.3s ease" }} />))}
            </div>
          </div>

          {/* MÉTRICAS */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {/* 1. Atendimentos hoje — featured */}
            <div className="rounded-xl p-3.5 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #C4A43A, #9A7C10)", boxShadow: "0 6px 20px rgba(196,164,58,0.2)" }}>
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full" style={{ background: "rgba(255,255,255,0.08)", transform: "translate(40%, -50%)" }} />
              <div className="flex items-center justify-between mb-1">
                <div className="uppercase" style={{ color: "rgba(255,255,255,0.7)", fontWeight: 700, letterSpacing: "0.1em", fontSize: "9px" }}>Atendimentos hoje</div>
                <Calendar size={14} style={{ color: "rgba(255,255,255,0.4)" }} />
              </div>
              <div className="font-extrabold" style={{ color: "#FFFFFF", fontSize: "26px", lineHeight: "1" }}>12</div>
              <div className="mt-1" style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px", fontWeight: 500 }}>3 restantes</div>
            </div>
            {/* 2. Horários vagos */}
            <div className="rounded-xl p-3.5" style={{ background: "#252219", border: "1px solid #33301F" }}>
              <div className="flex items-center justify-between mb-1">
                <div className="uppercase" style={{ color: "#9A8E70", fontWeight: 700, letterSpacing: "0.1em", fontSize: "9px" }}>Horários vagos</div>
                <CalendarClock size={14} style={{ color: "#F0C040", opacity: 0.5 }} />
              </div>
              <div className="font-extrabold" style={{ color: "#FFFFFF", fontSize: "26px", lineHeight: "1" }}>3</div>
              <div className="mt-1" style={{ color: "#9A8E70", fontSize: "11px", fontWeight: 500 }}>próximo: 13:00</div>
            </div>
            {/* 3. No-shows */}
            <div className="rounded-xl p-3.5" style={{ background: "#252219", border: "1px solid #33301F" }}>
              <div className="flex items-center justify-between mb-1">
                <div className="uppercase" style={{ color: "#9A8E70", fontWeight: 700, letterSpacing: "0.1em", fontSize: "9px" }}>No-shows do mês</div>
                <CalendarOff size={14} style={{ color: "#6EE7A0", opacity: 0.5 }} />
              </div>
              <div className="font-extrabold" style={{ color: "#FFFFFF", fontSize: "26px", lineHeight: "1" }}>2</div>
              <div className="mt-1 flex items-center gap-1" style={{ color: "#6EE7A0", fontSize: "11px", fontWeight: 500 }}><TrendingDown size={12} /> -60% vs fev</div>
            </div>
            {/* 4. Faturamento */}
            <div className="rounded-xl p-3.5" style={{ background: "#252219", border: "1px solid #33301F" }}>
              <div className="flex items-center justify-between mb-1">
                <div className="uppercase" style={{ color: "#9A8E70", fontWeight: 700, letterSpacing: "0.1em", fontSize: "9px" }}>Faturamento do mês</div>
                <TrendingUp size={14} style={{ color: "#6EE7A0", opacity: 0.5 }} />
              </div>
              <div className="font-extrabold" style={{ color: "#FFFFFF", fontSize: "26px", lineHeight: "1" }}>R$4.820</div>
              <div className="mt-1 flex items-center gap-1" style={{ color: "#6EE7A0", fontSize: "11px", fontWeight: 500 }}><TrendingUp size={12} /> +12% · 72% da meta</div>
            </div>
          </div>

          {/* CORE */}
          <div className="grid gap-4" style={{ gridTemplateColumns: "3fr 1fr" }}>
            <div className="p-4" style={card}>
              <div className="flex justify-between items-center mb-3">
                <div style={sTitle}>Próximos atendimentos</div>
                <button style={sLink}>Ver agenda <ChevronRight size={13} /></button>
              </div>
              <div className="flex gap-1.5 mb-3">
                {filters.map((f) => (
                  <button key={f.id} onClick={() => setActiveFilter(f.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all" style={{ background: activeFilter === f.id ? "#D4B86A" : "#1C1A17", color: activeFilter === f.id ? "#1C1A17" : "#9A8E70", border: activeFilter === f.id ? "1px solid #D4B86A" : "1px solid #2A2518", fontSize: "11px", fontWeight: 600 }}>
                    {f.label}<span style={{ background: activeFilter === f.id ? "rgba(0,0,0,0.15)" : "#2A2518", color: activeFilter === f.id ? "#1C1A17" : "#6B5F40", padding: "1px 6px", borderRadius: "8px", fontSize: "10px", fontWeight: 700 }}>{f.count}</span>
                  </button>
                ))}
              </div>
              <div className="grid items-center gap-2 pb-2" style={{ gridTemplateColumns: "30px 46px 1fr 1fr 52px 64px 56px", borderBottom: "1px solid #2E2A1E" }}>
                {["", "Hora", "Paciente", "Serviço", "Protoc.", "Sala", "Prof."].map((h, i) => (<div key={i} className="font-bold" style={{ color: "#6B5F40", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase" }}>{h}</div>))}
              </div>
              {filtered.map((a, i) => {
                const sc = statusConfig[a.status]; const isU = a.status !== "confirmed"; const isH = hoveredRow === i;
                return (
                  <div key={i} onMouseEnter={() => setHoveredRow(i)} onMouseLeave={() => setHoveredRow(null)} className="grid items-center gap-2 relative cursor-pointer" style={{ gridTemplateColumns: "30px 46px 1fr 1fr 52px 64px 56px", paddingTop: "10px", paddingBottom: "10px", borderBottom: i < filtered.length - 1 ? "1px solid #2A2518" : "none", background: isH ? "#2A2518" : "transparent", borderRadius: isH ? "8px" : "0", marginLeft: isH ? "-4px" : "0", marginRight: isH ? "-4px" : "0", paddingLeft: isH ? "4px" : "0", paddingRight: isH ? "4px" : "0" }}>
                    <div className="flex justify-center" style={{ color: sc.color }}>{sc.icon}</div>
                    <div className="font-bold" style={{ color: "#D4B86A", fontSize: "13px" }}>{a.time}</div>
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: isU ? `${sc.color}10` : "#1C1A17", border: isU ? `1px solid ${sc.color}20` : "1px solid #2A2518" }}><span style={{ fontSize: "9px", fontWeight: 800, color: isU ? sc.color : "#9A8E70" }}>{a.initials}</span></div>
                      <span className="font-semibold truncate" style={{ color: isU ? "#D4B86A" : "#FFFFFF", fontSize: "12px" }}>{a.name}</span>
                    </div>
                    <div className="truncate" style={{ color: "#D4C9A8", fontSize: "12px" }}>{a.service}</div>
                    <span className="px-1.5 py-0.5 rounded font-bold text-center" style={{ background: "#1C1A17", border: "1px solid #2A2518", color: "#D4B86A", fontSize: "10px" }}>{a.protocol}</span>
                    <div style={{ color: "#9A8E70", fontSize: "11px" }}>{a.sala}</div>
                    <div style={{ color: "#9A8E70", fontSize: "11px", fontWeight: 600 }}>{a.prof}</div>
                    {isU && isH && (<div className="absolute right-3 top-1/2 -translate-y-1/2 z-10"><button className="flex items-center gap-1 px-2.5 py-1 rounded-lg" style={{ background: "#1C1A17", border: `1px solid ${sc.color}30`, boxShadow: `0 2px 8px ${sc.color}15`, color: sc.color, fontSize: "10px", fontWeight: 700 }}><Send size={10} /> Reenviar</button></div>)}
                  </div>
                );
              })}
              <div className="flex gap-5 mt-3 pt-3" style={{ borderTop: "1px solid #2E2A1E" }}>
                {Object.entries(statusConfig).map(([k, v]) => (<div key={k} className="flex items-center gap-1.5" style={{ color: v.color }}>{v.icon}<span style={{ color: "#9A8E70", fontSize: "10px", fontWeight: 500 }}>{v.label}</span></div>))}
              </div>
            </div>

            {/* LATERAL */}
            <div className="flex flex-col gap-3">
              <div className="p-3.5" style={card}>
                <div style={sTitle} className="mb-2.5">Atividade recente</div>
                {[
                  { time: "08:45", text: "Maria Silva confirmou", icon: <CheckCircle size={11} />, color: "#6EE7A0" },
                  { time: "08:30", text: "RSVP enviado — Ana Costa", icon: <Send size={11} />, color: "#7CB3F0" },
                  { time: "08:15", text: "Protocolo #47 criado", icon: <FileText size={11} />, color: "#D4B86A" },
                  { time: "07:50", text: "Julia Ramos cancelou 09:30", icon: <XCircle size={11} />, color: "#F07070" },
                  { time: "07:30", text: "Carla Melo confirmou", icon: <CheckCircle size={11} />, color: "#6EE7A0" },
                  { time: "07:10", text: "Paula Nunes — RSVP enviado", icon: <Send size={11} />, color: "#7CB3F0" },
                ].map((a, i) => (
                  <div key={i} className="flex items-start gap-2 py-1.5" style={{ borderBottom: i < 5 ? "1px solid #2A2518" : "none" }}>
                    <div className="rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${a.color}10`, color: a.color, width: "18px", height: "18px" }}>{a.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="truncate" style={{ color: a.color === "#F07070" ? "#F07070" : "#FFFFFF", fontSize: "11px", fontWeight: a.color === "#F07070" ? 600 : 500 }}>{a.text}</div>
                      <div style={{ color: "#6B5F40", fontSize: "9px" }}>{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3.5 flex-1" style={card}>
                <div style={sTitle} className="mb-2.5">Serviços mais realizados</div>
                {[{ name: "Drenagem Linfática", pct: 42 }, { name: "Criolipólise", pct: 31 }, { name: "Massagem Modelad.", pct: 20 }, { name: "Outros", pct: 7 }].map((s, i) => (
                  <div key={i} className="mb-2 last:mb-0">
                    <div className="flex justify-between items-baseline mb-1"><span style={{ color: "#FFFFFF", fontWeight: 600, fontSize: "11px" }}>{s.name}</span><span className="font-bold" style={{ color: "#D4B86A", fontSize: "11px" }}>{s.pct}%</span></div>
                    <div className="rounded-full overflow-hidden" style={{ height: "4px", background: "#1C1A17" }}><div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: i === 0 ? "linear-gradient(90deg, #B8960C, #D4B86A)" : i === 1 ? "linear-gradient(90deg, #9A7C10, #C4A43A)" : i === 2 ? "linear-gradient(90deg, #7A6210, #A8900E)" : "linear-gradient(90deg, #5A4810, #7A6210)" }} /></div>
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
