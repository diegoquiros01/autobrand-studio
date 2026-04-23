// components/adn/ADNContextPanel.jsx
'use client';

import { adnTheme as t } from './adn-theme';

/**
 * Panel derecho del flujo "New piece" que muestra el ADN que se aplicará
 * y la vista previa de la pieza.
 *
 * Resuelve el "espacio muerto" actual antes de generar:
 * - Muestra voz, audiencia y paleta para recordar qué se va a aplicar
 * - El preview vacío usa los colores reales de la marca (no un gris genérico)
 *
 * Uso:
 *   <ADNContextPanel
 *     adn={{
 *       voz: 'Cercano + inspiracional',
 *       idioma: 'Español',
 *       audiencia: 'Latinas en tech, 25–34',
 *       paleta: ['#D4537E', '#7F77DD', '#F0997B', '#F5E6D3'],
 *     }}
 *     previewState="empty"        // empty | generating | ready
 *     generatedImageUrl={null}
 *     generatedCopy={null}
 *     brandName="La Llanada"
 *     pieceType="Comercial"
 *   />
 */

function EmptyPreview({ paleta }) {
  // Gradiente sutil con los primeros dos colores de la paleta.
  // Si no hay paleta, cae a un gradiente neutro.
  const c1 = paleta?.[0] || '#F5E6D3';
  const c2 = paleta?.[1] || '#D4537E';

  return (
    <div
      style={{
        background: `linear-gradient(180deg, ${c1} 0%, ${c2} 100%)`,
        borderRadius: t.radiusSm,
        aspectRatio: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <svg width="32" height="32" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity="0.65">
        <path d="M8 2v12M2 8h12"/>
      </svg>
    </div>
  );
}

function GeneratingPreview({ paleta }) {
  const c1 = paleta?.[0] || '#F5E6D3';
  const c2 = paleta?.[1] || '#D4537E';

  return (
    <div
      style={{
        background: `linear-gradient(180deg, ${c1} 0%, ${c2} 100%)`,
        borderRadius: t.radiusSm,
        aspectRatio: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <div style={{
        width: 32,
        height: 32,
        border: '2px solid rgba(255,255,255,0.3)',
        borderTopColor: '#fff',
        borderRadius: '50%',
        animation: 'adn-spin 0.9s linear infinite',
      }} />
      <style>{`@keyframes adn-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ReadyPreview({ imageUrl, copy, brandName, pieceType }) {
  return (
    <div style={{
      background: t.bgCard,
      borderRadius: t.radiusSm,
      overflow: 'hidden',
      border: `0.5px solid ${t.border.subtle}`,
    }}>
      <div style={{ aspectRatio: '1', background: '#000' }}>
        {imageUrl && (
          <img src={imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
      </div>
      <div style={{ padding: '8px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <div style={{
            width: 20, height: 20, borderRadius: '50%',
            background: t.accent.solid, color: '#fff',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontWeight: 500,
          }}>
            {brandName?.[0] || 'B'}
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: t.text.primary }}>{brandName}</div>
            {pieceType && <div style={{ fontSize: 9, color: t.textMuted }}>{pieceType}</div>}
          </div>
        </div>
        {copy && (
          <p style={{ fontSize: 11, color: t.text.primary, margin: 0, lineHeight: 1.4 }}>
            {copy.length > 100 ? copy.slice(0, 100) + '…' : copy}
          </p>
        )}
      </div>
    </div>
  );
}

export default function ADNContextPanel({
  adn = {},
  previewState = 'empty',
  generatedImageUrl,
  generatedCopy,
  brandName = 'Tu marca',
  pieceType,
  en = false,
}) {
  const { voz, idioma, audiencia, paleta = [] } = adn;

  const sectionHead = {
    fontSize: 10,
    color: t.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    margin: '0 0 8px',
    fontWeight: 500,
  };

  return (
    <div style={{
      background: t.bgStepper,
      border: `0.5px solid ${t.border.subtle}`,
      borderRadius: t.radius.lg,
      padding: 14,
    }}>
      <p style={sectionHead}>{en ? 'This DNA will be applied' : 'Se aplicará este ADN'}</p>

      <div style={{
        background: t.bgCard,
        border: `0.5px solid ${t.border.subtle}`,
        borderRadius: t.radiusSm,
        padding: 10,
        marginBottom: 14,
      }}>
        {voz && (
          <div style={{ marginBottom: 7 }}>
            <div style={{ fontSize: 9, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 2 }}>{en ? 'Voice' : 'Voz'}</div>
            <div style={{ fontSize: 11, color: t.text.primary, lineHeight: 1.4 }}>
              {voz}{idioma && `${en ? ', in ' : ', en '}${idioma.toLowerCase()}`}
            </div>
          </div>
        )}

        {audiencia && (
          <div style={{ marginBottom: paleta.length > 0 ? 7 : 0 }}>
            <div style={{ fontSize: 9, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 2 }}>{en ? 'Audience' : 'Audiencia'}</div>
            <div style={{ fontSize: 11, color: t.text.primary, lineHeight: 1.4 }}>{audiencia}</div>
          </div>
        )}

        {paleta.length > 0 && (
          <div>
            <div style={{ fontSize: 9, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4 }}>{en ? 'Palette' : 'Paleta'}</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {paleta.slice(0, 6).map((color, i) => (
                <div
                  key={i}
                  style={{ width: 16, height: 16, borderRadius: '50%', background: color, border: `0.5px solid ${t.border.subtle}` }}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}

        {!voz && !audiencia && paleta.length === 0 && (
          <p style={{ fontSize: 11, color: t.textDim, margin: 0, fontStyle: 'italic' }}>
            {en ? 'Complete your DNA to see context here.' : 'Completa tu ADN para ver el contexto aquí.'}
          </p>
        )}
      </div>

      <p style={sectionHead}>{en ? 'Preview' : 'Vista previa'}</p>

      {previewState === 'empty' && <EmptyPreview paleta={paleta} />}
      {previewState === 'generating' && <GeneratingPreview paleta={paleta} />}
      {previewState === 'ready' && (
        <ReadyPreview
          imageUrl={generatedImageUrl}
          copy={generatedCopy}
          brandName={brandName}
          pieceType={pieceType}
        />
      )}

      {previewState === 'empty' && (
        <p style={{ fontSize: 10, color: t.textDim, margin: '6px 0 0', textAlign: 'center' }}>
          {en ? 'Fills when generating' : 'Se llena al generar'}
        </p>
      )}
      {previewState === 'generating' && (
        <p style={{ fontSize: 10, color: t.accentLight, margin: '6px 0 0', textAlign: 'center', fontWeight: 500 }}>
          {en ? 'Generating with your DNA…' : 'Generando con tu ADN…'}
        </p>
      )}
    </div>
  );
}
