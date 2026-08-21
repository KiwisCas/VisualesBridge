/**
 * Mirrors the parameters defined in parameters.js of the main project.
 * Each entry: { key, label, min, max, step, default }
 */
export const PARAM_DEFS = [
  // Physics
  { key: 'timeScale',            label: 'timeScale',                   min: 0,    max: 2,    step: 0.01,  default: 1.0 },
  { key: 'maxSpeed',             label: 'maxSpeed',                    min: 0.2,  max: 12,   step: 0.1,   default: 5.0 },
  { key: 'particleSize',         label: 'particleSize',                min: 0.005,max: 0.1,  step: 0.001, default: 0.035 },
  { key: 'returnSpeed',          label: 'Fuerza Atracción',            min: 10,   max: 150,  step: 1.0,   default: 75.0 },
  { key: 'damping',              label: 'damping',                     min: 0.5,  max: 0.99, step: 0.01,  default: 0.88 },
  { key: 'rotationSpeed',        label: 'rotationSpeed',               min: 0.1,  max: 5,    step: 0.1,   default: 1.5 },

  // Beat
  { key: 'beatPower',            label: 'Potencia Beat',               min: 0.5,  max: 6.0,  step: 0.1,   default: 2.5 },

  // Wind / Distortion
  { key: 'windSpeed',            label: 'windSpeed',                   min: 0,    max: 20,   step: 0.5,   default: 8.0 },
  { key: 'distortionFrequency',  label: 'distortionFrequency',         min: 0,    max: 5,    step: 0.1,   default: 1.2 },
  { key: 'distortionAmplitude',  label: 'distortionAmplitude',         min: 0,    max: 5,    step: 0.1,   default: 1.5 },

  // Diamond
  { key: 'diamondScale',         label: 'Ancho Diamante',              min: 0.5,  max: 8.0,  step: 0.1,   default: 2.5 },
  { key: 'diamondHeight',        label: 'Altura Diamante',             min: 1.0,  max: 12.0, step: 0.2,   default: 6.0 },

  // Horizon lines
  { key: 'linesForwardSpeed',    label: 'Velocidad Avance Líneas',     min: 5,    max: 80,   step: 1.0,   default: 15.0 },
  { key: 'linesSpread',          label: 'Dispersión Líneas',           min: 2,    max: 15,   step: 0.5,   default: 8.0 },
  { key: 'linesTwist',           label: 'Giro Líneas',                 min: 0,    max: 5,    step: 0.1,   default: 1.5 },
  { key: 'linesDistortion',      label: 'Distorsión Líneas',           min: 0,    max: 4,    step: 0.1,   default: 1.2 },
  { key: 'linesThickness',       label: 'Tamaño Líneas',               min: 0,    max: 0.12, step: 0.005, default: 0.04 },

  // Mandala
  { key: 'mandalaPetals',        label: 'Simetría (Pétalos)',          min: 3,    max: 24,   step: 1.0,   default: 8.0 },
  { key: 'mandalaRadius',        label: 'Radio Mándala',               min: 1,    max: 12,   step: 0.2,   default: 4.5 },
  { key: 'mandalaLayers',        label: 'Anillos Concéntricos',        min: 1,    max: 12,   step: 1.0,   default: 5.0 },
  { key: 'mandalaRotationSpeed', label: 'Velocidad Giro Mándala',      min: 0,    max: 4,    step: 0.1,   default: 0.8 },
  { key: 'mandalaPulseSpeed',    label: 'Velocidad Pulso',             min: 0.1,  max: 3,    step: 0.05,  default: 1.2 },
  { key: 'mandalaWaveFreq',      label: 'Frecuencia de Ondulación',    min: 0,    max: 10,   step: 0.2,   default: 3.0 },

  // Camera
  { key: 'cameraSpinSpeed',      label: 'Velocidad Giro 360°',         min: 0.1,  max: 3,    step: 0.1,   default: 0.8 },

  // Tornado
  { key: 'tornadoRadius',        label: 'tornadoRadius',               min: 0.2,  max: 4,    step: 0.1,   default: 1.2 },
  { key: 'tornadoSpeed',         label: 'tornadoSpeed',                min: 0.5,  max: 8,    step: 0.1,   default: 2.5 },

  // Brightness
  { key: 'brightnessMultiplier', label: 'Brillo',                      min: 0.1,  max: 5.0,  step: 0.05,  default: 0.65 },
];

/** Actions that trigger simulation functions (no param value, just events) */
export const ACTION_DEFS = [
  { key: 'divideRing',      label: '🪐 Dividir Anillo (D)' },
  { key: 'mergeRing',       label: '🧩 Reagrupar (X)' },
  { key: 'rotateNextRing',  label: '🔄 Activar Giro Anillo (G)' },
  { key: 'toggleWind',      label: '💨 Viento (W)' },
  { key: 'triggerBeat',     label: '💥 Beat (B)' },
  { key: 'setDiamond',      label: '💎 Diamante (M)' },
  { key: 'setTornado',      label: '🌪️ Tornados (T)' },
  { key: 'setLinesHorizon', label: '🚀 Horizonte (H)' },
  { key: 'setMandala',      label: '☸️ Mándala (N)' },
  { key: 'setSphere',       label: '⚪ Condensar Esfera (R)' },
  { key: 'maximizeDiamond', label: '⚡ Maximizar Diamante' },
  { key: 'rotateCameraY',   label: '🎥 Giro 360° Cámara' },
  { key: 'lightUp',         label: '💡 Brillo + (K)' },
  { key: 'lightDown',       label: '🌙 Brillo - (L)' },
  { key: 'reset',           label: '♻️ Reset' },
  { key: 'pause',           label: '⏸ Pausa / Continuar' },
];