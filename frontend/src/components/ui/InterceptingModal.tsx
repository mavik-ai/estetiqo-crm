"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

export function InterceptingModal({ children, size = "default" }: { children: React.ReactNode, size?: "default" | "centralized" | "oversize" }) {
    const router = useRouter();
    const dialogRef = useRef<HTMLDialogElement>(null);

    // Using useEffect to show modal after mount
    useEffect(() => {
        if (!dialogRef.current?.open) {
            dialogRef.current?.showModal();
        }
    }, []);

    function onDismiss() {
        if (dialogRef.current?.open) {
            dialogRef.current.close();
        }
        router.back();
    }

    const sizeClasses = size === "oversize" 
        ? "w-[95vw] max-w-[1400px] h-[100vh] rounded-none" 
        : size === "centralized" 
            ? "max-w-[600px] w-[95%] rounded-[18px]" 
            : "max-w-[800px] w-[95%] rounded-[18px]";

    const heightClasses = size === "oversize" ? "max-h-[100vh]" : "max-h-[90vh]";

    return (
        <>
            <dialog
                ref={dialogRef}
                className={`backdrop:bg-black/50 overflow-hidden ${sizeClasses} bg-background border border-border shadow-2xl p-0 m-auto backdrop:backdrop-blur-sm relative`}
                onClose={onDismiss}
                onClick={(e) => {
                    // Close if clicking outside the dialog content box
                    const target = e.target as HTMLElement;
                    if (target.nodeName === 'DIALOG') {
                        onDismiss();
                    }
                }}
                style={{
                    maxHeight: size === "oversize" ? "100vh" : "90vh",
                    opacity: 0,
                    animation: "modalFadeIn 0.2s ease-out forwards",
                }}
            >
                <div className={`relative bg-background w-full h-full ${heightClasses} overflow-y-auto`}>
                    <div className="sticky top-0 right-0 left-0 w-full flex justify-end p-4 pointer-events-none z-50">
                        <button
                            onClick={onDismiss}
                            className="pointer-events-auto w-8 h-8 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-neutral-200 hover:text-foreground transition-colors shadow-sm"
                            aria-label="Fechar"
                        >
                            <X size={18} strokeWidth={2} />
                        </button>
                    </div>
                    {/* The content wrapped inside */}
                    <div className={size === "oversize" ? "" : "-mt-[64px]"}>
                        {children}
                    </div>
                </div>
            </dialog>
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes modalFadeIn {
                    from { opacity: 0; transform: scale(0.98) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                dialog::backdrop {
                    background: rgba(0, 0, 0, 0.4);
                    backdrop-filter: blur(2px);
                    animation: backdropFadeIn 0.2s ease-out forwards;
                }
                @keyframes backdropFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}} />
        </>
    );
}
