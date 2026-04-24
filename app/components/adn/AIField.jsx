// components/adn/AIField.jsx
'use client';

import { useRef, useEffect, useState } from 'react';
import { adnTheme as t } from './adn-theme';

/**
 * Campo de entrada con indicador de origen (sugerido por AI / editado por el usuario).
 *
 * El estado "edited" se DERIVA comparando `value` contra `originalAIValue`.
 * Así no necesitas mantener un flag aparte: apenas el usuario cambia el texto,
 * el tag cambia de morado a verde automáticamente.
 *
 * Uso:
 *   <AIField
 *     label="A quién le hablas"
 *     value={audiencia}
 *     originalAIValue={adnOriginal.audiencia}   // lo que generó Claude
 *     onChange={setAudiencia}
 *     multiline={false}
 *   />
 *
 * Estados del badge:
 *   - sin originalAIValue      → no muestra badge (campo manual)
 *   - value === originalAIValue → "✨ sugerido por AI"
 *   - value !== originalAIValue → "✓ editado"
 *   - value vacío              → no muestra badge
 */

export default function AIField({
  label,
  value = '',
  originalAIValue,
  onChange,
  multiline = false,
  placeholder = '',
  rows = 3,
  disabled = false,
}) {
  const textareaRef = useRef(null);

  // Auto-resize textarea para que no tengas scrollbars feas
  useEffect(() => {
    if (multiline && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [value, multiline]);

  const hasAI = typeof originalAIValue === 'string' && originalAIValue.length > 0;
  const isEdited = hasAI && value !== originalAIValue && value.length > 0;
  const isUntouched = hasAI && value === originalAIValue;

  const badge = isEdited
    ? { label: '✓ editado', bg: t.successBg, color: t.success.solid }
    : isUntouched
      ? { label: '✨ sugerido por AI', bg: t.accentBg, color: t.accentLight }
      : null;

  const inputBase = {
    width: '100%',
    background: t.bgInput,
    border: `0.5px solid ${t.border.default}`,
    borderRadius: t.radiusMd,
    padding: '9px 11px',
    fontSize: 12.5,
    color: t.text.primary,
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
    resize: 'none',
    lineHeight: 1.5,
  };

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <span style={{ fontSize: 11, color: t.textMuted }}>{label}</span>
        {badge && (
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 500,
              padding: '2px 7px',
              borderRadius: 6,
              background: badge.bg,
              color: badge.color,
              whiteSpace: 'nowrap',
            }}
          >
            {badge.label}
          </span>
        )}
      </div>

      {multiline ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          style={inputBase}
          onFocus={(e) => (e.target.style.borderColor = t.borderActive)}
          onBlur={(e) => (e.target.style.borderColor = t.border.default)}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          style={inputBase}
          onFocus={(e) => (e.target.style.borderColor = t.borderActive)}
          onBlur={(e) => (e.target.style.borderColor = t.border.default)}
        />
      )}
    </div>
  );
}
