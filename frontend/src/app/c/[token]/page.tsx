import { createClient } from '@/utils/supabase/server';
import { CheckCircle2, XCircle, Clock, MapPin, Sparkles, Calendar } from 'lucide-react';
import { confirmarRSVP, cancelarRSVP } from './actions';

interface Props {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ action?: string }>;
}

export default async function RSVPPublicPage({ params, searchParams }: Props) {
  const { token } = await params;
  const { action } = await searchParams;
  const supabase = await createClient();

  // Busca dados do agendamento (acesso anônimo via rsvp_token — ver RLS migration)
  const { data: appt } = await supabase
    .from('appointments')
    .select(`
      id,
      starts_at,
      rsvp_status,
      client_id,
      service_id,
      room_id,
      tenant_id
    `)
    .eq('rsvp_token', token)
    .single();

  if (!appt) {
    return <ErroPage />;
  }

  // Busca dados relacionados em paralelo
  const [clientRes, serviceRes, roomRes, tenantRes] = await Promise.all([
    supabase.from('clients').select('name').eq('id', appt.client_id).single(),
    supabase.from('services').select('name, preparation_notes').eq('id', appt.service_id).single(),
    appt.room_id ? supabase.from('rooms').select('name').eq('id', appt.room_id).single() : Promise.resolve({ data: null }),
    supabase.from('tenants').select('name, phone').eq('id', appt.tenant_id).single(),
  ]);

  const clientName  = clientRes.data?.name ?? 'Paciente';
  const serviceName = serviceRes.data?.name ?? 'Serviço';
  const prepNotes   = serviceRes.data?.preparation_notes ?? null;
  const roomName    = roomRes.data?.name ?? null;
  const clinicName  = tenantRes.data?.name ?? 'Clínica';
  const clinicPhone = tenantRes.data?.phone ?? null;

  const dateStr = new Date(appt.starts_at).toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  });
  const timeStr = new Date(appt.starts_at).toLocaleTimeString('pt-BR', {
    hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  });

  // Estados finais (já respondeu ou ação atual)
  const jaConfirmado = appt.rsvp_status === 'confirmed' || action === 'confirmed';
  const jaCancelado  = appt.rsvp_status === 'cancelled'  || action === 'cancelled';

  const confirmarComToken = confirmarRSVP.bind(null, token);
  const cancelarComToken  = cancelarRSVP.bind(null, token);

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'linear-gradient(160deg, #FBF5EA 0%, #F0E6CC 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        fontFamily: "'Urbanist', sans-serif",
      }}
    >
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* ====== CONFIRMADO ====== */}
        {jaConfirmado && (
          <>
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                boxShadow: '0 8px 40px rgba(45,140,78,0.12)',
                overflow: 'hidden',
              }}
            >
              <div style={{ background: 'linear-gradient(135deg, #4CAF82, #2D8C4E)', padding: '28px 24px', textAlign: 'center' }}>
                <CheckCircle2 size={48} strokeWidth={1.5} color="rgba(255,255,255,0.95)" style={{ marginBottom: '12px' }} />
                <h2 style={{ fontFamily: "'Playfair Display', serif", color: '#FFFFFF', fontSize: '22px', fontWeight: 700, margin: '0 0 6px' }}>
                  Presença confirmada!
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', margin: 0 }}>
                  Te esperamos às {timeStr} 💛
                </p>
              </div>

              <div style={{ padding: '24px' }}>
                <div
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    background: '#F6FBF8',
                    border: '1px solid #D4EDC4',
                    marginBottom: prepNotes ? '20px' : '0',
                    textAlign: 'center',
                  }}
                >
                  <p style={{ fontSize: '14px', color: '#2D8C4E', margin: 0, fontWeight: 600, textTransform: 'capitalize' }}>{serviceName}</p>
                  <p style={{ fontSize: '13px', color: '#5A7A5A', margin: '2px 0 0', textTransform: 'capitalize' }}>{dateStr}</p>
                </div>

                {prepNotes && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                      <Sparkles size={14} strokeWidth={1.5} color="#B8960C" />
                      <p style={{ fontSize: '13px', fontWeight: 700, color: '#2D2319', margin: 0 }}>
                        Dicas para aproveitar ao máximo
                      </p>
                    </div>
                    <div
                      style={{
                        background: 'linear-gradient(135deg, #FBF5EA, #F3E8CC)',
                        border: '1px solid rgba(184,150,12,0.2)',
                        borderRadius: '14px',
                        padding: '16px',
                      }}
                    >
                      <p style={{ fontSize: '14px', color: '#5C4A1E', margin: 0, lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                        {prepNotes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Footer clinicName={clinicName} clinicPhone={clinicPhone} />
          </>
        )}

        {/* ====== CANCELADO ====== */}
        {jaCancelado && (
          <>
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
                overflow: 'hidden',
              }}
            >
              <div style={{ background: 'linear-gradient(135deg, #E88080, #D94444)', padding: '28px 24px', textAlign: 'center' }}>
                <XCircle size={48} strokeWidth={1.5} color="rgba(255,255,255,0.95)" style={{ marginBottom: '12px' }} />
                <h2 style={{ fontFamily: "'Playfair Display', serif", color: '#FFFFFF', fontSize: '22px', fontWeight: 700, margin: '0 0 6px' }}>
                  Entendemos.
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', margin: 0 }}>
                  Sua clínica foi notificada.
                </p>
              </div>
              <div style={{ padding: '24px', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: '#A69060', margin: 0 }}>
                  Se quiser reagendar, entre em contato com a clínica.
                </p>
              </div>
            </div>

            <Footer clinicName={clinicName} clinicPhone={clinicPhone} />
          </>
        )}

        {/* ====== PRONTO PARA CONFIRMAR ====== */}
        {!jaConfirmado && !jaCancelado && (
          <>
            {/* Badge da clínica */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(184,150,12,0.10)',
                  border: '1px solid rgba(184,150,12,0.25)',
                  borderRadius: '99px',
                  padding: '6px 14px',
                  color: '#B8960C',
                  fontSize: '13px',
                  fontWeight: 700,
                }}
              >
                <Sparkles size={14} strokeWidth={1.5} />
                {clinicName}
              </div>
            </div>

            {/* Card principal */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                boxShadow: '0 8px 40px rgba(184,150,12,0.12)',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div style={{ background: 'linear-gradient(135deg, #D4B86A, #B8960C)', padding: '24px 24px 20px', textAlign: 'center' }}>
                <p style={{ color: 'rgba(22,20,18,0.7)', fontSize: '13px', margin: '0 0 4px', fontWeight: 500 }}>
                  Olá, {clientName.split(' ')[0]}! 💛
                </p>
                <h1 style={{ fontFamily: "'Playfair Display', serif", color: '#161412', fontSize: '20px', fontWeight: 700, margin: 0 }}>
                  Confirme seu atendimento
                </h1>
              </div>

              {/* Detalhes */}
              <div style={{ padding: '20px 24px' }}>
                <InfoRow icon={<Sparkles size={16} strokeWidth={1.5} color="#B8960C" />} label="Serviço" value={serviceName} />
                <InfoRow
                  icon={<Calendar size={16} strokeWidth={1.5} color="#B8960C" />}
                  label="Data e hora"
                  value={<><span style={{ textTransform: 'capitalize' }}>{dateStr}</span><br /><strong style={{ fontSize: '16px', color: '#B8960C' }}>{timeStr}</strong></>}
                />
                {roomName && <InfoRow icon={<MapPin size={16} strokeWidth={1.5} color="#B8960C" />} label="Local" value={roomName} />}

                {/* Botão confirmar — PROEMINENTE */}
                <form action={confirmarComToken} style={{ marginTop: '8px', marginBottom: '16px' }}>
                  <button
                    type="submit"
                    style={{
                      width: '100%',
                      padding: '16px',
                      borderRadius: '14px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #D4B86A, #B8960C)',
                      color: '#161412',
                      fontSize: '17px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 20px rgba(184,150,12,0.3)',
                      letterSpacing: '0.01em',
                    }}
                  >
                    <CheckCircle2 size={20} strokeWidth={2} />
                    Confirmar Presença
                  </button>
                </form>

                {/* Cancelar — DISCRETO */}
                <div style={{ textAlign: 'center' }}>
                  <form action={cancelarComToken} style={{ display: 'inline' }}>
                    <button
                      type="submit"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#BBA870',
                        fontSize: '12px',
                        fontFamily: 'inherit',
                        padding: '4px 8px',
                        textDecoration: 'underline',
                        textDecorationStyle: 'dotted',
                      }}
                    >
                      Não poderei comparecer
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <Footer clinicName={clinicName} clinicPhone={clinicPhone} />
          </>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px',
        borderRadius: '12px',
        background: '#FBF5EA',
        marginBottom: '10px',
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #FBF5EA, #F3E8CC)',
          border: '1px solid rgba(184,150,12,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <p style={{ fontSize: '11px', color: '#A69060', margin: '0 0 2px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
        <p style={{ fontSize: '14px', color: '#2D2319', margin: 0, fontWeight: 600 }}>{value}</p>
      </div>
    </div>
  );
}

