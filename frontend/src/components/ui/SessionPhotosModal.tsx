'use client'

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { X, Camera, ImageOff, ChevronLeft, ChevronRight } from 'lucide-react';

interface Photo {
  id: string;
  storage_path: string;
  photo_type: 'before' | 'after' | 'during';
  url: string;
}

interface Props {
  sessionId: string;
  sessionNumber: number;
  onClose: () => void;
}

export function SessionPhotosModal({ sessionId, sessionNumber, onClose }: Props) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'before' | 'after'>('before');
  const [lightbox, setLightbox] = useState<number | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function loadPhotos() {
      const { data } = await supabase
        .from('session_photos')
        .select('id, storage_path, photo_type')
        .eq('session_id', sessionId);

      if (!data?.length) { setLoading(false); return; }

      const withUrls = await Promise.all(
        data.map(async (photo) => {
          const { data: signed } = await supabase.storage
            .from('session-photos')
            .createSignedUrl(photo.storage_path, 3600);
          return { ...photo, url: signed?.signedUrl ?? '' };
        })
      );

      setPhotos(withUrls.filter(p => p.url) as Photo[]);
      setLoading(false);

      const beforeCount = withUrls.filter(p => p.photo_type === 'before').length;
      if (beforeCount === 0) setActiveTab('after');
    }
    loadPhotos();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (lightbox !== null) setLightbox(null);
      else onClose();
    }
    if (lightbox !== null) {
      if (e.key === 'ArrowRight') setLightbox(i => Math.min((i ?? 0) + 1, filtered.length - 1));
      if (e.key === 'ArrowLeft')  setLightbox(i => Math.max((i ?? 0) - 1, 0));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  const filtered = photos.filter(p => p.photo_type === activeTab);
  const beforeCount = photos.filter(p => p.photo_type === 'before').length;
  const afterCount  = photos.filter(p => p.photo_type === 'after').length;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={lightbox !== null ? () => setLightbox(null) : onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px',
        }}
      >
        {/* Lightbox */}
        {lightbox !== null && filtered[lightbox] && (
          <div
            style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}
            onClick={e => e.stopPropagation()}
          >
            <img
              src={filtered[lightbox].url}
              alt=""
              style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: '12px', display: 'block' }}
            />
            {lightbox > 0 && (
              <button
                onClick={() => setLightbox(i => (i ?? 1) - 1)}
                style={{ position: 'absolute', left: '-48px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ChevronLeft size={20} color="#fff" />
              </button>
            )}
            {lightbox < filtered.length - 1 && (
              <button
                onClick={() => setLightbox(i => (i ?? 0) + 1)}
                style={{ position: 'absolute', right: '-48px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ChevronRight size={20} color="#fff" />
              </button>
            )}
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginTop: '8px' }}>
              {lightbox + 1} / {filtered.length}
            </p>
          </div>
        )}

        {/* Modal card */}
        {lightbox === null && (
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#FFFFFF', borderRadius: '16px', width: '100%', maxWidth: '540px',
              overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
            }}
          >
            {/* Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #EDE5D3', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={16} strokeWidth={1.5} color="#B8960C" />
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '15px', fontWeight: 700, color: '#2D2319' }}>
                  Fotos — Sessão #{sessionNumber}
                </span>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}>
                <X size={18} strokeWidth={2} style={{ color: '#A69060' }} />
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #EDE5D3' }}>
              {(['before', 'after'] as const).map(tab => {
                const count = tab === 'before' ? beforeCount : afterCount;
                const label = tab === 'before' ? 'Antes' : 'Depois';
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      flex: 1, padding: '10px', background: 'none', border: 'none',
                      cursor: 'pointer', fontSize: '13px', fontWeight: isActive ? 700 : 500,
                      color: isActive ? '#B8960C' : '#A69060',
                      borderBottom: isActive ? '2px solid #B8960C' : '2px solid transparent',
                      fontFamily: 'inherit',
                    }}
                  >
                    {label}{count > 0 ? ` (${count})` : ''}
                  </button>
                );
              })}
            </div>

            {/* Grid */}
            <div style={{ padding: '16px', minHeight: '180px' }}>
              {loading ? (
                <p style={{ textAlign: 'center', padding: '40px', color: '#A69060', fontSize: '13px', margin: 0 }}>
                  Carregando fotos...
                </p>
              ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#A69060' }}>
                  <ImageOff size={32} strokeWidth={1} style={{ color: '#EDE5D3', marginBottom: '8px' }} />
                  <p style={{ margin: 0, fontSize: '13px' }}>
                    Nenhuma foto {activeTab === 'before' ? 'antes' : 'depois'} registrada.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
                  {filtered.map((photo, i) => (
                    <button
                      key={photo.id}
                      onClick={() => setLightbox(i)}
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', borderRadius: '10px', overflow: 'hidden' }}
                    >
                      <img
                        src={photo.url}
                        alt=""
                        style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '10px', border: '1px solid #EDE5D3', display: 'block' }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
