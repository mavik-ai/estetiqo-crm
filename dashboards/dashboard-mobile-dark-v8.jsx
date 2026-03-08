import { useState, useEffect } from "react";
import { Home, Calendar, Users, FileText, Settings, Bell, Plus, AlertCircle, ClipboardList, X, ChevronRight, TrendingUp, TrendingDown, CheckCircle, Clock, AlertTriangle, XCircle, Send, CalendarOff, CalendarClock } from "lucide-react";

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
};

const notifications = [
  { icon: <AlertCircle size={12} />, text: "2 clientes não confirmaram", action: "Ver →", color: "#F0C040" },
  { icon: <ClipboardList size={12} />, text: "1 protocolo vence esta semana", action: "Ver →", color: "#7CB3F0" },
  { icon: <X size={12} />, text: "Julia Ramos cancelou às 09:30", action: "Ver →", color: "#F07070" },
];

const appointments = [
  { time: "08:30", name: "Maria Silva", initials: "MS", service: "Drenagem Linf.", protocol: "6/10", prof: "Ana Paula", status: "confirmed" },
  { time: "09:00", name: "Ana Costa", initials: "AC", service: "Criolipólise", protocol: "3/8", prof: "Michele", status: "pending" },
  { time: "10:00", name: "Julia Ramos", initials: "JR", service: "Laser Corporal", protocol: "2/6", prof: "Ana Paula", status: "noresponse" },
  { time: "11:00", name: "Carla Melo", initials: "CM", service: "Massagem Mod.", protocol: "1/4", prof: "Michele", status: "confirmed" },
];

const statusConfig = {
  confirmed: { color: "#6EE7A0", icon: <CheckCircle size={14} /> },
  pending: { color: "#7CB3F0", icon: <Clock size={14} /> },
  noresponse: { color: "#F0C040", icon: <AlertTriangle size={14} /> },
  cancelled: { color: "#F07070", icon: <XCircle size={14} /> },
};

