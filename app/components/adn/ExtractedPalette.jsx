// components/adn/ExtractedPalette.jsx
'use client';

import { useState } from 'react';
import { adnTheme as t } from './adn-theme';

/**
 * Paleta de colores con distinción entre extraídos (AI) y agregados (usuario).
 *
 * Los colores extraídos llevan un check verde pequeño; los manuales no.
 * El usuario puede eliminar cualquiera haciendo click en el botón × que aparece al hover.
 *
 * Uso:
 *   <ExtractedPalette
 *     extractedColors={['#D4537E', '#7F77DD', '#F0997B', '#F5E6D3', '#2A1F35']}
 *     userColors={['#123456']}
 *     onChange={({ extracted, user }) => saveColors(extracted, user)}
 *     attribution="Basado en screenshots y tu Instagram"
 *   />
 */

function Swatch({ color, isExtracted, onRemove, en = false }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: color,
          border: `0.5px solid ${t.border.default}`,
          cursor: 'default',
        }}
        title={color}
      />
      {isExtracted && (
        <span
          style={{
            position: 'absolute',
            top: -3,
            right: -3,
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: t.success.solid,
            color: '#fff',
            fontSize: 9,
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
          }}
          title={en ? "Extracted from your sources" : "Extraído de tus fuentes"}
        >
          ✓
        </span>
      )}
      {hover && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          style={{
            position: 'absolute',
            bottom: -3,
            right: -3,
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.7)',
            color: '#fff',
            fontSize: 11,
            border: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          }}
          title={en ? "Remove" : "Quitar"}
        >
          ×
        </button>
      )}
    </div>
  );
}

export default function ExtractedPalette({
  extractedColors = [],
  userColors = [],
  onChange,
  attribution,
  maxTotal = 10,
  en = false,
}) {
  const [adding, setAdding] = useState(false);
  const [newHex, setNewHex] = useState('');

  const total = extractedColors.length + userColors.length;
  const canAdd = total < maxTotal;

  const removeExtracted = (idx) => {
    const next = extractedColors.filter((_, i) => i !== idx);
    onChange?.({ extracted: next, user: userColors });
  };
  const removeUser = (idx) => {
    const next = userColors.filter((_, i) => i !== idx);
    onChange?.({ extracted: extractedColors, user: next });
  };

  const commitAdd = () => {
    let hex = newHex.trim().startsWith('#') ? newHex.trim() : '#' + newHex.trim();
    // Accept 3 or 6 char hex
    if (/^#[0-9a-fA-F]{3}$/.test(hex)) {
      hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3]; // expand #abc → #aabbcc
    }
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
      onChange?.({ extracted: extractedColors, user: [...userColors, hex] });
      setNewHex('');
      setAdding(false);
    }
  };

  const addFromPicker = (hex) => {
    onChange?.({ extracted: extractedColors, user: [...userColors, hex] });
  };

  return (
    <div>
      {attribution && (
        <p style={{
          fontSize: 11,
          color: t.textMuted,
          margin: '0 0 10px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <span style={{ color: t.accent.solid }}>✦</span>
          {attribution} {en ? '— confirm or adjust' : '— confirma o ajusta'}
        </p>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        {extractedColors.map((color, idx) => (
          <Swatch
            key={`ext-${idx}-${color}`}
            color={color}
            isExtracted={true}
            onRemove={() => removeExtracted(idx)}
            en={en}
          />
        ))}
        {userColors.map((color, idx) => (
          <Swatch
            key={`usr-${idx}-${color}`}
            color={color}
            isExtracted={false}
            onRemove={() => removeUser(idx)}
            en={en}
          />
        ))}

        {canAdd && !adding && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <label style={{ position: 'relative', width: 36, height: 36, cursor: 'pointer' }}>
              <input type="color" value="#7F77DD" onChange={(e) => addFromPicker(e.target.value)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
              <div style={{ width: 36, height: 36, borderRadius: '50%', border: `1px dashed rgba(255,255,255,0.12)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.textDim, fontSize: 18 }}>+</div>
            </label>
            <button type="button" onClick={() => setAdding(true)} style={{ fontSize: 11, color: t.textMuted, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} title={en ? "Add color" : "Agregar color"}>
              #hex
            </button>
          </div>
        )}

        {adding && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="text"
              value={newHex}
              onChange={(e) => setNewHex(e.target.value)}
              placeholder="#hex"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitAdd();
                if (e.key === 'Escape') { setAdding(false); setNewHex(''); }
              }}
              style={{
                width: 84,
                background: t.bgInput,
                border: `0.5px solid ${t.border.default}`,
                borderRadius: t.radiusSm,
                padding: '6px 8px',
                fontSize: 12,
                color: t.text.primary,
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={commitAdd}
              style={{
                fontSize: 11,
                padding: '6px 10px',
                background: t.accent.solid,
                color: '#fff',
                border: 'none',
                borderRadius: t.radiusSm,
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              {en ? 'Add' : 'Agregar'}
            </button>
          </div>
        )}
      </div>

      {extractedColors.length > 0 && (
        <p style={{ fontSize: 10, color: t.textDim, margin: '10px 0 0' }}>
          {en ? '✓ = extracted from analysis · hover to remove' : '✓ = extraído del análisis · hover para quitar'}
        </p>
      )}
    </div>
  );
}
