'use client';
import { adnTheme as t } from './adn-theme';

export default function BrandCard({ profile, dnaStrength = 0, en = false }) {
  const { nombre, tono, idioma, audiencia, coloresMarca = [], categorias = [] } = profile || {};
  const tonoDisplay = Array.isArray(tono) ? tono.join(' + ') : tono || '';

  // Strength labels
  const strengthLabel = dnaStrength >= 91 ? (en ? 'Complete' : 'Completo')
    : dnaStrength >= 61 ? (en ? 'Strong' : 'Fuerte')
    : dnaStrength >= 31 ? (en ? 'Growing' : 'Creciendo')
    : (en ? 'Seed' : 'Semilla');
  const strengthColor = dnaStrength >= 91 ? '#40C057' : dnaStrength >= 61 ? '#A78BFA' : dnaStrength >= 31 ? '#7950F2' : t.textDim;

  // Header gradient from brand colors or default
  const c1 = coloresMarca[0] || '#7950F2';
  const c2 = coloresMarca[1] || '#4C1D95';

  const emptyPlaceholder = (text) => (
    <div style={{ border: '0.5px dashed rgba(255,255,255,0.12)', borderRadius: 8, padding: '8px 12px', fontSize: 11, color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>
      {text}
    </div>
  );

  return (
    <div style={{ background: '#10101C', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden', boxShadow: dnaStrength >= 91 ? '0 0 20px rgba(64,192,87,0.12)' : 'none', transition: 'box-shadow 0.6s ease' }}>
      {/* Header with gradient */}
      <div style={{ background: `linear-gradient(135deg, ${c1}, ${c2})`, padding: '20px 24px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#fff' }}>
            {(nombre || '?')[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{nombre || (en ? 'Your brand' : 'Tu marca')}</div>
            {tonoDisplay && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{tonoDisplay}{idioma ? ` · ${idioma}` : ''}</div>}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '20px 24px' }}>
        {/* Audience */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{en ? 'Audience' : 'Audiencia'}</div>
          {audiencia ? (
            <div style={{ fontSize: 12, color: t.text.primary, lineHeight: 1.5 }}>{audiencia}</div>
          ) : emptyPlaceholder(en ? 'Define your audience' : 'Define tu audiencia')}
        </div>

        {/* Palette */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{en ? 'Palette' : 'Paleta'}</div>
          {coloresMarca.length > 0 ? (
            <div style={{ display: 'flex', gap: 6 }}>
              {coloresMarca.slice(0, 6).map((c, i) => (
                <div key={i} style={{ width: 24, height: 24, borderRadius: '50%', background: c, border: '0.5px solid rgba(255,255,255,0.1)' }} />
              ))}
            </div>
          ) : emptyPlaceholder(en ? 'Add brand colors' : 'Agrega colores de marca')}
        </div>

        {/* Categories */}
        {categorias.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{en ? 'Categories' : 'Categorías'}</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {categorias.slice(0, 5).map(c => (
                <span key={c} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', color: t.textMuted }}>{c}</span>
              ))}
              {categorias.length > 5 && <span style={{ fontSize: 11, color: t.textDim }}>+{categorias.length - 5}</span>}
            </div>
          </div>
        )}

        {/* Strength meter */}
        <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.06)', paddingTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: t.textMuted }}>{en ? 'DNA Strength' : 'Fortaleza del ADN'}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: strengthColor }}>{strengthLabel}</span>
          </div>
          <div style={{ display: 'flex', gap: 2, height: 4 }}>
            {[0, 1, 2].map(i => {
              const segmentPct = i === 0 ? Math.min(dnaStrength / 33 * 100, 100)
                : i === 1 ? Math.min(Math.max((dnaStrength - 33) / 33 * 100, 0), 100)
                : Math.min(Math.max((dnaStrength - 66) / 34 * 100, 0), 100);
              return (
                <div key={i} style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: segmentPct + '%', background: dnaStrength >= 91 ? '#40C057' : 'linear-gradient(90deg, #7950F2, #A78BFA)', borderRadius: 2, transition: 'width 0.6s ease' }} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Create piece CTA */}
        {dnaStrength >= 91 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 10, color: 'rgba(64,192,87,0.7)', textAlign: 'center', marginBottom: 6 }}>
              {en ? '✓ DNA saved automatically' : '✓ ADN guardado automáticamente'}
            </div>
            <button onClick={() => window.location.href = '/crear'} style={{ width: '100%', padding: 10, background: 'linear-gradient(135deg, #7950F2, #4C1D95)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              {en ? 'Create piece with this DNA →' : 'Crear pieza con este ADN →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
