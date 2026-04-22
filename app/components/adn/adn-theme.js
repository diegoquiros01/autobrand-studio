// components/adn/adn-theme.js
//
// Tokens compartidos entre SourceCard y SectionStepper.
// Si ya tienes variables CSS globales (:root { --color-accent: ... }),
// puedes reemplazar estos valores por var(--tu-variable) sin tocar los componentes.

export const adnTheme = {
  // Superficies
  bgCard: 'rgba(255,255,255,0.03)',
  bgCardFeatured: 'rgba(127,119,221,0.08)',
  bgInput: 'rgba(255,255,255,0.04)',
  bgStepper: 'rgba(255,255,255,0.02)',

  // Bordes
  border: 'rgba(255,255,255,0.08)',
  borderFeatured: 'rgba(127,119,221,0.4)',
  borderActive: 'rgba(127,119,221,0.6)',

  // Texto
  text: '#ffffff',
  textMuted: 'rgba(255,255,255,0.6)',
  textDim: 'rgba(255,255,255,0.35)',

  // Acento (morado AiStudioBrand)
  accent: '#7F77DD',
  accentLight: '#CECBF6',
  accentBg: 'rgba(127,119,221,0.12)',

  // Estados semánticos
  success: '#5DCAA5',
  successBg: 'rgba(93,202,165,0.12)',
  warn: '#EF9F27',
  warnBg: 'rgba(239,159,39,0.12)',

  // Radios
  radiusSm: 6,
  radiusMd: 10,
  radiusLg: 14,
};
