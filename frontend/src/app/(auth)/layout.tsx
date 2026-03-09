export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div
            className="min-h-screen flex items-center justify-center"
            style={{ background: "#161412", fontFamily: "var(--font-urbanist), sans-serif" }}
        >
            {children}
        </div>
    )
}
