import type { Metadata } from "next";
import { Urbanist, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/ThemeProvider";

const urbanist = Urbanist({
    subsets: ["latin"],
    variable: "--font-urbanist",
    weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const playfair = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-playfair",
    weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
    title: "Estetiqo CRM",
    description: "Gestão premium para clínicas de estética",
    icons: {
        icon: "/favicon.png",
        apple: "/favicon.png",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR" suppressHydrationWarning>
            <body className={`${urbanist.variable} ${playfair.variable} antialiased`}>
                <ThemeProvider>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
