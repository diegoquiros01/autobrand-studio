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

function Swatch({ color, isExtracted, onRemove }) {
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
          border: `0.5px solid ${t.border}`,
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
            background: t.success,
            color: '#fff',
            fontSize: 9,
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
          }}
          title="Extraído de tus fuentes"
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
          title="Quitar"
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
    const hex = newHex.trim().startsWith('#') ? newHex.trim() : '#' + newHex.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
      onChange?.({ extracted: extractedColors, user: [...userColors, hex] });
      setNewHex('');
      setAdding(false);
    }
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
          <span style={{ color: t.accent }}>✦</span>
          {attribution} — confirma o ajusta
        </p>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        {extractedColors.map((color, idx) => (
          <Swatch
            key={`ext-${idx}-${color}`}
            color={color}
            isExtracted={true}
            onRemove={() => removeExtracted(idx)}
          />
        ))}
        {userColors.map((color, idx) => (
          <Swatch
            key={`usr-${idx}-${color}`}
            color={color}
            isExtracted={false}
            onRemove={() => removeUser(idx)}
          />
        ))}

        {canAdd && !adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'transparent',
              border: `1px dashed ${t.border}`,
              color: t.textDim,
              fontSize: 18,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
            title="Agregar color"
          >
            +
          </button>
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
                border: `0.5px solid ${t.border}`,
                borderRadius: t.radiusSm,
                padding: '6px 8px',
                fontSize: 12,
                color: t.text,
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
                background: t.accent,
                color: '#fff',
                border: 'none',
                borderRadius: t.radiusSm,
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              Agregar
            </button>
          </div>
        )}
      </div>

      {extractedColors.length > 0 && (
        <p style={{ fontSize: 10, color: t.textDim, margin: '10px 0 0' }}>
          ✓ = extraído del análisis · hover para quitar
        </p>
      )}
    </div>
  );
}
