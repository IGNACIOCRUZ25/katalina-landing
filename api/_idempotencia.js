// Evita entregar DOS VECES el mismo pago. Mercado Pago reenvía el mismo aviso
// varias veces (y un atacante podría reenviarlo a propósito): sin esto, cada aviso
// vuelve a mandar el correo de acceso a la alumna y a Katalina.
//
// Usa un almacén Redis por REST (Vercel KV o Upstash) si está configurado — así el
// control funciona aunque el aviso caiga en otra instancia del servidor. Si no hay
// Redis, cae a memoria (best-effort: frena los duplicados inmediatos, que es el caso
// más común). Para que sea 100% confiable, conecta un Vercel KV al proyecto.
//
// Variables (cualquiera de los dos pares):
//   KV_REST_API_URL      + KV_REST_API_TOKEN         (Vercel KV)
//   UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN (Upstash)

const memoria = new Set();
const TTL = 60 * 60 * 24 * 60; // 60 días

function redisConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

async function redisCmd(cfg, args) {
  const r = await fetch(cfg.url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cfg.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  if (!r.ok) throw new Error('redis_http_' + r.status);
  return r.json();
}

// Devuelve true si ESTA llamada "reclama" la entrega (hay que entregar).
// Devuelve false si el pago YA fue entregado antes (hay que saltar).
async function reclamarEntrega(paymentId) {
  const key = 'entrega:' + paymentId;
  const cfg = redisConfig();
  if (cfg) {
    try {
      // SET key 1 EX ttl NX → {"result":"OK"} si se creó (primera vez), {"result":null} si ya existía
      const data = await redisCmd(cfg, ['SET', key, '1', 'EX', String(TTL), 'NX']);
      return !!data && data.result === 'OK';
    } catch {
      // Si Redis falla no bloqueamos la venta: caemos a memoria (mejor entregar de más que perder una venta)
    }
  }
  if (memoria.has(key)) return false;
  memoria.add(key);
  return true;
}

// Libera la marca (por si la entrega falla, para permitir un reintento posterior).
async function liberarEntrega(paymentId) {
  const key = 'entrega:' + paymentId;
  const cfg = redisConfig();
  if (cfg) { try { await redisCmd(cfg, ['DEL', key]); } catch { /* no crítico */ } }
  memoria.delete(key);
}

module.exports = { reclamarEntrega, liberarEntrega };
