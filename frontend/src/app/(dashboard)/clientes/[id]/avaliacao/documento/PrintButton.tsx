'use client'

import { Printer } from "lucide-react";

export default function PrintButton() {
    return (
        <button
            onClick={() => window.print()}
            style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "8px 16px", borderRadius: "9px",
                background: "linear-gradient(135deg, #D4B86A, #B8960C)",
                border: "none", color: "#161412",
                fontSize: "12px", fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
            }}
        >
            <Printer size={13} strokeWidth={2} />
            Imprimir / Salvar PDF
        </button>
    );
}
