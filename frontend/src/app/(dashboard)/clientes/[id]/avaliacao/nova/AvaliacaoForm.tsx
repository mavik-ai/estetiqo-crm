'use client'

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SignatureCanvas } from '@/components/ui/SignatureCanvas';
import { salvarAvaliacao, type AvaliacaoData } from './actions';
import { ChevronLeft, ChevronRight, CheckCircle2, User, Heart, Stethoscope, PenLine } from 'lucide-react';

// ─── tipos ───────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4;

type AnamneseState = AvaliacaoData['anamnese'];
type ProcedimentoState = {
  service_id: string;
  abs_cm: string;
  weight_kg: string;
  abi_cm: string;
  target_weight: string;
  total_sessions: string;
};

export interface Servico { id: string; name: string }

// ─── helpers de estilo ───────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: 'var(--card)',
  border: '1px solid #EDE5D3',
  borderRadius: '16px',
  padding: '24px',
  marginBottom: '16px',
};

const sectionTitle: React.CSSProperties = {
  fontFamily: "'Playfair Display', serif",
  fontSize: '16px',
  fontWeight: 700,
  color: 'var(--foreground)',
  marginTop: 0,
  marginBottom: '20px',
};

const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  color: '#BBA870',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '10px',
  border: '1px solid #EDE5D3',
  background: '#FEFCF7',
  fontSize: '14px',
  color: 'var(--foreground)',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
};

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  padding: '11px 22px', borderRadius: '10px', border: 'none',
  background: 'linear-gradient(135deg, #D4B86A, #B8960C)',
  color: '#161412', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
};

const btnGhost: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  padding: '11px 22px', borderRadius: '10px', border: '1px solid #EDE5D3',
  background: 'transparent', color: 'var(--muted-foreground)', fontSize: '14px', fontWeight: 600,
  cursor: 'pointer', fontFamily: 'inherit',
};

// ─── barra de progresso ───────────────────────────────────────────────────────

const STEPS = [
  { label: 'Dados Pessoais', icon: User },
  { label: 'Saúde',          icon: Heart },
  { label: 'Procedimento',   icon: Stethoscope },
  { label: 'Assinatura',     icon: PenLine },
];

function ProgressBar({ step }: { step: Step }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        {STEPS.map((s, i) => {
          const n = (i + 1) as Step;
          const active = n === step;
          const done   = n < step;
          return (
            <div key={n} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: '100%', height: '3px', borderRadius: '99px',
                background: done || active ? 'linear-gradient(90deg, #D4B86A, #B8960C)' : '#EDE5D3',
              }} />
              <span style={{
                fontSize: '10px', fontWeight: active ? 700 : 500,
                color: active ? '#B8960C' : done ? '#D4B86A' : '#BBA870',
                whiteSpace: 'nowrap',
              }}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: '12px', color: '#BBA870', margin: 0 }}>Etapa {step} de 4</p>
    </div>
  );
}

// ─── Step 1: Dados Pessoais ───────────────────────────────────────────────────

