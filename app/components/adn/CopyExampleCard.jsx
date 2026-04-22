// components/adn/CopyExampleCard.jsx
'use client';

import { useState } from 'react';
import { adnTheme as t } from './adn-theme';

/**
 * Tarjeta de ejemplo de copy pre-cargada desde el análisis.
 *
 * Tres estados:
 *   - suggested: el AI la propone desde un post real (Instagram/TikTok)
 *   - accepted:  el usuario la aceptó tal cual
 *   - editing:   el usuario está editando el texto
 *
 * Uso:
 *   <CopyExampleCard
 *     text="Dejar Venezuela no fue fácil..."
 *     source={{ platform: 'instagram', metric: '2.3k likes', url: '...' }}
 *     onAccept={(text) => saveExample(1, text)}
 *     onDismiss={() => removeExample(1)}
 *   />
 *
 * Para el estado manual (sin pre-carga) pasa `source={null}` y `text=""`:
 *   <CopyExampleCard onAccept={(text) => saveExample(3, text)} />
 */

function IGIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="12" height="12" rx="3"/>
      <circle cx="8" cy="8" r="3"/>
      <circle cx="11.5" cy="4.5" r="0.6" fill="currentColor" stroke="none"/>
    </svg>
  );
}

function TTIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M10 2v8.5a2.5 2.5 0 1 1-2.5-2.5"/>
      <path d="M10 2c0 2 1.5 3 3 3"/>
    </svg>
  );
}

export default function CopyExampleCard({
  text = '',
  source,
  accepted = false,
  onAccept,
  onDismiss,
  placeholder = 'Pega una caption que amas...',
}) {
  const [editing, setEditing] = useState(!text && !source);
  const [draft, setDraft] = useState(text);

  const commitEdit = () => {
    onAccept?.(draft);
    setEditing(false);
  };

  const resetToOriginal = () => {
    setDraft(text);
    setEditing(false);
  };

  const isEmpty = !text && !source;
  const SourceIcon = source?.platform === 'tiktok' ? TTIcon : IGIcon;

  return (
    <div
      style={{
        background: accepted ? t.successBg : t.bgInput,
        border: `0.5px solid ${accepted ? 'transparent' : t.border}`,
        borderRadius: t.radiusSm,
        padding: '10px 12px',
        marginBottom: 8,
      }}
    >
      {editing ? (
        <>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            rows={3}
            autoFocus
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: t.text,
              fontSize: 12,
              fontFamily: 'inherit',
              outline: 'none',
              resize: 'none',
              lineHeight: 1.5,
              boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            <button
              type="button"
              onClick={commitEdit}
              style={{
                fontSize: 11,
                padding: '4px 10px',
                background: t.accent,
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              Guardar
            </button>
            {text && (
              <button
                type="button"
                onClick={resetToOriginal}
                style={{
                  fontSize: 11,
                  padding: '4px 10px',
                  background: 'transparent',
                  border: `0.5px solid ${t.border}`,
                  color: t.textMuted,
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </>
      ) : isEmpty ? (
        <button
          type="button"
          onClick={() => setEditing(true)}
          style={{
            width: '100%',
            textAlign: 'left',
            background: 'transparent',
            border: 'none',
            color: t.textDim,
            fontSize: 12,
            fontStyle: 'italic',
            cursor: 'pointer',
            padding: 0,
            fontFamily: 'inherit',
          }}
        >
          + {placeholder}
        </button>
      ) : (
        <>
          <p style={{
            fontSize: 12,
            color: t.text,
            margin: '0 0 6px',
            lineHeight: 1.5,
          }}>
            &ldquo;{draft || text}&rdquo;
          </p>

          {source && (
            <div style={{
              fontSize: 10,
              color: t.textMuted,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}>
              <SourceIcon />
              <span>{source.platform === 'tiktok' ? 'TikTok' : 'Instagram'}</span>
              {source.metric && <span>· {source.metric}</span>}
            </div>
          )}

          {!accepted && (
            <div style={{ display: 'flex', gap: 5, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => onAccept?.(draft || text)}
                style={{
                  fontSize: 10,
                  padding: '3px 9px',
                  background: t.accent,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Usar este
              </button>
              <button
                type="button"
                onClick={() => setEditing(true)}
                style={{
                  fontSize: 10,
                  padding: '3px 9px',
                  background: 'transparent',
                  border: `0.5px solid ${t.border}`,
                  color: t.textMuted,
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                Editar
              </button>
              <button
                type="button"
                onClick={onDismiss}
                style={{
                  fontSize: 10,
                  padding: '3px 9px',
                  background: 'transparent',
                  border: `0.5px solid ${t.border}`,
                  color: t.textMuted,
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                Descartar
              </button>
            </div>
          )}

          {accepted && (
            <p style={{ fontSize: 10, color: t.success, margin: '6px 0 0', fontWeight: 500 }}>
              ✓ Guardado en tu ADN
            </p>
          )}
        </>
      )}
    </div>
  );
}