function Footer({ clinicName, clinicPhone }: { clinicName: string; clinicPhone: string | null }) {
  return (
    <div style={{ textAlign: 'center', marginTop: '24px' }}>
      <p style={{ fontSize: '12px', color: '#BBA870', margin: 0 }}>
        {clinicName}
        {clinicPhone && (
          <> · <a href={`tel:${clinicPhone}`} style={{ color: '#BBA870', textDecoration: 'none' }}>{clinicPhone}</a></>
        )}
      </p>
      <p style={{ fontSize: '11px', color: '#D4C8A8', margin: '4px 0 0' }}>
        Powered by Estetiqo
      </p>
    </div>
  );
}

function ErroPage() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'linear-gradient(160deg, #FBF5EA 0%, #F0E6CC 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        fontFamily: "'Urbanist', sans-serif",
      }}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          padding: '48px 28px',
          textAlign: 'center',
          maxWidth: '380px',
          width: '100%',
          boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
        }}
      >
        <Clock size={48} strokeWidth={1} color="#BBA870" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: '#2D2319', margin: '0 0 10px' }}>
          Link não encontrado
        </h2>
        <p style={{ fontSize: '13px', color: '#A69060', margin: 0 }}>
          Este link é inválido ou já expirou.<br />Entre em contato com a clínica para reagendar.
        </p>
      </div>
    </div>
  );
}