function Step1({
  clientName,
  clientData,
  onChange,
  onNext,
}: {
  clientName: string;
  clientData: { birth_date: string; sex: string; phone: string; cep: string; address: string };
  onChange: (d: typeof clientData) => void;
  onNext: () => void;
}) {
  const [cepLoading, setCepLoading] = useState(false);

  function set(key: keyof typeof clientData, val: string) {
    onChange({ ...clientData, [key]: val });
  }

  // Calcula idade a partir da data de nascimento
  function calcIdade(dateStr: string): string {
    if (!dateStr) return '—';
    const age = Math.floor((Date.now() - new Date(dateStr).getTime()) / (365.25 * 24 * 3600 * 1000));
    return isNaN(age) || age < 0 ? '—' : `${age} anos`;
  }

  // Busca CEP via ViaCEP
  async function buscarCep(cep: string) {
    const digits = cep.replace(/\D/g, '');
    if (digits.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const json = await res.json();
      if (!json.erro) {
        const addr = [json.logradouro, json.bairro, `${json.localidade}/${json.uf}`]
          .filter(Boolean).join(', ');
        onChange({ ...clientData, cep, address: addr });
      }
    } catch { /* ignora falha de rede */ }
    finally { setCepLoading(false); }
  }

  return (
    <>
      <div style={card}>
        <h2 style={sectionTitle}>Dados Pessoais</h2>

        {/* Nome (read-only) */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Nome</label>
          <div style={{ ...inputStyle, background: 'var(--background)', color: 'var(--muted-foreground)' }}>{clientName}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          {/* Data de Nascimento */}
          <div>
            <label style={labelStyle}>Data de Nascimento</label>
            <input
              type="date"
              value={clientData.birth_date}
              onChange={(e) => set('birth_date', e.target.value)}
              style={inputStyle}
            />
          </div>
          {/* Idade auto-calculada */}
          <div>
            <label style={labelStyle}>Idade</label>
            <div style={{ ...inputStyle, background: 'var(--background)', color: 'var(--muted-foreground)' }}>
              {calcIdade(clientData.birth_date)}
            </div>
          </div>
          {/* Sexo */}
          <div>
            <label style={labelStyle}>Sexo</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[{ v: 'F', l: 'Feminino' }, { v: 'M', l: 'Masculino' }, { v: 'O', l: 'Outro' }].map(({ v, l }) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => set('sex', v)}
                  style={{
                    flex: 1, padding: '9px 4px', borderRadius: '10px', fontSize: '12px', fontWeight: 600,
                    border: clientData.sex === v ? '1.5px solid #B8960C' : '1px solid #EDE5D3',
                    background: clientData.sex === v ? '#FBF5EA' : '#FEFCF7',
                    color: clientData.sex === v ? '#B8960C' : '#A69060',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          {/* Telefone */}
          <div>
            <label style={labelStyle}>Telefone</label>
            <input
              type="tel"
              value={clientData.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="(98) 99999-9999"
              style={inputStyle}
            />
          </div>
        </div>

        {/* CEP + Endereço */}
        <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>CEP</label>
            <input
              type="text"
              value={clientData.cep}
              onChange={(e) => set('cep', e.target.value)}
              onBlur={(e) => buscarCep(e.target.value)}
              placeholder="00000-000"
              maxLength={9}
              style={inputStyle}
            />
            {cepLoading && <span style={{ fontSize: '11px', color: '#B8960C', marginTop: '4px', display: 'block' }}>Buscando...</span>}
          </div>
          <div>
            <label style={labelStyle}>Endereço</label>
            <input
              type="text"
              value={clientData.address}
              onChange={(e) => set('address', e.target.value)}
              placeholder="Rua, número, bairro — cidade/UF"
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="button" style={btnPrimary} onClick={onNext}>
          Salvar e continuar <ChevronRight size={16} />
        </button>
      </div>
    </>
  );
}

// ─── Step 2: Histórico de Saúde ───────────────────────────────────────────────

const HEALTH_LABELS: { key: keyof Omit<AnamneseState, 'other_conditions' | 'has_other_conditions'>; label: string }[] = [
  { key: 'smoker',                       label: 'Fumante?' },
  { key: 'allergy',                      label: 'Alergia?' },
  { key: 'pregnancy',                    label: 'Gravidez?' },
  { key: 'heart_disease',               label: 'Cardiopatia?' },
  { key: 'anemia',                       label: 'Anemia?' },
  { key: 'depression',                   label: 'Depressão?' },
  { key: 'hypertension',                 label: 'Hipertensão?' },
  { key: 'previous_aesthetic_treatment', label: 'Já fez tratamento estético?' },
  { key: 'herpes',                       label: 'Herpes?' },
  { key: 'keloid',                       label: 'Queloide?' },
  { key: 'diabetes',                     label: 'Diabetes?' },
  { key: 'hepatitis',                    label: 'Hepatite?' },
  { key: 'hiv',                          label: 'Portador(a) de HIV?' },
  { key: 'skin_disease',                label: 'Doença de pele?' },
  { key: 'cancer',                       label: 'Câncer?' },
  { key: 'contraceptive',               label: 'Toma anticoncepcional?' },
];

function SimNao({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
      {[{ v: false, l: 'NÃO' }, { v: true, l: 'SIM' }].map(({ v, l }) => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(v)}
          style={{
            padding: '5px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 700,
            border: value === v ? '1.5px solid var(--primary)' : '1px solid var(--border)',
            background: value === v
              ? (v ? 'rgba(201,168,76,0.10)' : 'rgba(201,168,76,0.06)')
              : 'transparent',
            color: value === v ? 'var(--primary)' : 'var(--muted-foreground)',
            cursor: 'pointer',
            fontFamily: 'inherit',
            minWidth: '46px',
          }}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

function Step2({
  anamnese,
  onChange,
  onBack,
  onNext,
}: {
  anamnese: AnamneseState;
  onChange: (a: AnamneseState) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <>
      <div style={card}>
        <h2 style={sectionTitle}>Histórico de Saúde</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {HEALTH_LABELS.map(({ key, label }) => (
            <div
              key={key}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', borderRadius: '10px',
                border: anamnese[key] ? '1px solid rgba(201,168,76,0.3)' : '1px solid var(--border)',
                background: anamnese[key] ? 'rgba(201,168,76,0.05)' : 'var(--card)',
              }}
            >
              <span style={{ fontSize: '14px', color: 'var(--foreground)', fontWeight: anamnese[key] ? 600 : 400 }}>
                {label}
              </span>
              <SimNao value={anamnese[key]} onChange={(v) => onChange({ ...anamnese, [key]: v })} />
            </div>
          ))}

          {/* Outros problemas de saúde */}
          <div
            style={{
              padding: '12px 14px', borderRadius: '10px',
              border: anamnese.has_other_conditions ? '1px solid rgba(201,168,76,0.3)' : '1px solid var(--border)',
              background: anamnese.has_other_conditions ? 'rgba(201,168,76,0.05)' : 'var(--card)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: anamnese.has_other_conditions ? '12px' : 0 }}>
              <span style={{ fontSize: '14px', color: 'var(--foreground)', fontWeight: anamnese.has_other_conditions ? 600 : 400 }}>
                Possui algum problema de saúde não citado acima?
              </span>
              <SimNao
                value={anamnese.has_other_conditions}
                onChange={(v) => onChange({ ...anamnese, has_other_conditions: v, other_conditions: v ? anamnese.other_conditions : '' })}
              />
            </div>
            {anamnese.has_other_conditions && (
              <textarea
                value={anamnese.other_conditions}
                onChange={(e) => onChange({ ...anamnese, other_conditions: e.target.value })}
                placeholder="Descreva o problema de saúde..."
                rows={2}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.5', marginTop: '4px' }}
              />
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button type="button" style={btnGhost} onClick={onBack}><ChevronLeft size={16} /> Voltar</button>
        <button type="button" style={btnPrimary} onClick={onNext}>Salvar e continuar <ChevronRight size={16} /></button>
      </div>
    </>
  );
}

// ─── Step 3: Procedimento ─────────────────────────────────────────────────────

function Step3({
  procedimento,
  servicos,
  onChange,
  onBack,
  onNext,
}: {
  procedimento: ProcedimentoState;
  servicos: Servico[];
  onChange: (p: ProcedimentoState) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  function set(key: keyof ProcedimentoState, val: string) {
    onChange({ ...procedimento, [key]: val });
  }

  const isValid = procedimento.service_id && parseInt(procedimento.total_sessions) >= 1;

  return (
    <>
      <div style={card}>
        <h2 style={sectionTitle}>Procedimento</h2>

        {/* Procedimento realizado */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Procedimento realizado *</label>
          <select
            value={procedimento.service_id}
            onChange={(e) => set('service_id', e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            <option value="">Selecione o procedimento...</option>
            {servicos.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Linha 1 — Pesos */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
          <div>
            <label style={labelStyle}>Peso atual (kg)</label>
            <input type="number" step="0.1" min="0" max="300" value={procedimento.weight_kg}
              onChange={(e) => set('weight_kg', e.target.value)} placeholder="Ex: 68.5" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Peso desejável (kg)</label>
            <input type="number" step="0.1" min="0" max="300" value={procedimento.target_weight}
              onChange={(e) => set('target_weight', e.target.value)} placeholder="Ex: 62" style={inputStyle} />
          </div>
        </div>

        {/* Linha 2 — Circunferências */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
          <div>
            <label style={labelStyle}>ABS — abdômen (cm)</label>
            <input type="number" step="0.1" min="0" max="200" value={procedimento.abs_cm}
              onChange={(e) => set('abs_cm', e.target.value)} placeholder="Ex: 85" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>ABI — abdominal inferior (cm)</label>
            <input type="number" step="0.1" min="0" max="200" value={procedimento.abi_cm}
              onChange={(e) => set('abi_cm', e.target.value)} placeholder="Ex: 32" style={inputStyle} />
          </div>
        </div>

        {/* Linha 3 — Sessões */}
        <div style={{ maxWidth: '200px' }}>
          <label style={labelStyle}>Número de sessões *</label>
          <input type="number" min="1" max="100" value={procedimento.total_sessions}
            onChange={(e) => set('total_sessions', e.target.value)} placeholder="Ex: 10" style={inputStyle} />
          <p style={{ fontSize: '11px', color: '#BBA870', margin: '4px 0 0' }}>
            Um protocolo será criado automaticamente.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button type="button" style={btnGhost} onClick={onBack}><ChevronLeft size={16} /> Voltar</button>
        <button type="button" style={{ ...btnPrimary, opacity: isValid ? 1 : 0.5 }} onClick={onNext} disabled={!isValid}>
          Salvar e continuar <ChevronRight size={16} />
        </button>
      </div>
    </>
  );
}

// ─── Step 4: Assinatura ───────────────────────────────────────────────────────

function Step4({
  signature,
  procedureDate,
  onSignature,
  onDateChange,
  onBack,
  onSubmit,
  onSubmitSemAssinatura,
  saving,
}: {
  signature: string | null;
  procedureDate: string;
  onSignature: (d: string | null) => void;
  onDateChange: (d: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  onSubmitSemAssinatura: () => void;
  saving: boolean;
}) {
  const handleChange = useCallback(onSignature, [onSignature]);

  return (
    <>
      <div style={card}>
        <h2 style={sectionTitle}>Assinatura</h2>

        <div style={{ maxWidth: '200px', marginBottom: '20px' }}>
          <label style={labelStyle}>Data da Avaliação</label>
          <input type="date" value={procedureDate} onChange={(e) => onDateChange(e.target.value)} style={inputStyle} />
        </div>

        <div style={{
          background: '#FBF5EA', border: '1px solid rgba(184,150,12,0.2)',
          borderRadius: '12px', padding: '16px', marginBottom: '20px',
        }}>
          <p style={{ fontSize: '13px', color: '#5C4A1E', lineHeight: '1.8', margin: 0 }}>
            Declaro que as informações prestadas nesta ficha são verdadeiras e que fui devidamente orientada
            sobre o procedimento a ser realizado. Autorizo o início do tratamento estético, bem como o registro
            fotográfico de antes e depois para acompanhamento do protocolo. Estou ciente das recomendações de
            cuidados pós-procedimento e comprometo-me a segui-las. Em conformidade com a LGPD (Lei 13.709/2018),
            autorizo o uso dos meus dados pessoais exclusivamente para fins de atendimento nesta clínica.
          </p>
        </div>

        <label style={{ ...labelStyle, marginBottom: '10px' }}>Assinatura da Cliente</label>
        <p style={{ fontSize: '12px', color: '#BBA870', marginBottom: '10px', marginTop: 0 }}>
          Entregue o dispositivo para a cliente assinar no espaço abaixo.
        </p>
        <SignatureCanvas onChange={handleChange} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <button type="button" style={btnGhost} onClick={onBack} disabled={saving}>
          <ChevronLeft size={16} /> Voltar
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <button
            type="button"
            style={{ ...btnPrimary, opacity: saving ? 0.7 : 1, padding: '13px 28px', fontSize: '15px' }}
            onClick={onSubmit}
            disabled={saving}
          >
            {saving ? 'Salvando...' : <><CheckCircle2 size={18} /> Finalizar e Criar Protocolo</>}
          </button>
          {!signature && !saving && (
            <button
              type="button"
              style={{ background: 'none', border: 'none', color: '#BBA870', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
              onClick={onSubmitSemAssinatura}
            >
              Salvar sem assinatura (coletar depois)
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// ─── defaults ─────────────────────────────────────────────────────────────────

const defaultAnamnese: AnamneseState = {
  smoker: false, allergy: false, pregnancy: false, heart_disease: false,
  anemia: false, depression: false, hypertension: false, previous_aesthetic_treatment: false,
  herpes: false, keloid: false, diabetes: false, hepatitis: false,
  hiv: false, skin_disease: false, cancer: false, contraceptive: false,
  has_other_conditions: false, other_conditions: '',
};

// ─── componente principal ──────────────────────────────────────────────────────

export function AvaliacaoForm({
  clientId,
  clientName,
  servicos,
  initialClient,
  initialHealth,
}: {
  clientId: string;
  clientName: string;
  servicos: Servico[];
  initialClient: { birth_date?: string | null; sex?: string | null; phone?: string | null; address?: string | null };
  initialHealth: Partial<AnamneseState & { weight_kg?: number | null; abs_cm?: number | null; abi_cm?: number | null }> | null;
}) {
  const router = useRouter();
  const [step, setStep]       = useState<Step>(1);
  const [error, setError]     = useState<string | null>(null);
  const [saving, setSaving]   = useState(false);

  const [clientData, setClientData] = useState({
    birth_date: initialClient.birth_date ?? '',
    sex:        initialClient.sex ?? '',
    phone:      initialClient.phone ?? '',
    cep:        '',
    address:    initialClient.address ?? '',
  });

  const [anamnese, setAnamnese] = useState<AnamneseState>({
    ...defaultAnamnese,
    ...(initialHealth ? {
      smoker:                       initialHealth.smoker ?? false,
      allergy:                      initialHealth.allergy ?? false,
      pregnancy:                    initialHealth.pregnancy ?? false,
      heart_disease:               initialHealth.heart_disease ?? false,
      anemia:                       initialHealth.anemia ?? false,
      depression:                   initialHealth.depression ?? false,
      hypertension:                 initialHealth.hypertension ?? false,
      previous_aesthetic_treatment: initialHealth.previous_aesthetic_treatment ?? false,
      herpes:                       initialHealth.herpes ?? false,
      keloid:                       initialHealth.keloid ?? false,
      diabetes:                     initialHealth.diabetes ?? false,
      hepatitis:                    initialHealth.hepatitis ?? false,
      hiv:                          initialHealth.hiv ?? false,
      skin_disease:                initialHealth.skin_disease ?? false,
      cancer:                       initialHealth.cancer ?? false,
      contraceptive:               initialHealth.contraceptive ?? false,
      has_other_conditions: !!(initialHealth as Record<string, unknown>)['other_conditions'],
      other_conditions: ((initialHealth as Record<string, unknown>)['other_conditions'] as string) ?? '',
    } : {}),
  });

  const [procedimento, setProcedimento] = useState<ProcedimentoState>({
    service_id:    '',
    abs_cm:        initialHealth?.abs_cm ? String(initialHealth.abs_cm) : '',
    weight_kg:     initialHealth?.weight_kg ? String(initialHealth.weight_kg) : '',
    abi_cm:        initialHealth?.abi_cm ? String(initialHealth.abi_cm) : '',
    target_weight: '',
    total_sessions: '',
  });

  const [signature, setSignature]         = useState<string | null>(null);
  const [procedureDate, setProcedureDate] = useState(new Date().toISOString().split('T')[0]);

  async function handleSave(withSignature: boolean) {
    setSaving(true);
    setError(null);

    const result = await salvarAvaliacao(clientId, {
      clientData: {
        birth_date: clientData.birth_date || null,
        sex:        clientData.sex || null,
        phone:      clientData.phone || null,
        address:    clientData.address || null,
      },
      anamnese,
      procedimento: {
        service_id:        procedimento.service_id,
        abs_cm:            procedimento.abs_cm ? parseFloat(procedimento.abs_cm) : null,
        weight_kg:         procedimento.weight_kg ? parseFloat(procedimento.weight_kg) : null,
        abi_cm:            procedimento.abi_cm ? parseFloat(procedimento.abi_cm) : null,
        target_weight:     procedimento.target_weight ? parseFloat(procedimento.target_weight) : null,
        expected_end_date: null,
        total_sessions:    parseInt(procedimento.total_sessions) || 1,
      },
      signature: withSignature ? signature : null,
      procedure_date: procedureDate,
    });

    if (result.error) {
      setError(result.error);
      setSaving(false);
    } else {
      router.push(`/clientes/${clientId}?avaliacao=salva`);
    }
  }

  return (
    <div style={{ padding: '0 24px 24px', background: 'var(--background)' }}>
      <ProgressBar step={step} />

      {error && (
        <div style={{
          background: '#FFF0F0', border: '1px solid #F5A0A0', borderRadius: '10px',
          padding: '12px 16px', marginBottom: '16px', color: '#C0392B', fontSize: '13px',
        }}>
          {error}
        </div>
      )}

      {step === 1 && (
        <Step1 clientName={clientName} clientData={clientData} onChange={setClientData} onNext={() => setStep(2)} />
      )}
      {step === 2 && (
        <Step2 anamnese={anamnese} onChange={setAnamnese} onBack={() => setStep(1)} onNext={() => setStep(3)} />
      )}
      {step === 3 && (
        <Step3 procedimento={procedimento} servicos={servicos} onChange={setProcedimento} onBack={() => setStep(2)} onNext={() => setStep(4)} />
      )}
      {step === 4 && (
        <Step4
          signature={signature}
          procedureDate={procedureDate}
          onSignature={setSignature}
          onDateChange={setProcedureDate}
          onBack={() => setStep(3)}
          onSubmit={() => handleSave(true)}
          onSubmitSemAssinatura={() => handleSave(false)}
          saving={saving}
        />
      )}
    </div>
  );
}
