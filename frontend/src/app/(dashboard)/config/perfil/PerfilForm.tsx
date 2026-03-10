'use client'

import { useState, useTransition } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { salvarPerfil, alterarSenha } from './actions';

interface Props {
  name: string;
  email: string;
  role: string;
  initials: string;
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 700,
  color: '#BBA870', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '6px',
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: '10px',
  border: '1px solid #EDE5D3', background: 'var(--accent)', fontSize: '14px',
  color: 'var(--foreground)', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
};
const sectionCard: React.CSSProperties = {
  background: 'var(--card)', border: '1px solid #EDE5D3', borderRadius: '16px',
  padding: '28px', marginBottom: '16px',
};
const sectionTitle: React.CSSProperties = {
  fontSize: '12px', fontWeight: 700, color: '#BBA870', letterSpacing: '0.08em',
  textTransform: 'uppercase', margin: '0 0 20px', paddingBottom: '10px',
  borderBottom: '1px solid #F5EDE0',
};

export function PerfilForm({ name, email, role, initials }: Props) {
  const [isPendingPerfil, startPerfil] = useTransition();
  const [isPendingSenha, startSenha] = useTransition();
  const [savedPerfil, setSavedPerfil] = useState(false);
  const [senhaMsg, setSenhaMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [showNova, setShowNova] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Avatar preview
  const [currentName, setCurrentName] = useState(name);
  const [currentInitials, setCurrentInitials] = useState(initials);
  const previewInitials = currentInitials ||
    currentName.split(' ').slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('') || '??';

  function handlePerfilSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startPerfil(async () => {
      await salvarPerfil(fd);
      setSavedPerfil(true);
      setTimeout(() => setSavedPerfil(false), 3000);
    });
  }

  function handleSenhaSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startSenha(async () => {
      const result = await alterarSenha(fd);
      if (result?.error) {
        setSenhaMsg({ type: 'err', text: result.error });
      } else {
        setSenhaMsg({ type: 'ok', text: 'Senha alterada com sucesso!' });
        (e.target as HTMLFormElement).reset();
      }
      setTimeout(() => setSenhaMsg(null), 4000);
    });
  }

  return (
    <>
      {/* Seção: Dados pessoais */}
      <form onSubmit={handlePerfilSubmit} style={{ maxWidth: '560px' }}>
        <div style={sectionCard}>
          <p style={sectionTitle}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <User size={13} /> Dados Pessoais
            </span>
          </p>

          {/* Avatar preview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #D4B86A, #B8960C)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', fontWeight: 700, color: '#FFFDF7',
            }}>
              {previewInitials}
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)', margin: 0 }}>{currentName || '—'}</p>
              <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', margin: '2px 0 0' }}>{role} · {email}</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Nome completo</label>
              <input name="name" type="text" defaultValue={name}
                onChange={e => setCurrentName(e.target.value)}
                placeholder="Seu nome" style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Iniciais do avatar</label>
              <input name="avatar_initials" type="text" value={currentInitials}
                onChange={e => setCurrentInitials(e.target.value.toUpperCase().slice(0, 2))}
                placeholder="Ex: MO" maxLength={2} style={{ ...inputStyle, maxWidth: '80px' }} />
              <p style={{ fontSize: '11px', color: '#BBA870', margin: '4px 0 0' }}>
                2 letras. Se deixar vazio, usa as iniciais do nome.
              </p>
            </div>
            <div>
              <label style={labelStyle}>E-mail</label>
              <div style={{ ...inputStyle, background: 'var(--background)', color: 'var(--muted-foreground)' }}>{email}</div>
              <p style={{ fontSize: '11px', color: '#BBA870', margin: '4px 0 0' }}>
                O e-mail não pode ser alterado aqui.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginBottom: '24px' }}>
          {savedPerfil && <span style={{ fontSize: '13px', color: '#2D8C4E', fontWeight: 600 }}>✓ Perfil salvo!</span>}
          <button type="submit" disabled={isPendingPerfil}
            style={{
              padding: '11px 28px', borderRadius: '10px', border: 'none',
              background: isPendingPerfil ? '#D4C8A8' : 'linear-gradient(135deg, #D4B86A, #B8960C)',
              color: '#161412', fontSize: '14px', fontWeight: 700,
              cursor: isPendingPerfil ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            }}>
            {isPendingPerfil ? 'Salvando...' : 'Salvar perfil'}
          </button>
        </div>
      </form>

      {/* Seção: Alterar senha */}
      <form onSubmit={handleSenhaSubmit} style={{ maxWidth: '560px' }}>
        <div style={sectionCard}>
          <p style={sectionTitle}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={13} /> Alterar Senha
            </span>
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Nova senha</label>
              <div style={{ position: 'relative' }}>
                <input name="nova_senha" type={showNova ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  style={{ ...inputStyle, paddingRight: '42px' }} />
                <button type="button" onClick={() => setShowNova(v => !v)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#BBA870', display: 'flex' }}>
                  {showNova ? <EyeOff size={16} strokeWidth={1.8} /> : <Eye size={16} strokeWidth={1.8} />}
                </button>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Confirmar nova senha</label>
              <div style={{ position: 'relative' }}>
                <input name="confirmar_senha" type={showConfirm ? 'text' : 'password'}
                  placeholder="Repita a nova senha"
                  style={{ ...inputStyle, paddingRight: '42px' }} />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#BBA870', display: 'flex' }}>
                  {showConfirm ? <EyeOff size={16} strokeWidth={1.8} /> : <Eye size={16} strokeWidth={1.8} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
          {senhaMsg && (
            <span style={{ fontSize: '13px', fontWeight: 600, color: senhaMsg.type === 'ok' ? '#2D8C4E' : '#D94444' }}>
              {senhaMsg.type === 'ok' ? '✓ ' : '✕ '}{senhaMsg.text}
            </span>
          )}
          <button type="submit" disabled={isPendingSenha}
            style={{
              padding: '11px 28px', borderRadius: '10px', border: 'none',
              background: isPendingSenha ? '#D4C8A8' : 'linear-gradient(135deg, #D4B86A, #B8960C)',
              color: '#161412', fontSize: '14px', fontWeight: 700,
              cursor: isPendingSenha ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            }}>
            {isPendingSenha ? 'Alterando...' : 'Alterar senha'}
          </button>
        </div>
      </form>
    </>
  );
}
