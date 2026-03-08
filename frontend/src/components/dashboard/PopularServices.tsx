'use client'

export function PopularServices() {
    const services = [
        { name: "Drenagem Linfática", pct: 42 },
        { name: "Criolipólise", pct: 31 },
        { name: "Massagem Modelad.", pct: 20 },
        { name: "Outros", pct: 7 }
    ];

    const card = { background: "#FFFFFF", border: "1px solid #EDE5D3", borderRadius: "14px" };
    const sTitle = { color: "#A69060", fontWeight: 700, letterSpacing: "0.12em", fontSize: "10px", textTransform: "uppercase" as const };

    return (
        <div className="p-3.5 flex-1" style={card}>
            <div style={sTitle} className="mb-2.5">Serviços mais realizados</div>
            {services.map((s, i) => (
                <div key={i} className="mb-2 last:mb-0">
                    <div className="flex justify-between items-baseline mb-1">
                        <span style={{ color: "#2D2319", fontWeight: 600, fontSize: "11px" }}>{s.name}</span>
                        <span className="font-bold" style={{ color: "#B8960C", fontSize: "11px" }}>{s.pct}%</span>
                    </div>
                    <div className="rounded-full overflow-hidden" style={{ height: "4px", background: "#F5EDE0" }}>
                        <div className="h-full rounded-full"
                            style={{
                                width: `${s.pct}%`,
                                background: i === 0 ? "linear-gradient(90deg, #B8960C, #D4B86A)" :
                                    i === 1 ? "linear-gradient(90deg, #C9A83E, #E0CB7A)" :
                                        i === 2 ? "linear-gradient(90deg, #D4C08A, #E8DDB0)" :
                                            "#E8DDB0"
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
