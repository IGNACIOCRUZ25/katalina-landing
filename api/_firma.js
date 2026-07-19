// Valida la firma (cabecera x-signature) que envía Mercado Pago.
// Sirve para asegurar que el aviso viene REALMENTE de Mercado Pago y no de un tercero
// que quiera disparar entregas a mano. Requiere la variable MP_WEBHOOK_SECRET
// (se copia desde Mercado Pago → Webhooks → "Clave secreta").
//
// Mientras no exista MP_WEBHOOK_SECRET, devuelve 'sin_secreto' y el webhook sigue
// funcionando (protegido igual por la re-verificación del pago contra Mercado Pago).

const crypto = require('crypto');

// Devuelve:
//   'ok'          → firma válida
//   'invalida'    → firma presente pero NO coincide  → hay que RECHAZAR
//   'sin_secreto' → todavía no se configuró MP_WEBHOOK_SECRET → no se puede validar
function validarFirma(req, dataId) {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return 'sin_secreto';

  const sig = req.headers['x-signature'];
  const reqId = req.headers['x-request-id'];
  if (!sig) return 'invalida';

  // Formato de x-signature: "ts=1699999999,v1=abcdef0123..."
  let ts, v1;
  for (const parte of String(sig).split(',')) {
    const i = parte.indexOf('=');
    if (i === -1) continue;
    const k = parte.slice(0, i).trim();
    const v = parte.slice(i + 1).trim();
    if (k === 'ts') ts = v;
    else if (k === 'v1') v1 = v;
  }
  if (!ts || !v1) return 'invalida';

  // Plantilla EXACTA de Mercado Pago. Se omite el segmento cuyo valor falte.
  // El id, si es alfanumérico, debe ir en minúsculas.
  const id = dataId ? String(dataId).toLowerCase() : '';
  let manifest = '';
  if (id) manifest += `id:${id};`;
  if (reqId) manifest += `request-id:${reqId};`;
  manifest += `ts:${ts};`;

  const esperado = crypto.createHmac('sha256', secret).update(manifest).digest('hex');

  // Comparación en tiempo constante (evita ataques por tiempo de respuesta)
  const a = Buffer.from(esperado, 'utf8');
  const b = Buffer.from(v1, 'utf8');
  if (a.length !== b.length) return 'invalida';
  return crypto.timingSafeEqual(a, b) ? 'ok' : 'invalida';
}

module.exports = { validarFirma };
