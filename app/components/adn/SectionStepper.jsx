// components/adn/SectionStepper.jsx
'use client';

import { adnTheme as t } from './adn-theme';

/**
 * Stepper con indicadores de completitud por sección.
 *
 * Cada step puede estar en uno de tres estados visuales:
 *   - complete: check verde + "Completo"
 *   - active:   ring de progreso + porcentaje actual
 *   - pending:  número gris + "Pendiente"
 *
 * El estado se DERIVA del progress (0-100):
 *   - progress === 100 → complete
 *   - índice === currentStep → active
 *   - resto → pending
 *
 * Uso:
 *   <SectionStepper
 *     currentStep={0}
 *     steps={[
 *       { label: 'Connection',   progress: 50, meta: '2/4 fuentes' },
 *       { label: 'Voice',        progress: 0 },
 *       { label: 'Visual style', progress: 0 },
 *     ]}
 *     onStepClick={(index) => navigateToStep(index)}
 *   />
 */

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8l3 3 7-7" />
    </svg>
  );
}

function ProgressRing({ progress, color }) {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const dash = (progress / 100) * circumference;

  return (
    <svg
      width={36}
      height={36}
      viewBox="0 0 36 36"
      style={{ position: 'absolute', top: -2, left: -2 }}
    >
      <circle cx="18" cy="18" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
      <circle
        cx="18"
        cy="18"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeDasharray={`${dash} ${circumference}`}
        strokeLinecap="round"
        transform="rotate(-90 18 18)"
        style={{ transition: 'stroke-dasharray 0.4s ease' }}
      />
    </svg>
  );
}

function StepBadge({ step, index, isActive, isComplete }) {
  const baseStyle = {
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 500,
    flexShrink: 0,
    position: 'relative',
  };

  if (isComplete) {
    return (
      <div style={{ ...baseStyle, background: t.successBg, color: t.success }}>
        <CheckIcon />
      </div>
    );
  }

  if (isActive) {
    return (
      <div style={{ ...baseStyle, background: t.accentBg, color: t.accentLight }}>
        <ProgressRing progress={step.progress || 0} color={t.accent} />
        <span>{index + 1}</span>
      </div>
    );
  }

  return (
    <div style={{ ...baseStyle, background: 'rgba(255,255,255,0.04)', color: t.textDim }}>
      {index + 1}
    </div>
  );
}

function Connector({ filled }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 20,
        height: 2,
        background: 'rgba(255,255,255,0.08)',
        borderRadius: 1,
        position: 'relative',
        overflow: 'hidden',
        margin: '0 4px',
      }}
    >
      {filled && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: '100%',
            background: t.success,
            borderRadius: 1,
          }}
        />
      )}
    </div>
  );
}

export default function SectionStepper({ steps, currentStep = 0, onStepClick }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        background: t.bgStepper,
        border: `0.5px solid ${t.border}`,
        borderRadius: t.radiusLg,
        padding: '14px 18px',
      }}
    >
      {steps.map((step, index) => {
        const isComplete = step.progress >= 100;
        const isActive = !isComplete && index === currentStep;
        const isClickable = typeof onStepClick === 'function' && (isComplete || index <= currentStep);

        const metaText = isComplete
          ? (step.completeLabel || 'Completo')
          : isActive
            ? `${step.progress || 0}%${step.meta ? ' · ' + step.meta : ''}`
            : 'Pendiente';

        const metaColor = isComplete ? t.success : isActive ? t.accentLight : t.textDim;

        return (
          <div key={step.label} style={{ display: 'contents' }}>
            <button
              type="button"
              onClick={() => isClickable && onStepClick(index)}
              disabled={!isClickable}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: isClickable ? 'pointer' : 'default',
                textAlign: 'left',
                fontFamily: 'inherit',
              }}
            >
              <StepBadge step={step} index={index} isActive={isActive} isComplete={isComplete} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: isActive || isComplete ? 500 : 400,
                    color: isActive || isComplete ? t.text : t.textMuted,
                    lineHeight: 1.3,
                  }}
                >
                  {step.label}
                </span>
                <span style={{ fontSize: 10, color: metaColor, lineHeight: 1.2 }}>
                  {metaText}
                </span>
              </div>
            </button>

            {index < steps.length - 1 && <Connector filled={isComplete} />}
          </div>
        );
      })}
    </div>
  );
}
