/**
 * bridgeClient.js — cópialo a tu proyecto Three.js
 *
 * USO en main.js, después de definir params, simulation y todos los handlers:
 *
 *   import { connectBridge } from './bridge/bridgeClient.js';
 *
 *   connectBridge({
 *     params,
 *     handlers: {
 *       onReset, onPauseChange: () => { paused = !paused; },
 *       onDivideRing: handleDivideRing,
 *       onMergeRing: handleMergeRing,
 *       onRotateNextRing: handleRotateNextRing,
 *       onToggleWind: handleToggleWind,
 *       onTriggerBeat: handleTriggerBeat,
 *       onSetDiamond: handleSetDiamond,
 *       onSetTornado: handleSetTornado,
 *       onSetLinesHorizon: handleSetLinesHorizon,
 *       onSetMandala: handleSetMandala,
 *       onSetSphere: handleSetSphere,
 *       onMaximizeDiamond: handleMaximizeDiamond,
 *       onRotateCameraY: handleRotateCameraY,
 *       onLightUp: handleLightUp,
 *       onLightDown: handleLightDown,
 *     }
 *   });
 */

const BRIDGE_URL = 'ws://localhost:9001?role=simulation';
const SYNC_INTERVAL_MS = 500;

// Keys that map to params[key].value in the simulation
const PARAM_KEYS = [
  'timeScale', 'maxSpeed', 'particleSize', 'returnSpeed', 'damping',
  'rotationSpeed', 'beatPower', 'windSpeed', 'distortionFrequency',
  'distortionAmplitude', 'diamondScale', 'diamondHeight',
  'linesForwardSpeed', 'linesSpread', 'linesTwist', 'linesDistortion',
  'linesThickness', 'mandalaPetals', 'mandalaRadius', 'mandalaLayers',
  'mandalaRotationSpeed', 'mandalaPulseSpeed', 'mandalaWaveFreq',
  'cameraSpinSpeed', 'tornadoRadius', 'tornadoSpeed', 'brightnessMultiplier',
];

// Maps action keys from the bridge → handler keys in the handlers object
const ACTION_TO_HANDLER = {
  divideRing:      'onDivideRing',
  mergeRing:       'onMergeRing',
  rotateNextRing:  'onRotateNextRing',
  toggleWind:      'onToggleWind',
  triggerBeat:     'onTriggerBeat',
  setDiamond:      'onSetDiamond',
  setTornado:      'onSetTornado',
  setLinesHorizon: 'onSetLinesHorizon',
  setMandala:      'onSetMandala',
  setSphere:       'onSetSphere',
  maximizeDiamond: 'onMaximizeDiamond',
  rotateCameraY:   'onRotateCameraY',
  lightUp:         'onLightUp',
  lightDown:       'onLightDown',
  reset:           'onReset',
  pause:           'onPauseChange',
};

export function connectBridge({ params, handlers = {} }) {
  let ws = null;
  let reconnectTimer = null;

  // ── Helpers ────────────────────────────────────────────────────────────────

  function getSnapshot() {
    return Object.fromEntries(
      PARAM_KEYS.filter(k => params[k] != null).map(k => [k, params[k].value])
    );
  }

  function applyParams(updates) {
    for (const [key, value] of Object.entries(updates)) {
      if (params[key] != null) {
        params[key].value = Number(value);
      }
    }
  }

  // Read handler at call-time so we always get the latest closure values
  function dispatchAction(action) {
    const handlerKey = ACTION_TO_HANDLER[action];
    if (!handlerKey) {
      console.warn('[Bridge] Acción desconocida:', action);
      return;
    }
    const fn = handlers[handlerKey];
    if (typeof fn === 'function') {
      fn();
      console.log('[Bridge] ✓ acción ejecutada:', action);
    } else {
      console.warn(`[Bridge] Handler "${handlerKey}" no definido para acción "${action}"`);
    }
  }

  // ── WebSocket ──────────────────────────────────────────────────────────────

  function connect() {
    try {
      ws = new WebSocket(BRIDGE_URL);
    } catch (err) {
      console.warn('[Bridge] No se pudo crear WebSocket:', err.message);
      scheduleReconnect();
      return;
    }

    ws.addEventListener('open', () => {
      console.log('[Bridge] ✦ Conectado a', BRIDGE_URL);
      clearTimeout(reconnectTimer);
      ws.send(JSON.stringify({ type: 'state_update', payload: getSnapshot() }));
    });

    ws.addEventListener('message', (e) => {
      let msg;
      try { msg = JSON.parse(e.data); } catch { return; }

      switch (msg.type) {
        case 'set_param':
          applyParams({ [msg.payload.key]: msg.payload.value });
          break;

        case 'set_params':
          applyParams(msg.payload);
          break;

        case 'state':
          // Only apply numeric params, ignore unknowns
          applyParams(msg.payload);
          break;

        case 'action':
          dispatchAction(msg.payload.action);
          break;

        default:
          // defs, etc. — ignore silently
          break;
      }
    });

    ws.addEventListener('close', () => {
      console.log('[Bridge] Desconectado. Reintentando en 3s…');
      scheduleReconnect();
    });

    ws.addEventListener('error', () => {
      // 'close' fires right after, which triggers the reconnect
    });
  }

  function scheduleReconnect() {
    clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(connect, 3000);
  }

  // Periodically push live state so controllers stay in sync with the simulation
  setInterval(() => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'state_update', payload: getSnapshot() }));
    }
  }, SYNC_INTERVAL_MS);

  connect();

  return {
    push() {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'state_update', payload: getSnapshot() }));
      }
    },
    get connected() { return ws?.readyState === WebSocket.OPEN; },
  };
}
