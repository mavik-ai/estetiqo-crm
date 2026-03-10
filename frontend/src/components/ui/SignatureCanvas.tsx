'use client'

import { useRef, useEffect, useState } from 'react';

interface Props {
  onChange: (dataURL: string | null) => void;
}

export function SignatureCanvas({ onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const [hasSignature, setHasSignature] = useState(false);

  function getPos(clientX: number, clientY: number, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#1a1208';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const startDraw = (x: number, y: number) => {
      isDrawing.current = true;
      lastPos.current = { x, y };
    };

    const draw = (x: number, y: number) => {
      if (!isDrawing.current || !lastPos.current) return;
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      lastPos.current = { x, y };
      setHasSignature(true);
      onChange(canvas.toDataURL('image/png'));
    };

    const endDraw = () => {
      isDrawing.current = false;
      lastPos.current = null;
    };

    const onMouseDown = (e: MouseEvent) => {
      const p = getPos(e.clientX, e.clientY, canvas);
      startDraw(p.x, p.y);
    };
    const onMouseMove = (e: MouseEvent) => {
      const p = getPos(e.clientX, e.clientY, canvas);
      draw(p.x, p.y);
    };
    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const t = e.touches[0];
      const p = getPos(t.clientX, t.clientY, canvas);
      startDraw(p.x, p.y);
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const t = e.touches[0];
      const p = getPos(t.clientX, t.clientY, canvas);
      draw(p.x, p.y);
    };

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', endDraw);
    canvas.addEventListener('mouseleave', endDraw);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', endDraw);

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseup', endDraw);
      canvas.removeEventListener('mouseleave', endDraw);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', endDraw);
    };
  }, [onChange]);

  function clear() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onChange(null);
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={600}
        height={180}
        style={{
          width: '100%',
          height: '150px',
          border: '2px dashed #D4B86A',
          borderRadius: '12px',
          background: '#FEFCF7',
          cursor: 'crosshair',
          touchAction: 'none',
          display: 'block',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
        <span style={{ fontSize: '11px', color: '#BBA870' }}>
          {hasSignature ? '✓ Assinatura capturada' : 'Assine no espaço acima'}
        </span>
        {hasSignature && (
          <button
            type="button"
            onClick={clear}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--muted-foreground)',
              fontSize: '12px',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
            }}
          >
            Limpar
          </button>
        )}
      </div>
    </div>
  );
}
