# Particle Bridge 🎛

Servidor Node.js que actúa como puente WebSocket entre tu proyecto Three.js
(en GitHub Pages) y cualquier controlador externo (panel web local, scripts, etc.).

## Arquitectura

```
[GitHub Pages - Three.js]  ←—— WebSocket ——→  [Node.js Bridge]  ←—— WebSocket ——→  [Panel web local]
     role=simulation                                                                    role=controller
```

El bridge retransmite mensajes entre todos los clientes conectados:
- Parámetros modificados en el controlador → simulación (y viceversa)
- Acciones (beat, reset, formas…) → simulación
- Estado en vivo de la simulación → todos los controladores

---

## 1. Instalar y arrancar el servidor

```bash
cd particle-bridge
npm install
npm start
```

Verás:
```
  🎛  Particle Bridge
  ─────────────────────────────────────
  WebSocket  ws://localhost:9001
  Panel web  http://localhost:9001
```

Abre **http://localhost:9001** en tu navegador para el panel de control local.

---

## 2. Conectar tu proyecto Three.js (GitHub Pages)

### 2a. Copia `bridgeClient.js` a tu proyecto

Colócalo en, por ejemplo, `src/bridge/bridgeClient.js`.

### 2b. Edita `main.js`

Añade el import al principio:
```js
import { connectBridge } from './bridge/bridgeClient.js';
```

Y llama a `connectBridge` **después** de crear `params`, `simulation` y todos los handlers:

```js
// Al final de main(), después de definir todos los handles:
const bridge = connectBridge({
  params,
  simulation,
  handlers: {
    onReset,
    onPauseChange: () => { paused = !paused; },
    onDivideRing:      handleDivideRing,
    onMergeRing:       handleMergeRing,
    onRotateNextRing:  handleRotateNextRing,
    onToggleWind:      handleToggleWind,
    onTriggerBeat:     handleTriggerBeat,
    onSetDiamond:      handleSetDiamond,
    onSetTornado:      handleSetTornado,
    onSetLinesHorizon: handleSetLinesHorizon,
    onSetMandala:      handleSetMandala,
    onSetSphere:       handleSetSphere,
    onMaximizeDiamond: handleMaximizeDiamond,
    onRotateCameraY:   handleRotateCameraY,
    onLightUp:         handleLightUp,
    onLightDown:       handleLightDown,
  }
});
```

El cliente intentará conectar a `ws://localhost:9001` automáticamente.
Si el bridge no está corriendo, reintentará cada 3 segundos sin bloquear nada.

---

## 3. Problema CORS/Mixed Content en GitHub Pages

GitHub Pages sirve tu sitio por **HTTPS**, pero el bridge corre en `ws://localhost`
(HTTP/WS sin cifrar). Los navegadores modernos pueden bloquear conexiones
mixed-content.

**Solución recomendada: ngrok o tunnel similar**

```bash
# Instala ngrok (https://ngrok.com) y corre:
ngrok http 9001
```

Obtendrás una URL tipo `https://abc123.ngrok.io`.
Cambia en `bridgeClient.js`:

```js
// En vez de:
const BRIDGE_URL = 'ws://localhost:9001?role=simulation';

// Pon la URL de ngrok (wss://):
const BRIDGE_URL = 'wss://abc123.ngrok.io?role=simulation';
```

Alternativamente puedes usar **localhost.run** (sin instalación):
```bash
ssh -R 80:localhost:9001 localhost.run
```

---

## 4. Control por REST (sin WebSocket)

También puedes controlar la simulación con peticiones HTTP simples:

```bash
# Ver estado completo
curl http://localhost:9001/api/state

# Cambiar parámetros
curl -X POST http://localhost:9001/api/params \
  -H "Content-Type: application/json" \
  -d '{"timeScale": 0.5, "mandalaPetals": 12}'

# Disparar una acción
curl -X POST http://localhost:9001/api/action \
  -H "Content-Type: application/json" \
  -d '{"action": "triggerBeat"}'
```

### Acciones disponibles
| key | Descripción |
|-----|-------------|
| `divideRing` | 🪐 Añadir anillo (D) |
| `mergeRing` | 🧩 Reagrupar (X) |
| `rotateNextRing` | 🔄 Girar anillo (G) |
| `toggleWind` | 💨 Viento (W) |
| `triggerBeat` | 💥 Beat (B) |
| `setDiamond` | 💎 Diamante (M) |
| `setTornado` | 🌪️ Tornados (T) |
| `setLinesHorizon` | 🚀 Horizonte (H) |
| `setMandala` | ☸️ Mándala (N) |
| `setSphere` | ⚪ Esfera (R) |
| `maximizeDiamond` | ⚡ Maximizar diamante |
| `rotateCameraY` | 🎥 Giro 360° |
| `lightUp` | 💡 Brillo + |
| `lightDown` | 🌙 Brillo - |
| `reset` | ♻️ Reset |
| `pause` | ⏸ Pausa/Continuar |

---

## 5. Extender con scripts propios

Cualquier script Node puede conectarse como controlador:

```js
import { WebSocket } from 'ws';

const ws = new WebSocket('ws://localhost:9001?role=controller');

ws.on('open', () => {
  // Cambiar parámetro
  ws.send(JSON.stringify({
    type: 'set_param',
    payload: { key: 'timeScale', value: 0.3 }
  }));
  
  // Disparar acción
  ws.send(JSON.stringify({
    type: 'action',
    payload: { action: 'triggerBeat' }
  }));
});

// Recibir estado en vivo
ws.on('message', (raw) => {
  const msg = JSON.parse(raw);
  if (msg.type === 'state') {
    console.log('Estado actual:', msg.payload);
  }
});
```

---

## Estructura del proyecto

```
particle-bridge/
├── package.json
├── README.md
├── src/
│   ├── server.js          ← Servidor WebSocket + HTTP
│   ├── parameterDefs.js   ← Definición de todos los parámetros
│   └── bridgeClient.js    ← Copialo a tu proyecto Three.js
└── public/
    └── index.html         ← Panel de control web local
```
