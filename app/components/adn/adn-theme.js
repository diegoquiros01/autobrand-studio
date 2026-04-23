// lib/theme.js
//
// Sistema de diseño único para AiStudioBrand.
// Reemplaza adn-theme.js con tokens organizados por dominio.
//
// Uso: import { theme } from '@/lib/theme';
//      style={{ background: theme.bg.card, color: theme.text.primary }}
//
// Principio: toda decisión visual vive acá. Los componentes NUNCA hardcodean
// hex, rgba, sizes o weights. Si necesitas un valor nuevo, agrégalo al theme
// primero, después úsalo.

export const theme = {
  // ─── FONDOS Y CAPAS ─────────────────────────────────────────────────────
  //
  // Cuatro niveles de superficie. Cada nivel ~4-6% más claro que el anterior.
  // Esto crea jerarquía visual sin depender de bordes pesados.

  bg: {
    sidebar: '#07070F',         // nivel 0 — más profundo
    canvas:  '#0A0A14',         // nivel 1 — área de trabajo principal
    card:    '#10101C',         // nivel 2 — contenido elevado
    input:   'rgba(255,255,255,0.02)', // nivel 3 — dentro de cards
    stepper: 'rgba(255,255,255,0.02)', // mismo que input — elementos contenidos
    overlay: 'rgba(10,10,20,0.85)',    // modales, tooltips grandes
  },

  // Halo direccional del canvas. Reemplaza el vignette genérico actual.
  // Pégalo en un ::before del contenedor principal.
  halo: 'radial-gradient(ellipse at 15% 0%, rgba(121,80,242,0.14) 0%, rgba(121,80,242,0) 60%)',

  // Fade para el footer bar (acciones persistentes sobre contenido scrolleable).
  footbarFade: 'linear-gradient(180deg, rgba(10,10,20,0) 0%, #0A0A14 40%)',


  // ─── BORDES ─────────────────────────────────────────────────────────────
  //
  // Siempre 0.5px — nunca 1px. El 0.5 es el detalle que hace que todo se
  // sienta refinado en dark mode. Nunca uses `border: 1px solid` salvo casos
  // puntuales (focus rings, items activos, etc.).

  border: {
    divider:  'rgba(255,255,255,0.05)',  // separadores internos sub-sutiles
    subtle:   'rgba(255,255,255,0.06)',  // bordes de cards, dividers de sidebar
    default:  'rgba(255,255,255,0.08)',  // bordes de inputs, chips en reposo
    emphasis: 'rgba(255,255,255,0.1)',   // hover states
    focus:    '#7950F2',                 // focus rings, selección activa
  },


  // ─── TEXTO ──────────────────────────────────────────────────────────────
  //
  // Cinco niveles. Nunca uses color: #ccc o similares — siempre desde acá.

  text: {
    primary:   '#fff',                      // títulos, valores, contenido
    secondary: 'rgba(255,255,255,0.65)',    // texto en chips reposo, body secundario
    muted:     'rgba(255,255,255,0.5)',     // labels de campo, subtítulos
    hint:      'rgba(255,255,255,0.4)',     // meta (fechas, contadores)
    dim:       'rgba(255,255,255,0.35)',    // placeholder, estados disabled
  },


  // ─── ACENTO (MORADO) ────────────────────────────────────────────────────

  accent: {
    solid:     '#7950F2',                   // botones primarios, ring activo
    light:     '#A78BFA',                   // texto sobre fondos tinteados, íconos activos
    tint04:    'rgba(121,80,242,0.04)',     // banner de IA
    tint12:    'rgba(121,80,242,0.12)',     // backgrounds tinteados (item activo, chip on)
    tint14:    'rgba(121,80,242,0.14)',     // halo de fondo
    tint18:    'rgba(121,80,242,0.18)',     // step badge activo
    border:    'rgba(121,80,242,0.35)',     // borde de chips seleccionados
    borderSub: 'rgba(121,80,242,0.15)',     // borde sub-sutil (banner)
    glow:      '0 0 0 2px rgba(121,80,242,0.12)', // ring alrededor del step activo
  },


  // ─── ESTADOS SEMÁNTICOS ─────────────────────────────────────────────────

  success: {
    solid: '#5DCAA5',
    tint:  'rgba(93,202,165,0.14)',
    border: 'rgba(93,202,165,0.35)',
  },

  warn: {
    solid: '#EF9F27',
    tint:  'rgba(239,159,39,0.14)',
  },

  danger: {
    solid: '#E24B4A',
    tint:  'rgba(226,75,74,0.14)',
  },


  // ─── TIPOGRAFÍA ─────────────────────────────────────────────────────────
  //
  // Cinco niveles. Dos pesos nada más: 400 y 500.
  // Usa así: style={{ ...theme.typo.h1 }}

  font: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",

  typo: {
    h1: { fontSize: 22, fontWeight: 500, letterSpacing: '-0.4px', lineHeight: 1.3 },
    h2: { fontSize: 13, fontWeight: 500, letterSpacing: '-0.1px', lineHeight: 1.3 },
    body: { fontSize: 12.5, fontWeight: 400, lineHeight: 1.5 },
    label: { fontSize: 11, fontWeight: 400, letterSpacing: '0.1px' },
    meta: { fontSize: 10.5, fontWeight: 400 },
    sectionLabel: { fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.8px' }, // sidebar headers
    chip: { fontSize: 11.5, fontWeight: 400 },
    chipOn: { fontSize: 11.5, fontWeight: 500 },
    tag: { fontSize: 9.5, fontWeight: 500, letterSpacing: '0.2px' }, // AI badges
  },


  // ─── RADIOS ─────────────────────────────────────────────────────────────

  radius: {
    xs: 4,   // toggles internos, badges pequeños
    sm: 6,   // inputs pequeños, dropdowns
    md: 7,   // botones, nav items, inputs default
    lg: 10,  // stepper container
    xl: 12,  // cards principales
    pill: 14, // chips
    round: '50%',
  },


  // ─── ESPACIADO ──────────────────────────────────────────────────────────

  space: {
    canvasPadding:  '28px 44px 100px',  // padding del content principal
    canvasTopbar:   '18px 28px',        // topbar con breadcrumb
    cardPadding:    '18px 20px',
    cardGap:        14,
    gridGap:        '14px 20px',        // grid de campos 2x2
    subSectionGap:  18,                 // entre sub-sections dentro de una card
    subSectionPad:  16,                 // padding-top de sub-section
    chipGap:        5,
    footbarPadding: '14px 44px',
  },


  // ─── SIDEBAR ────────────────────────────────────────────────────────────

  sidebar: {
    width: 220,
    padding: '16px 12px',

    brandMark: {
      size: 22,
      radius: 6,
      bg: '#7950F2',
      fontSize: 11,
    },
    brandName: { fontSize: 13, fontWeight: 500, letterSpacing: '-0.2px' },

    sectionLabel: {
      fontSize: 10,
      fontWeight: 500,
      color: 'rgba(255,255,255,0.35)',
      textTransform: 'uppercase',
      letterSpacing: '0.8px',
      padding: '0 8px',
      margin: '0 0 6px',
    },

    navItem: {
      padding: '7px 10px',
      radius: 7,
      fontSize: 13,
      color: 'rgba(255,255,255,0.62)',
      marginBottom: 2,
      iconSize: 15,
      iconStroke: 1.5,
    },

    navItemActive: {
      background: 'rgba(121,80,242,0.12)',
      color: '#fff',
      fontWeight: 500,
      boxShadow: 'inset 2px 0 0 #7950F2',  // la barra lateral morada
      borderRadius: '0 7px 7px 0',
      paddingLeft: 8,
      marginLeft: 2,
    },

    subItem: {
      padding: '6px 8px',
      radius: 6,
      fontSize: 12,
      color: 'rgba(255,255,255,0.7)',
    },
    subItemActive: {
      background: 'rgba(255,255,255,0.04)',
      color: '#fff',
    },
    subAvatar: {
      size: 20,
      radius: 5,
      fontSize: 10,
      fontWeight: 500,
      // El background se genera con la paleta de la marca:
      // linear-gradient(135deg, paleta[0], paleta[1])
    },
    subMeta: { fontSize: 9.5, color: 'rgba(255,255,255,0.4)' },
    statusDot: { size: 6, bg: '#5DCAA5' },

    newBrandButton: {
      padding: '6px 8px',
      fontSize: 12,
      color: 'rgba(255,255,255,0.45)',
      border: '0.5px dashed rgba(255,255,255,0.12)',
      radius: 6,
      justifyContent: 'center',
    },

    userRow: {
      padding: '7px 10px',
      avatarSize: 26,
      avatarBg: '#7950F2',
      emailFontSize: 11.5,
      planFontSize: 10,
      planColor: 'rgba(255,255,255,0.4)',
    },
  },


  // ─── TOPBAR ─────────────────────────────────────────────────────────────

  topbar: {
    padding: '18px 28px',
    borderBottom: '0.5px solid rgba(255,255,255,0.05)',

    crumb: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
    crumbActive: { color: '#fff', fontWeight: 500 },
    crumbSep: { color: 'rgba(255,255,255,0.2)' },

    langToggle: {
      bg: 'rgba(255,255,255,0.04)',
      border: '0.5px solid rgba(255,255,255,0.06)',
      radius: 6,
      padding: 2,
    },
    langOpt: {
      fontSize: 10.5,
      padding: '3px 8px',
      radius: 4,
      color: 'rgba(255,255,255,0.5)',
    },
    langOptOn: {
      bg: 'rgba(255,255,255,0.08)',
      color: '#fff',
    },
  },


  // ─── CARDS ──────────────────────────────────────────────────────────────

  card: {
    bg: '#10101C',
    border: '0.5px solid rgba(255,255,255,0.06)',
    radius: 12,
    padding: '18px 20px',
    titleSize: 13,
    titleWeight: 500,
    titleLetterSpacing: '-0.1px',
    titleMarginBottom: 16,
  },


  // ─── INPUTS ─────────────────────────────────────────────────────────────

  input: {
    bg: 'rgba(255,255,255,0.02)',
    border: '0.5px solid rgba(255,255,255,0.08)',
    radius: 7,
    padding: '9px 11px',
    fontSize: 12.5,
    color: '#fff',
    lineHeight: 1.5,
    focusBorder: 'rgba(121,80,242,0.4)',
  },


  // ─── CHIPS ──────────────────────────────────────────────────────────────

  chip: {
    base: {
      padding: '5px 11px',
      radius: 14,
      fontSize: 11.5,
      border: '0.5px solid rgba(255,255,255,0.1)',
      bg: 'transparent',
      color: 'rgba(255,255,255,0.65)',
    },
    on: {
      bg: 'rgba(121,80,242,0.12)',
      border: '0.5px solid rgba(121,80,242,0.35)',
      color: '#A78BFA',
      fontWeight: 500,
    },
    disabled: { opacity: 0.3, cursor: 'not-allowed' },
    add: {
      borderStyle: 'dashed',
      color: 'rgba(255,255,255,0.35)',
    },
  },


  // ─── STEPPER ────────────────────────────────────────────────────────────

  stepper: {
    container: {
      bg: 'rgba(255,255,255,0.02)',
      border: '0.5px solid rgba(255,255,255,0.05)',
      radius: 10,
      padding: '10px 14px',
    },
    badge: { size: 26, radius: '50%', fontSize: 11, fontWeight: 500 },
    badgeDone: { bg: 'rgba(93,202,165,0.14)', color: '#5DCAA5' },
    badgeActive: {
      bg: 'rgba(121,80,242,0.18)',
      color: '#A78BFA',
      boxShadow: '0 0 0 2px rgba(121,80,242,0.12)',
    },
    badgePending: { bg: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)' },
    label: { fontSize: 12, fontWeight: 500, color: '#fff' },
    labelMuted: { color: 'rgba(255,255,255,0.5)', fontWeight: 400 },
    meta: { fontSize: 10, color: 'rgba(255,255,255,0.4)' },
    metaDone: { color: '#5DCAA5' },
    metaProg: { color: '#A78BFA' },
    connector: { height: 1, bg: 'rgba(255,255,255,0.08)' },
    connectorDone: { bg: 'rgba(93,202,165,0.35)' },
  },


  // ─── AI BANNER ──────────────────────────────────────────────────────────

  aiBanner: {
    bg: 'rgba(121,80,242,0.04)',
    border: '0.5px solid rgba(121,80,242,0.15)',
    radius: 9,
    padding: '11px 14px',
    iconSize: 14,
    iconColor: '#A78BFA',
    primaryText: { fontSize: 12.5, fontWeight: 500, color: '#fff' },
    subText: { fontSize: 11, color: 'rgba(255,255,255,0.5)' },
  },


  // ─── AI TAG (sugerido / editado) ────────────────────────────────────────

  aiTag: {
    base: {
      fontSize: 9.5,
      fontWeight: 500,
      padding: '2px 7px',
      radius: 6,
      letterSpacing: '0.2px',
    },
    suggested: { bg: 'rgba(121,80,242,0.12)', color: '#A78BFA' },
    edited:    { bg: 'rgba(93,202,165,0.12)', color: '#5DCAA5' },
  },


  // ─── BOTONES ────────────────────────────────────────────────────────────

  button: {
    base: {
      padding: '8px 16px',
      radius: 8,
      fontSize: 12.5,
      fontWeight: 500,
    },
    primary: { bg: '#7950F2', color: '#fff', border: 'none' },
    secondary: {
      bg: 'transparent',
      color: 'rgba(255,255,255,0.7)',
      border: '0.5px solid rgba(255,255,255,0.1)',
    },
    ghost: { bg: 'transparent', color: 'rgba(255,255,255,0.5)', border: 'none' },
  },


  // ─── RING DE PROGRESO ───────────────────────────────────────────────────

  ring: {
    trackStroke: 'rgba(255,255,255,0.08)',
    progressStroke: '#7950F2',
    strokeWidth: 3,
  },


  // ─── COMPATIBILIDAD HACIA ATRÁS ─────────────────────────────────────────
  //
  // Aliases para que los componentes que usan adn-theme.js sigan funcionando
  // mientras se migran. Mantener estos mapeos durante la transición.

  // Aliases planos (compat con adnTheme):
  bgCard: '#10101C',
  bgCardFeatured: 'rgba(121,80,242,0.04)',
  bgInput: 'rgba(255,255,255,0.02)',
  bgStepper: 'rgba(255,255,255,0.02)',
  borderFeatured: 'rgba(121,80,242,0.4)',
  borderActive: 'rgba(121,80,242,0.6)',
  textMuted: 'rgba(255,255,255,0.65)',
  textDim: 'rgba(255,255,255,0.35)',
  accentLight: '#A78BFA',
  accentBg: 'rgba(121,80,242,0.12)',
  successBg: 'rgba(93,202,165,0.14)',
  warnBg: 'rgba(239,159,39,0.14)',
  radiusSm: 6,
  radiusMd: 7,
  radiusLg: 12,
};

// Export también como adnTheme para compatibilidad con imports existentes.
// Una vez migrados todos los componentes, remover este alias.
export const adnTheme = theme;

export default theme;
