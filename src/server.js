import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import chalk from 'chalk';
import { PARAM_DEFS, ACTION_DEFS } from './parameterDefs.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 9001;

// ── State ────────────────────────────────────────────────────────────────────
const state = Object.fromEntries(PARAM_DEFS.map(p => [p.key, p.default]));

// Track all connected clients by role
const clients = new Map(); // ws → { role: 'simulation' | 'controller' }

// ── HTTP + WebSocket server ───────────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use(express.static(join(__dirname, '..', 'public')));

// REST: get full state (useful for initial load)
app.get('/api/state', (_req, res) => res.json(state));

// REST: update one or multiple params (alternative to WS)
app.post('/api/params', (req, res) => {
  const updates = req.body; // { key: value, ... }
  applyParamUpdates(updates, null);
  res.json({ ok: true, state });
});

// REST: trigger action
app.post('/api/action', (req, res) => {
  const { action } = req.body;
  broadcastAction(action, null);
  res.json({ ok: true });
});

const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

// ── WebSocket handler ─────────────────────────────────────────────────────────
wss.on('connection', (ws, req) => {
  const ip = req.socket.remoteAddress;
  const query = new URL(req.url, `http://localhost`).searchParams;
  const role = query.get('role') || 'controller'; // 'simulation' | 'controller'

  clients.set(ws, { role, ip });

  log(chalk.green(`✦ Connected`), chalk.dim(`[${role}]`), chalk.dim(ip));

  // Send full state on connect so client can sync immediately
  send(ws, { type: 'state', payload: state });
  // Also send param definitions so controller UIs can build themselves
  send(ws, { type: 'defs', payload: { params: PARAM_DEFS, actions: ACTION_DEFS } });

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }
    handleMessage(ws, msg);
  });

  ws.on('close', () => {
    clients.delete(ws);
    log(chalk.red(`✦ Disconnected`), chalk.dim(`[${role}]`), chalk.dim(ip));
  });

  ws.on('error', (err) => log(chalk.yellow('WS error:'), err.message));
});

// ── Message routing ───────────────────────────────────────────────────────────
function handleMessage(sender, msg) {
  const { type, payload } = msg;

  switch (type) {
    case 'set_param': {
      // { type: 'set_param', payload: { key, value } }
      const { key, value } = payload;
      applyParamUpdates({ [key]: value }, sender);
      break;
    }
    case 'set_params': {
      // { type: 'set_params', payload: { key: value, ... } }
      applyParamUpdates(payload, sender);
      break;
    }
    case 'action': {
      // { type: 'action', payload: { action } }
      broadcastAction(payload.action, sender);
      break;
    }
    case 'state_update': {
      // Sent by the simulation to report current live param values
      Object.assign(state, payload);
      broadcastToControllers({ type: 'state', payload: state }, sender);
      break;
    }
    default:
      log(chalk.dim(`Unknown message type: ${type}`));
  }
}

function applyParamUpdates(updates, sender) {
  const changed = {};
  for (const [key, value] of Object.entries(updates)) {
    const def = PARAM_DEFS.find(p => p.key === key);
    if (!def) continue;
    const clamped = Math.min(def.max, Math.max(def.min, Number(value)));
    if (state[key] !== clamped) {
      state[key] = clamped;
      changed[key] = clamped;
      log(chalk.cyan(`  ${key}`), chalk.white(`= ${clamped}`));
    }
  }
  if (Object.keys(changed).length === 0) return;

  // Forward to simulation clients
  broadcastToSimulations({ type: 'set_params', payload: changed }, sender);
  // Mirror to other controllers so all UIs stay in sync
  broadcastToControllers({ type: 'state', payload: state }, sender);
}

function broadcastAction(action, sender) {
  log(chalk.magenta(`  ⚡ action:`), chalk.white(action));
  broadcastToSimulations({ type: 'action', payload: { action } }, sender);
  // Echo to controllers so they can reflect UI state if needed
  broadcastToControllers({ type: 'action', payload: { action } }, sender);
}

// ── Broadcast helpers ─────────────────────────────────────────────────────────
function broadcastToSimulations(msg, exclude = null) {
  broadcast(msg, ws => clients.get(ws)?.role === 'simulation' && ws !== exclude);
}

function broadcastToControllers(msg, exclude = null) {
  broadcast(msg, ws => clients.get(ws)?.role === 'controller' && ws !== exclude);
}

function broadcast(msg, filter = () => true) {
  const raw = JSON.stringify(msg);
  for (const [ws] of clients) {
    if (ws.readyState === WebSocket.OPEN && filter(ws)) {
      ws.send(raw);
    }
  }
}

function send(ws, msg) {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
}

// ── Utils ─────────────────────────────────────────────────────────────────────
function log(...args) {
  const now = new Date().toLocaleTimeString('es-CO', { hour12: false });
  console.log(chalk.dim(`[${now}]`), ...args);
}

// ── Start ─────────────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log('');
  console.log(chalk.bold('  🎛  Particle Bridge'));
  console.log(chalk.dim('  ─────────────────────────────────────'));
  console.log(`  WebSocket  ${chalk.cyan(`ws://localhost:${PORT}`)}`);
  console.log(`  Panel web  ${chalk.cyan(`http://localhost:${PORT}`)}`);
  console.log('');
  console.log(chalk.dim('  Roles de conexión:'));
  console.log(chalk.dim(`    Simulación   → ws://localhost:${PORT}?role=simulation`));
  console.log(chalk.dim(`    Controlador  → ws://localhost:${PORT}?role=controller`));
  console.log('');
});
