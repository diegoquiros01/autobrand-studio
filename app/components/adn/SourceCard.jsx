// components/adn/SourceCard.jsx
'use client';

import { useRef } from 'react';
import { adnTheme as t } from './adn-theme';

/**
 * Tarjeta unificada para cada fuente del ADN.
 *
 * Maneja 5 tipos (screenshots, instagram, tiktok, web, canva) y
 * 4 estados (empty, ready, analyzing, complete) con el mismo componente.
 *
 * Uso:
 *   <SourceCard
 *     type="instagram"
 *     state="analyzing"
 *     value="instagram.com/lallanada"
 *     enabled={true}
 *     progress={45}
 *     onChange={(newValue) => updateSource(id, newValue)}
 *     onToggle={(enabled) => toggleSource(id, enabled)}
 *     onAnalyze={() => startAnalysis(id)}
 *   />
 *
 * Estados:
 *   - empty:     sin URL/archivos, toggle off, chip "Sin conectar"
 *   - ready:     value presente, toggle on, chip "Listo" + botón "Analizar"
 *   - analyzing: progress bar visible, toggle bloqueado, chip "Analizando"
 *   - complete:  tags extraídos visibles, borde verde sutil, chip "Completo"
 */

const getSourceConfig = (en) => ({
  screenshots: { label: en ? 'Post screenshots' : 'Screenshots de posts', badge: en ? 'Most powerful' : 'La más poderosa', placeholder: en ? 'Drag images or click' : 'Arrastra imágenes o haz click', isFileUpload: true },
  instagram: { label: 'Instagram', placeholder: 'instagram.com/tucuenta', isFileUpload: false },
  tiktok: { label: 'TikTok', placeholder: 'tiktok.com/@tucuenta', isFileUpload: false },
  web: { label: en ? 'Website' : 'Sitio web', placeholder: 'tuweb.com', isFileUpload: false },
  canva: { label: 'Canva', placeholder: 'canva.com/tucuenta', isFileUpload: false },
});

const getStatusChip = (en) => ({
  empty:     { label: en ? 'Not connected' : 'Sin conectar',  bg: 'transparent',  color: t.textDim,     border: t.border.default },
  ready:     { label: en ? 'Ready' : 'Listo',                 bg: t.accentBg,     color: t.accentLight, border: 'transparent' },
  analyzing: { label: en ? 'Analyzing' : 'Analizando',        bg: t.accentBg,     color: t.accentLight, border: 'transparent' },
  complete:  { label: en ? 'Complete' : 'Completo',            bg: t.successBg,    color: t.success.solid, border: 'transparent' },
});

function SourceIcon({ type }) {
  const p = { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (type) {
    case 'screenshots':
      return <svg {...p}><rect x="2" y="3" width="12" height="10" rx="1"/><circle cx="6" cy="7" r="1.3" fill="currentColor" stroke="none"/><path d="M2 11l4-3 8 5"/></svg>;
    case 'instagram':
      return <svg {...p}><rect x="2" y="2" width="12" height="12" rx="3"/><circle cx="8" cy="8" r="3"/><circle cx="11.5" cy="4.5" r="0.6" fill="currentColor" stroke="none"/></svg>;
    case 'tiktok':
      return <svg {...p}><path d="M10 2v8.5a2.5 2.5 0 1 1-2.5-2.5"/><path d="M10 2c0 2 1.5 3 3 3"/></svg>;
    case 'web':
      return <svg {...p}><circle cx="8" cy="8" r="6"/><path d="M2 8h12M8 2c2 2 2 10 0 12M8 2c-2 2-2 10 0 12"/></svg>;
    case 'canva':
      return <svg {...p}><circle cx="8" cy="8" r="6"/><path d="M10.5 6.5A3 3 0 1 0 10 10"/></svg>;
    default:
      return null;
  }
}

function Toggle({ enabled, disabled, onChange }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange?.(!enabled)}
      disabled={disabled}
      aria-pressed={enabled}
      style={{
        width: 34,
        height: 20,
        borderRadius: 10,
        background: enabled ? t.accent.solid : 'rgba(255,255,255,0.1)',
        border: 'none',
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        flexShrink: 0,
        transition: 'background 0.15s ease',
        padding: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 2,
          left: enabled ? 16 : 2,
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: '#fff',
          transition: 'left 0.15s ease',
        }}
      />
    </button>
  );
}

function StatusChip({ config }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 500,
        padding: '3px 9px',
        borderRadius: 10,
        background: config.bg,
        color: config.color,
        border: `0.5px solid ${config.border}`,
        whiteSpace: 'nowrap',
        flexShrink: 0,
        minWidth: 72,
        textAlign: 'center',
      }}
    >
      {config.label}
    </span>
  );
}

function ProgressBar({ progress, detail, en = false }) {
  return (
    <div style={{ marginTop: 10, paddingTop: 8, borderTop: `0.5px solid ${t.border.default}` }}>
      <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: t.accent.solid,
            borderRadius: 2,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
      <p style={{ fontSize: 11, color: t.accentLight, margin: '6px 0 0', fontWeight: 500 }}>
        {detail || (en ? 'Extracting data' : 'Extrayendo datos')} · {progress}%
      </p>
    </div>
  );
}

