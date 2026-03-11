'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, Smartphone, CheckCircle, RefreshCw, LogOut, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Usaremos as Server Actions criadas para encapsular a lógica de requests pro backend
import {
  criarInstanciaWhatsapp,
  consultarStatusWhatsapp,
  desconectarWhatsapp
} from './actions';

export default function WhatsAppConfigPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'disconnected' | 'pending' | 'connected'>('loading');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [phone, setPhone] = useState<string>('');
  const [activePhone, setActivePhone] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Busca o status inicial
  useEffect(() => {
    fetchStatus();
  }, []);

  // Polling a cada 5 segundos quando o status é "pending" (esperando scan do QR Code)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'pending') {
      interval = setInterval(() => {
        fetchStatus();
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const fetchStatus = async () => {
    try {
      const res = await consultarStatusWhatsapp();
      if (res.error) {
        setErrorMsg(res.error);
        setStatus('disconnected');
        return;
      }
      
      setStatus(res.status);
      if (res.phone) {
        setActivePhone(res.phone);
      }
      
      // Se estava em pending e de repente conectou
      if (status === 'pending' && res.status === 'connected') {
        setQrCode(null);
      }
    } catch (err) {
      console.error(err);
      setStatus('disconnected');
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('phone', phone);

    const data = await criarInstanciaWhatsapp(formData);

    if (data.error) {
      setErrorMsg(data.error);
    } else {
      if (data.qrcode) {
        setQrCode(data.qrcode);
      }
      setStatus('pending');
      setActivePhone(phone);
    }

    setIsSubmitting(false);
  };

  const handleDisconnect = async () => {
    if (!window.confirm("Certeza que deseja desconectar este número? Seus envios automáticos irão parar.")) {
      return;
    }

    setIsSubmitting(true);
    const data = await desconectarWhatsapp();
    
    if (data.error) {
      setErrorMsg(data.error);
    } else {
      setStatus('disconnected');
      setQrCode(null);
      setPhone('');
      setActivePhone('');
    }
    setIsSubmitting(false);
  };

  return (
    <div style={{ background: "var(--background)", minHeight: "100%", padding: "28px 24px" }}>
      <div style={{ maxWidth: "740px" }}>
        
        {/* Breadcrumb e Título */}
        <div style={{ marginBottom: "28px" }}>
          <Link 
            href="/config" 
            style={{ 
              display: "inline-flex", alignItems: "center", gap: "6px",
              color: "var(--muted-foreground)", textDecoration: "none",
              fontSize: "13px", fontWeight: 500, marginBottom: "16px",
              transition: "color 0.2s"
            }}
          >
            <ArrowLeft size={16} /> Voltar para Configurações
          </Link>
          
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "22px",
            fontWeight: 700,
            color: "var(--foreground)",
            margin: 0,
            display: "flex", alignItems: "center", gap: "10px"
          }}>
             <Smartphone size={24} color="#B8960C" /> Conexão do WhatsApp
          </h1>
          <p style={{ color: "var(--muted-foreground)", fontSize: "14px", marginTop: "4px" }}>
            Vincule o número da clínica para habilitar os disparos automáticos de lembretes e RSVP.
          </p>
        </div>

        {errorMsg && (
          <div style={{
            background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)",
            color: "#EF4444", padding: "12px 16px", borderRadius: "8px",
            fontSize: "14px", marginBottom: "20px"
          }}>
            {errorMsg}
          </div>
        )}

        {/* LOADING STATE */}
        {status === 'loading' && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
            <RefreshCw size={28} color="#B8960C" className="animate-spin" />
            <p style={{ marginTop: "16px", color: "var(--muted-foreground)", fontSize: "14px" }}>
              Verificando status da conexão...
            </p>
          </div>
        )}

        {/* STATE 1: DISCONNECTED */}
        {status === 'disconnected' && (
          <div style={{
            background: "var(--card)", border: "1px solid var(--border)", borderRadius: "16px",
            padding: "32px", maxWidth: "480px"
          }}>
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--foreground)", margin: "0 0 8px" }}>
              Iniciar Conexão
            </h3>
            <p style={{ fontSize: "14px", color: "var(--muted-foreground)", margin: "0 0 24px", lineHeight: "1.5" }}>
              Insira o número de WhatsApp que você deseja utilizar para enviar as mensagens. Na próxima tela, você lerá um QR Code com este mesmo aparelho.
            </p>

            <form onSubmit={handleConnect}>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--foreground)", marginBottom: "8px" }}>
                  Número do WhatsApp (+55 Brasil)
                </label>
                <div style={{ display: "flex", position: "relative" }}>
                  <span style={{ 
                    position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", 
                    color: "var(--muted-foreground)", fontSize: "14px", fontWeight: 500 
                  }}>
                    +55
                  </span>
                  <input
                    type="tel"
                    placeholder="11 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    disabled={isSubmitting}
                    style={{
                      width: "100%", padding: "12px 12px 12px 42px", borderRadius: "8px",
                      border: "1px solid var(--border)", background: "var(--background)",
                      color: "var(--foreground)", fontSize: "15px", outline: "none",
                      transition: "border-color 0.2s"
                    }}
                    required
                  />
                </div>
                <span style={{ fontSize: "12px", color: "var(--muted-foreground)", display: "block", marginTop: "6px" }}>
                  Apenas números (DDD + Telefone). Ex: 11988887777
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || phone.length < 10}
                style={{
                  background: isSubmitting ? "var(--muted)" : "#B8960C",
                  color: isSubmitting ? "var(--muted-foreground)" : "#FFFFFF",
                  border: "none", borderRadius: "8px", padding: "12px 24px",
                  fontSize: "14px", fontWeight: 600, cursor: isSubmitting ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  width: "100%", transition: "all 0.2s"
                }}
              >
                {isSubmitting ? <RefreshCw size={16} className="animate-spin" /> : <QrCode size={16} />}
                {isSubmitting ? "Gerando QR Code..." : "Gerar QR Code de Conexão"}
              </button>
            </form>
          </div>
        )}

        {/* STATE 2: PENDING (QR CODE) */}
        {status === 'pending' && (
          <div style={{
            background: "var(--card)", border: "1px solid var(--border)", borderRadius: "16px",
            padding: "40px", maxWidth: "480px", textAlign: "center"
          }}>
            <h3 style={{ fontSize: "18px", fontWeight: 600, color: "var(--foreground)", margin: "0 0 8px" }}>
              Leia o QR Code
            </h3>
            <p style={{ fontSize: "14px", color: "var(--muted-foreground)", margin: "0 0 24px", lineHeight: "1.5" }}>
              Abra o WhatsApp no aparelho <strong>{activePhone}</strong>, vá em "Aparelhos Conectados" e aponte a câmera para a imagem abaixo.
            </p>

            <div style={{
              background: "#FFF", padding: "16px", borderRadius: "12px", display: "inline-block",
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)", marginBottom: "24px"
            }}>
              {qrCode ? (
                <img src={qrCode} alt="WhatsApp QR Code" style={{ width: "240px", height: "240px", display: "block" }} />
              ) : (
                <div style={{ width: "240px", height: "240px", display: "flex", alignItems: "center", justifyContent: "center", background: "#F9FAFB" }}>
                  <RefreshCw size={24} color="#CBD5E1" className="animate-spin" />
                </div>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "var(--muted-foreground)", fontSize: "13px" }}>
              <RefreshCw size={14} className="animate-spin" />
              Aguardando leitura do código...
            </div>
          </div>
        )}

        {/* STATE 3: CONNECTED */}
        {status === 'connected' && (
          <div style={{
            background: "var(--card)", border: "1px solid var(--border)", borderRadius: "16px",
            padding: "32px", maxWidth: "480px"
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "24px" }}>
              <div style={{
                width: "48px", height: "48px", borderRadius: "12px", background: "rgba(45, 140, 78, 0.1)",
                display: "flex", alignItems: "center", justifyContent: "center", color: "#2D8C4E", flexShrink: 0
              }}>
                <CheckCircle size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 600, color: "var(--foreground)", margin: "0 0 4px" }}>
                  WhatsApp Conectado
                </h3>
                <p style={{ fontSize: "14px", color: "var(--muted-foreground)", margin: 0 }}>
                  A clínica está pronta para enviar lembretes.
                </p>
              </div>
            </div>

            <div style={{
              background: "var(--background)", border: "1px solid var(--border)", borderRadius: "8px",
              padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: "32px"
            }}>
              <div>
                <span style={{ display: "block", fontSize: "12px", color: "var(--muted-foreground)", marginBottom: "4px" }}>
                  Número Vinculado
                </span>
                <span style={{ fontSize: "16px", fontWeight: 600, color: "var(--foreground)" }}>
                  +{activePhone}
                </span>
              </div>
              <div style={{
                padding: "6px 12px", background: "rgba(45, 140, 78, 0.1)", color: "#2D8C4E",
                fontSize: "12px", fontWeight: 600, borderRadius: "20px", display: "flex", alignItems: "center", gap: "6px"
              }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#2D8C4E", display: "inline-block" }}></span>
                Online
              </div>
            </div>

            <button
              onClick={handleDisconnect}
              disabled={isSubmitting}
              style={{
                background: "transparent", color: "#EF4444",
                border: "1px solid #EF4444", borderRadius: "8px", padding: "12px 24px",
                fontSize: "14px", fontWeight: 600, cursor: isSubmitting ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                width: "100%", transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.background = "rgba(239, 68, 68, 0.05)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              {isSubmitting ? <RefreshCw size={16} className="animate-spin" /> : <LogOut size={16} />}
              {isSubmitting ? "Desconectando..." : "Desconectar WhatsApp"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
