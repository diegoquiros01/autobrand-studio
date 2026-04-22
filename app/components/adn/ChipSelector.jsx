// components/adn/ChipSelector.jsx
'use client';

import { adnTheme as t } from './adn-theme';

/**
 * Selector de chips reutilizable.
 *
 * Modos:
 *   - mode="single" → solo se puede seleccionar una opción
 *   - mode="multi"  → varias, opcionalmente con límite `max`
 *
 * Cuando hay `max` y ya se alcanzó, las opciones no seleccionadas se atenúan
 * y no se pueden clickear. El contador muestra "N de MAX".
 *
 * Uso — tono de voz (multi con límite):
 *   <ChipSelector
 *     mode="multi"
 *     max={2}
 *     options={[
 *       { id: 'empoderador', label: 'Empoderador' },
 *       { id: 'cercano',     label: 'Cercano' },
 *       ...
 *     ]}
 *     value={['cercano', 'inspiracional']}
 *     onChange={setTonos}
 *   />
 *
 * Uso — idioma (single):
 *   <ChipSelector
 *     mode="single"
 *     options={[
 *       { id: 'es',  label: 'Español' },
 *       { id: 'en',  label: 'Inglés' },
 *       { id: 'bil', label: 'Bilingüe' },
 *     ]}
 *     value="es"
 *     onChange={setIdioma}
 *   />
 */

export default function ChipSelector({
  options = [],
  value,
  onChange,
  mode = 'multi',
  max,
  showCounter = true,
  size = 'md',
  en = false,
}) {
  const selectedIds = mode === 'multi'
    ? (Array.isArray(value) ? value : [])
    : (value ? [value] : []);

  const atMax = mode === 'multi' && typeof max === 'number' && selectedIds.length >= max;

  const handleClick = (id) => {
    if (mode === 'single') {
      onChange?.(id);
      return;
    }
    const isSelected = selectedIds.includes(id);
    if (isSelected) {
      onChange?.(selectedIds.filter((x) => x !== id));
    } else if (!atMax) {
      onChange?.([...selectedIds, id]);
    }
  };

  const chipPadding = size === 'sm' ? '3px 9px' : '5px 12px';
  const chipFontSize = size === 'sm' ? 11 : 12;

  return (
    <div>
      {showCounter && typeof max === 'number' && (
        <div style={{
          fontSize: 10,
          color: atMax ? t.warn : t.textMuted,
          marginBottom: 6,
          textAlign: 'right',
        }}>
          {selectedIds.length} {en ? 'of' : 'de'} {max}{atMax ? (en ? ' · max reached' : ' · máximo alcanzado') : ''}
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {options.map((opt) => {
          const isSelected = selectedIds.includes(opt.id);
          const isDisabled = !isSelected && atMax;

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => !isDisabled && handleClick(opt.id)}
              disabled={isDisabled}
              style={{
                fontSize: chipFontSize,
                padding: chipPadding,
                borderRadius: 14,
                border: `0.5px solid ${isSelected ? t.borderActive : t.border}`,
                background: isSelected ? t.accentBg : 'transparent',
                color: isSelected ? t.accentLight : t.textMuted,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                opacity: isDisabled ? 0.35 : 1,
                fontFamily: 'inherit',
                fontWeight: isSelected ? 500 : 400,
                transition: 'all 0.12s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