function ExtractedTags({ tags, onViewDetail, en = false }) {
  const visible = tags.slice(0, 4);
  const remaining = tags.length - visible.length;

  return (
    <div
      style={{
        marginTop: 10,
        paddingTop: 8,
        borderTop: `0.5px solid ${t.border.default}`,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        flexWrap: 'wrap',
      }}
    >
      {visible.map((tag) => (
        <span
          key={tag}
          style={{
            fontSize: 11,
            padding: '2px 8px',
            borderRadius: 8,
            background: 'rgba(255,255,255,0.05)',
            color: t.textMuted,
          }}
        >
          {tag}
        </span>
      ))}
      {remaining > 0 && (
        <span style={{ fontSize: 11, color: t.textDim }}>+{remaining} {en ? 'more' : 'más'}</span>
      )}
      {onViewDetail && (
        <button
          type="button"
          onClick={onViewDetail}
          style={{
            marginLeft: 'auto',
            background: 'transparent',
            border: 'none',
            color: t.accentLight,
            fontSize: 11,
            fontWeight: 500,
            cursor: 'pointer',
            padding: 0,
          }}
        >
          {en ? 'View detail →' : 'Ver detalle →'}
        </button>
      )}
    </div>
  );
}

function FileUpload({ value, placeholder, onChange, inputRef, en = false }) {
  const fileCount = Array.isArray(value) ? value.length : 0;
  const label = fileCount > 0 ? `${fileCount} ${fileCount === 1 ? (en ? 'image uploaded' : 'imagen subida') : (en ? 'images uploaded' : 'imágenes subidas')}` : placeholder;

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        style={{
          width: '100%',
          textAlign: 'left',
          background: t.bgInput,
          border: `0.5px solid ${t.border.default}`,
          borderRadius: t.radiusSm,
          padding: '7px 10px',
          fontSize: 13,
          color: fileCount > 0 ? t.text.primary : t.textDim,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        {label}
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => onChange?.(Array.from(e.target.files || []))}
      />
    </>
  );
}

export default function SourceCard({
  type,
  state = 'empty',
  value = '',
  enabled = false,
  progress = 0,
  progressDetail,
  extractedTags = [],
  featured = false,
  onChange,
  onToggle,
  onAnalyze,
  onViewDetail,
  en = false,
}) {
  const config = getSourceConfig(en)[type];
  const fileInputRef = useRef(null);

  if (!config) {
    console.warn(`SourceCard: tipo desconocido "${type}"`);
    return null;
  }

  const chip = getStatusChip(en)[state];
  const isFeatured = featured && state !== 'complete';

  return (
    <div
      style={{
        background: isFeatured ? t.bgCardFeatured : t.bgCard,
        border: `0.5px solid ${isFeatured ? t.borderFeatured : t.border.subtle}`,
        borderRadius: t.radiusMd,
        padding: '12px 14px',
        marginBottom: 8,
        transition: 'border-color 0.15s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 7,
            background: state === 'empty' ? 'rgba(255,255,255,0.04)' : t.accentBg,
            color: state === 'empty' ? t.text.muted : t.accentLight,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <SourceIcon type={type} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: t.text.primary }}>{config.label}</span>
            {featured && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  padding: '2px 7px',
                  borderRadius: 5,
                  background: t.accent.solid,
                  color: '#fff',
                }}
              >
                {config.badge}
              </span>
            )}
          </div>

          {config.isFileUpload ? (
            <FileUpload
              value={value}
              placeholder={config.placeholder}
              onChange={onChange}
              inputRef={fileInputRef}
              en={en}
            />
          ) : (
            <input
              type="url"
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              placeholder={config.placeholder}
              style={{
                width: '100%',
                background: t.bgInput,
                border: `0.5px solid ${t.border.default}`,
                borderRadius: t.radiusSm,
                padding: '7px 10px',
                fontSize: 13,
                color: t.text.primary,
                fontFamily: 'inherit',
                outline: 'none',
              }}
              onFocus={(e) => (e.target.style.borderColor = t.borderActive)}
              onBlur={(e) => (e.target.style.borderColor = t.border.default)}
            />
          )}
        </div>

        <Toggle
          enabled={enabled}
          disabled={state === 'analyzing' || state === 'empty'}
          onChange={onToggle}
        />

        <StatusChip config={chip} />
      </div>

      {state === 'analyzing' && <ProgressBar progress={progress} detail={progressDetail} en={en} />}

      {state === 'complete' && extractedTags.length > 0 && (
        <ExtractedTags tags={extractedTags} onViewDetail={onViewDetail} en={en} />
      )}

      {state === 'ready' && onAnalyze && (
        <div style={{ marginTop: 10, paddingTop: 8, borderTop: `0.5px solid ${t.border.default}`, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onAnalyze}
            style={{
              background: t.accent.solid,
              color: '#fff',
              border: 'none',
              borderRadius: t.radiusSm,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {en ? 'Analyze this source' : 'Analizar esta fuente'}
          </button>
        </div>
      )}
    </div>
  );
}
