'use client'

import { useState } from 'react';
import { Camera } from 'lucide-react';
import { SessionPhotosModal } from './SessionPhotosModal';

interface Props {
  sessionId: string;
  sessionNumber: number;
  count: number;
}

export function PhotosCell({ sessionId, sessionNumber, count }: Props) {
  const [open, setOpen] = useState(false);

  if (count === 0) {
    return <span style={{ color: '#D4C8A8', fontSize: '13px' }}>—</span>;
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          background: 'rgba(184,150,12,0.08)', border: '1px solid rgba(184,150,12,0.2)',
          borderRadius: '20px', padding: '3px 9px',
          fontSize: '11px', fontWeight: 600, color: '#B8960C',
          cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        <Camera size={11} strokeWidth={2} />
        {count}
      </button>
      {open && (
        <SessionPhotosModal
          sessionId={sessionId}
          sessionNumber={sessionNumber}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
