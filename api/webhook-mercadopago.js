// Webhook de Mercado Pago — el punto de seguridad anti-fraude.
// Mercado Pago avisa aquí cuando cambia un pago. NO confiamos en ese aviso a ciegas:
// volvemos a preguntarle a Mercado Pago (con la clave secreta) el estado REAL del pago,
// y SOLO si está 'approved' entregamos el curso.

const { CURSOS } = require('./_cursos');
const { entregarCurso } = require('./_entrega');
const { validarFirma } = require('./_firma');
const { reclamarEntrega, liberarEntrega } = require('./_idempotencia');

async function leerBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  return await new Promise((resolve) => {
    let d = '';
    req.on('data', (c) => (d += c));
    req.on('end', () => { try { resolve(JSON.parse(d || '{}')); } catch { resolve({}); } });
    req.on('error', () => resolve({}));
  });
}

module.exports = async function handler(req, res) {
  // Mercado Pago espera una respuesta 200 rápida. Respondemos siempre 200 y procesamos.
  try {
    const token = process.env.MP_ACCESS_TOKEN;
    if (!token) { res.status(200).json({ ok: true, nota: 'sin_token' }); return; }

    const body = await leerBody(req);
    const q = req.query || {};

    // El id del pago puede venir en el cuerpo o en la URL, según el tipo de aviso
    const tipo = body.type || body.topic || q.type || q.topic;
    const paymentId =
      (body.data && body.data.id) || q['data.id'] || (tipo === 'payment' ? q.id : null);

    if (tipo && tipo !== 'payment') { res.status(200).json({ ok: true, ignorado: tipo }); return; }
    if (!paymentId) { res.status(200).json({ ok: true, nota: 'sin_id' }); return; }

    // 0) Firma: nos aseguramos de que el aviso venga REALMENTE de Mercado Pago.
    //    El id de la firma es el 'data.id' de la URL. Si aún no hay MP_WEBHOOK_SECRET,
    //    seguimos (la re-verificación del pago de abajo protege igual).
    const idFirma = q['data.id'] || (body.data && body.data.id) || paymentId;
    const firma = validarFirma(req, idFirma);
    if (firma === 'invalida') { res.status(401).json({ ok: false, error: 'firma_invalida' }); return; }

    // 1) Verificación anti-fraude: consultamos el pago REAL a Mercado Pago
    const r = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) { res.status(200).json({ ok: true, nota: 'pago_no_encontrado' }); return; }
    const pago = await r.json();

    // 2) Solo entregamos si el pago está realmente aprobado
    if (pago.status !== 'approved') {
      res.status(200).json({ ok: true, estado: pago.status });
      return;
    }

    // 3) Datos de la compra (guardados en metadata al crear la preferencia)
    const meta = pago.metadata || {};
    const courseId = meta.curso;
    if (!CURSOS[courseId]) { res.status(200).json({ ok: true, nota: 'curso_desconocido' }); return; }

    // 4) Idempotencia: si este pago ya se entregó antes, no lo repetimos.
    const primeraVez = await reclamarEntrega(String(paymentId));
    if (!primeraVez) { res.status(200).json({ ok: true, nota: 'ya_entregado' }); return; }

    try {
      await entregarCurso({
        courseId,
        modality: meta.modalidad === 'presencial' ? 'presencial' : 'online',
        bumpCourseId: meta.bump || null,
        nombre: meta.nombre || (pago.payer && (pago.payer.first_name || '')) || '',
        email: meta.email || (pago.payer && pago.payer.email) || '',
        telefono: meta.telefono || '',
        monto: pago.transaction_amount || 0,
      });
    } catch (e) {
      // Si la entrega falla, liberamos la marca para poder reintentar si vuelve el aviso.
      await liberarEntrega(String(paymentId));
      throw e;
    }

    res.status(200).json({ ok: true, entregado: true });
  } catch (e) {
    // Nunca devolvemos error a Mercado Pago para no forzar reintentos infinitos.
    res.status(200).json({ ok: true, error: String((e && e.message) || e) });
  }
};