export default function DashboardMobileDarkV8() {
  const [activeNav, setActiveNav] = useState("home");
  const [activeNotif, setActiveNotif] = useState(0);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    const timer = setInterval(() => { setActiveNotif((prev) => (prev + 1) % notifications.length); }, 4000);
    return () => clearInterval(timer);
  }, []);

  const filtered = activeFilter === "all" ? appointments : appointments.filter(a => a.status === activeFilter);
  const filters = [
    { id: "all", label: "Todos", count: appointments.length },
    { id: "confirmed", label: "Confirmados", count: 2 },
    { id: "pending", label: "Pendentes", count: 1 },
    { id: "noresponse", label: "S/ resposta", count: 1 },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center py-10" style={{ fontFamily: "'Urbanist', sans-serif", background: "linear-gradient(160deg, #121110 0%, #1A1816 40%, #121110 100%)" }}>
      <link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div className="relative" style={{ width: "393px", height: "852px" }}>
        <div className="absolute inset-0 rounded-[55px] overflow-hidden" style={{ background: "linear-gradient(145deg, #2A2A2A, #1A1A1A)", boxShadow: "0 50px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset, 0 0 80px rgba(212,184,106,0.06)" }}>
          <div className="absolute rounded-[48px] overflow-hidden" style={{ top: "6px", left: "6px", right: "6px", bottom: "6px", background: "#1C1A17" }}>

            {/* Status Bar */}
            <div className="flex justify-between items-center px-8 pt-3 pb-1">
              <div className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>9:41</div>
              <div className="absolute left-1/2 transform -translate-x-1/2 top-3" style={{ width: "126px", height: "37px", background: "#000", borderRadius: "20px" }} />
              <div className="flex items-center gap-1.5">
                <svg width="16" height="12" viewBox="0 0 16 12" fill="#D4C9A8"><rect x="0" y="3" width="3" height="9" rx="1" opacity="0.3"/><rect x="4.5" y="2" width="3" height="10" rx="1" opacity="0.5"/><rect x="9" y="1" width="3" height="11" rx="1" opacity="0.7"/><rect x="13.5" y="0" width="3" height="12" rx="1"/></svg>
                <div className="relative" style={{ width: "25px", height: "12px" }}><div className="absolute inset-0 rounded-sm border" style={{ borderColor: "#D4C9A8", opacity: 0.35 }} /><div className="absolute top-0.5 left-0.5 bottom-0.5 rounded-sm" style={{ width: "18px", background: "#D4B86A" }} /></div>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-auto px-5 pt-2 pb-4" style={{ height: "calc(100% - 100px)", background: "linear-gradient(180deg, #1C1A17 0%, #1E1C18 100%)" }}>

              {/* Header */}
              <div className="flex justify-between items-start mb-4 mt-2">
                <div>
                  <div className="text-xs tracking-widest uppercase" style={{ color: "#D4B86A", fontWeight: 700, letterSpacing: "0.15em" }}>Estetiqo</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, color: "#FFFFFF", fontSize: "20px", lineHeight: "1.2" }}>{getGreeting()}, Michele</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#D4B86A" }} />
                    <div className="text-xs" style={{ color: "#9A8E70", fontWeight: 500 }}>Segunda, 09 Mar 2026</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#252219", border: "1px solid #33301F" }}>
                    <Bell size={17} style={{ color: "#D4B86A" }} />
                    <div className="absolute -top-0.5 -right-0.5 rounded-full flex items-center justify-center" style={{ background: "#EF4444", width: "16px", height: "16px", boxShadow: "0 2px 6px rgba(239,68,68,0.5)" }}><span className="text-white font-bold" style={{ fontSize: "9px" }}>3</span></div>
                  </div>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "linear-gradient(135deg, #D4B86A, #B8960C)", color: "#1C1A17" }}>MO</div>
                </div>
              </div>

              {/* Notification */}
              <div className="mb-4">
                <div className="rounded-xl px-3 py-2.5 flex items-center gap-2.5 relative overflow-hidden" style={{ background: "#252219", border: `1px solid ${notifications[activeNotif].color}18` }}>
                  <div className="absolute top-0 left-0 bottom-0 w-0.5" style={{ background: notifications[activeNotif].color }} />
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${notifications[activeNotif].color}12`, color: notifications[activeNotif].color }}>{notifications[activeNotif].icon}</div>
                  <div className="flex-1 min-w-0"><div style={{ color: "#FFFFFF", fontSize: "12px", fontWeight: 500 }}>{notifications[activeNotif].text}</div></div>
                  <button className="flex-shrink-0" style={{ color: notifications[activeNotif].color, fontSize: "10px", fontWeight: 700 }}>{notifications[activeNotif].action}</button>
                </div>
                <div className="flex justify-center gap-1 mt-2">
                  {notifications.map((_, i) => (<button key={i} onClick={() => setActiveNotif(i)} className="rounded-full transition-all" style={{ width: activeNotif === i ? "12px" : "4px", height: "4px", background: activeNotif === i ? "#D4B86A" : "#33301F" }} />))}
                </div>
              </div>

              {/* Metrics 2x2 */}
              <div className="grid grid-cols-2 gap-2.5 mb-4">
                <div className="rounded-xl p-3 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #C4A43A, #9A7C10)", boxShadow: "0 4px 15px rgba(196,164,58,0.2)" }}>
                  <div className="absolute top-0 right-0 w-16 h-16 rounded-full" style={{ background: "rgba(255,255,255,0.08)", transform: "translate(40%, -40%)" }} />
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="uppercase" style={{ color: "rgba(255,255,255,0.7)", fontWeight: 700, letterSpacing: "0.1em", fontSize: "8px" }}>Atendimentos</div>
                    <Calendar size={12} style={{ color: "rgba(255,255,255,0.4)" }} />
                  </div>
                  <div className="font-extrabold" style={{ color: "#FFF", fontSize: "24px", lineHeight: "1" }}>12</div>
                  <div className="mt-0.5" style={{ color: "rgba(255,255,255,0.6)", fontSize: "10px", fontWeight: 500 }}>3 restantes</div>
                </div>
                <div className="rounded-xl p-3" style={{ background: "#252219", border: "1px solid #33301F" }}>
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="uppercase" style={{ color: "#9A8E70", fontWeight: 700, letterSpacing: "0.1em", fontSize: "8px" }}>Horários vagos</div>
                    <CalendarClock size={12} style={{ color: "#F0C040", opacity: 0.5 }} />
                  </div>
                  <div className="font-extrabold" style={{ color: "#FFFFFF", fontSize: "24px", lineHeight: "1" }}>3</div>
                  <div className="mt-0.5" style={{ color: "#9A8E70", fontSize: "10px", fontWeight: 500 }}>próximo: 13:00</div>
                </div>
                <div className="rounded-xl p-3" style={{ background: "#252219", border: "1px solid #33301F" }}>
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="uppercase" style={{ color: "#9A8E70", fontWeight: 700, letterSpacing: "0.1em", fontSize: "8px" }}>No-shows</div>
                    <CalendarOff size={12} style={{ color: "#6EE7A0", opacity: 0.5 }} />
                  </div>
                  <div className="font-extrabold" style={{ color: "#FFFFFF", fontSize: "24px", lineHeight: "1" }}>2</div>
                  <div className="mt-0.5 flex items-center gap-1" style={{ color: "#6EE7A0", fontSize: "10px", fontWeight: 500 }}><TrendingDown size={10} /> -60% vs fev</div>
                </div>
                <div className="rounded-xl p-3" style={{ background: "#252219", border: "1px solid #33301F" }}>
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="uppercase" style={{ color: "#9A8E70", fontWeight: 700, letterSpacing: "0.1em", fontSize: "8px" }}>Faturamento</div>
                    <TrendingUp size={12} style={{ color: "#6EE7A0", opacity: 0.5 }} />
                  </div>
                  <div className="font-extrabold" style={{ color: "#FFFFFF", fontSize: "20px", lineHeight: "1" }}>R$4.820</div>
                  <div className="mt-0.5 flex items-center gap-1" style={{ color: "#6EE7A0", fontSize: "10px", fontWeight: 500 }}><TrendingUp size={10} /> +12% · 72% meta</div>
                </div>
              </div>

              {/* Próximos Atendimentos */}
              <div className="rounded-xl p-3.5 mb-4" style={{ background: "#252219", border: "1px solid #33301F" }}>
                <div className="flex justify-between items-center mb-2.5">
                  <div className="uppercase" style={{ color: "#9A8E70", fontWeight: 700, letterSpacing: "0.12em", fontSize: "9px" }}>Próximos atendimentos</div>
                  <div className="flex items-center gap-0.5" style={{ color: "#D4B86A", fontWeight: 600, fontSize: "10px" }}>Ver todos <ChevronRight size={12} /></div>
                </div>
                <div className="flex gap-1 mb-2.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                  {filters.map((f) => (
                    <button key={f.id} onClick={() => setActiveFilter(f.id)} className="flex items-center gap-1 px-2.5 py-1 rounded-md flex-shrink-0" style={{
                      background: activeFilter === f.id ? "#D4B86A" : "#1C1A17",
                      color: activeFilter === f.id ? "#1C1A17" : "#9A8E70",
                      border: activeFilter === f.id ? "1px solid #D4B86A" : "1px solid #2A2518",
                      fontSize: "10px", fontWeight: 600
                    }}>
                      {f.label}<span style={{ background: activeFilter === f.id ? "rgba(0,0,0,0.15)" : "#2A2518", color: activeFilter === f.id ? "#1C1A17" : "#6B5F40", padding: "0px 4px", borderRadius: "6px", fontSize: "9px", fontWeight: 700 }}>{f.count}</span>
                    </button>
                  ))}
                </div>
                {filtered.map((a, i) => {
                  const sc = statusConfig[a.status];
                  const isU = a.status !== "confirmed";
                  return (
                    <div key={i} className="flex items-center gap-2.5 py-2.5" style={{ borderBottom: i < filtered.length - 1 ? "1px solid #2A2518" : "none" }}>
                      <div style={{ color: sc.color }} className="flex-shrink-0">{sc.icon}</div>
                      <div className="font-bold flex-shrink-0" style={{ color: "#D4B86A", fontSize: "13px", width: "38px" }}>{a.time}</div>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: isU ? `${sc.color}10` : "#1C1A17", border: isU ? `1px solid ${sc.color}20` : "1px solid #2A2518" }}>
                        <span style={{ fontSize: "8px", fontWeight: 800, color: isU ? sc.color : "#9A8E70" }}>{a.initials}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold truncate" style={{ color: isU ? "#D4B86A" : "#FFFFFF", fontSize: "12px" }}>{a.name}</span>
                          <span className="px-1 py-0 rounded font-bold flex-shrink-0" style={{ background: "#1C1A17", border: "1px solid #2A2518", color: "#D4B86A", fontSize: "9px" }}>{a.protocol}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="truncate" style={{ color: "#D4C9A8", fontSize: "10px" }}>{a.service}</span>
                          <span style={{ color: "#33301F" }}>·</span>
                          <span style={{ color: "#9A8E70", fontSize: "10px", fontWeight: 600 }}>{a.prof}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div className="flex gap-3 mt-2.5 pt-2.5" style={{ borderTop: "1px solid #2A2518" }}>
                  {[{ icon: <CheckCircle size={10} />, color: "#6EE7A0", l: "OK" }, { icon: <Clock size={10} />, color: "#7CB3F0", l: "Pend." }, { icon: <AlertTriangle size={10} />, color: "#F0C040", l: "S/ resp." }, { icon: <XCircle size={10} />, color: "#F07070", l: "Canc." }].map((s, i) => (
                    <div key={i} className="flex items-center gap-1" style={{ color: s.color }}>{s.icon}<span style={{ color: "#9A8E70", fontSize: "9px", fontWeight: 500 }}>{s.l}</span></div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex justify-around items-center mb-2 px-2">
                {[
                  { icon: <Plus size={20} strokeWidth={2} />, label: "Agendar" },
                  { icon: <Users size={20} strokeWidth={1.8} />, label: "Cliente" },
                  { icon: <FileText size={20} strokeWidth={1.8} />, label: "Protocolo" },
                  { icon: <Send size={20} strokeWidth={1.8} />, label: "RSVP" },
                ].map((a, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 cursor-pointer">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #2A2518, #252015)", border: "1px solid #3D3520", color: "#D4B86A" }}>{a.icon}</div>
                    <span style={{ color: "#9A8E70", fontSize: "9px", fontWeight: 600 }}>{a.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Nav */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-around px-4" style={{ height: "80px", paddingBottom: "20px", background: "linear-gradient(180deg, #201E1A, #1C1A17)", borderTop: "1px solid #2E2A1E" }}>
              {[
                { icon: <Home size={21} />, label: "Home", id: "home" },
                { icon: <Calendar size={21} />, label: "Agenda", id: "agenda" },
                { icon: <Users size={21} />, label: "Clientes", id: "clientes" },
                { icon: <FileText size={21} />, label: "Protocolos", id: "protocolos" },
                { icon: <Settings size={21} />, label: "Config", id: "config" },
              ].map((nav) => (
                <button key={nav.id} onClick={() => setActiveNav(nav.id)} className="flex flex-col items-center gap-0.5" style={{ color: activeNav === nav.id ? "#D4B86A" : "#5A5030" }}>
                  <div style={{ opacity: activeNav === nav.id ? 1 : 0.5, filter: activeNav === nav.id ? "drop-shadow(0 0 6px rgba(212,184,106,0.25))" : "none" }}>{nav.icon}</div>
                  <div style={{ fontWeight: activeNav === nav.id ? 700 : 500, fontSize: "9px" }}>{nav.label}</div>
                  {activeNav === nav.id && <div className="rounded-full" style={{ width: "14px", height: "2.5px", background: "linear-gradient(90deg, #D4B86A, #B8960C)", marginTop: "-1px", boxShadow: "0 0 6px rgba(212,184,106,0.4)" }} />}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute right-0 top-28 w-1 h-16 rounded-l-sm" style={{ background: "#333", transform: "translateX(1px)" }} />
        <div className="absolute left-0 top-24 w-1 h-8 rounded-r-sm" style={{ background: "#333", transform: "translateX(-1px)" }} />
        <div className="absolute left-0 top-36 w-1 h-12 rounded-r-sm" style={{ background: "#333", transform: "translateX(-1px)" }} />
        <div className="absolute left-0 top-52 w-1 h-12 rounded-r-sm" style={{ background: "#333", transform: "translateX(-1px)" }} />
      </div>
    </div>
  );
}
