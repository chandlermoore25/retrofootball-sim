// Fastify WebSocket version (works with @fastify/websocket)
import type { FastifyInstance } from 'fastify';
import type { SocketStream } from '@fastify/websocket';
import { WebSocket, WebSocketServer } from 'ws';

type AliveWS = WebSocket & { isAlive?: boolean; lastPong?: number };

export type NormalizedEvent =
  | { type: 'GameStart'; ts: number; seq: number }
  | { type: 'QuarterStart'; quarter: number; ts: number; seq: number }
  | { type: 'ClockUpdate'; clockMs: number; ts: number; seq: number }
  | { type: 'PlayStart'; playId: string; ts: number; seq: number }
  | { type: 'PlayEnd'; playId: string; summary: string; ts: number; seq: number }
  | { type: 'ScoreUpdate'; home: number; away: number; ts: number; seq: number };

const HEARTBEAT_MS = 10_000;
let seq = 1;

// DEFAULT EXPORT to match: import livews from './ws/live'
export default function livews(app: FastifyInstance) {
  // Plug-in must be registered in index.ts: await app.register(require('@fastify/websocket'))
  // Route handler runs per-connection
  app.get('/ws/live', { websocket: true }, (conn: SocketStream, req) => {
    const ws = conn.socket as AliveWS;
    ws.isAlive = true;
    ws.lastPong = Date.now();

    ws.on('message', (raw: Buffer) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg?.type === 'Pong') {
          ws.isAlive = true;
          ws.lastPong = Date.now();
          return;
        }
      } catch {
        // ignore
      }
    });

    ws.on('close', () => {
      ws.isAlive = false;
    });
  });

  // Heartbeat across all clients using Fastify's shared WebSocketServer
  const wss = (app as any).websocketServer as WebSocketServer;
  setInterval(() => {
    wss?.clients.forEach((client) => {
      const c = client as AliveWS;
      if (c.isAlive === false) return c.terminate();
      c.isAlive = false;
      try { c.send(JSON.stringify({ type: 'Ping', ts: Date.now() })); } catch {}
    });
  }, HEARTBEAT_MS).unref();

  // Demo tickers
  setInterval(() => {
    const now = Date.now();
    broadcast(wss, [{ type: 'ClockUpdate', clockMs: msToClock(now), ts: now, seq: seq++ }]);
  }, 1000).unref();

  setInterval(() => {
    const now = Date.now();
    const playId = `P${now}`;
    broadcast(wss, [
      { type: 'PlayStart', playId, ts: now, seq: seq++ },
      { type: 'PlayEnd', playId, summary: 'Run left for 6', ts: now + 1200, seq: seq++ },
    ]);
  }, 5200).unref();
}

function msToClock(ms: number) {
  const s = Math.floor((ms / 1000) % 900);
  return 900_000 - s * 1000;
}

function broadcast(wss: WebSocketServer, evs: any[]) {
  if (!wss) return;
  const payload = JSON.stringify(evs);
  for (const client of wss.clients) {
    if ((client as WebSocket).readyState === WebSocket.OPEN) (client as WebSocket).send(payload);
  }
}
