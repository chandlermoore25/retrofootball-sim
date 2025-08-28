import Fastify from "fastify"
import websocket from "@fastify/websocket"
import liveWs from "./ws/live"

const app = Fastify({ logger: true })
await app.register(websocket)

app.get("/health", async () => ({ ok: true }))

liveWs(app)

const port = Number(process.env.PORT || 3001)
app.listen({ port, host: "0.0.0.0" }).then(() => {
  console.log(`[server] http://localhost:${port}  (WS: /ws/live)`)
})
