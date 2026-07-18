// Servicio serverless: crea una preferencia de pago en Mercado Pago (Checkout Pro).
// Los precios se calculan AQUÍ (servidor) para que no se puedan alterar desde el navegador.
// Requiere la variable de entorno MP_ACCESS_TOKEN (se configura en Vercel).

const CURSOS = {
  lif: { name: 'Lifting de pestañas',                              online: 30000, pres: 150000 },
  cor: { name: 'Lifting de pestañas · Técnica Coreana',           online: 40000, pres: 150000 },
  tej: { name: 'Diseño de cejas con tinte',                       online: 20000, pres: 150000 },
  lam: { name: 'Laminado de cejas',                               online: 20000, pres: 150000 },
  man: { name: 'Manicure inicial · Esmaltado permanente con torno',              pres: 150000 },
  mav: { name: 'Manicure avanzada · Técnica rusa y gel',                         pres: 150000 },
};

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
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) {
    res.status(503).json({ error: 'pago_no_configurado' });
    return;
  }
  try {
    const { courseId, modality, bumpCourseId, nombre, email, telefono } = await leerBody(req);
    const curso = CURSOS[courseId];
    if (!curso) { res.status(400).json({ error: 'Curso inválido' }); return; }

    const mod = modality === 'presencial' ? 'presencial' : 'online';
    const price = mod === 'presencial' ? curso.pres : curso.online;
    if (!price) { res.status(400).json({ error: 'Modalidad no disponible para este curso' }); return; }

    const items = [{
      title: `${curso.name} (${mod === 'presencial' ? 'Presencial' : 'Online'})`,
      quantity: 1,
      unit_price: price,
      currency_id: 'CLP',
    }];

    // Extra opcional (order bump): otro curso en modalidad online
    if (bumpCourseId && CURSOS[bumpCourseId] && CURSOS[bumpCourseId].online) {
      const b = CURSOS[bumpCourseId];
      items.push({ title: `${b.name} (Online)`, quantity: 1, unit_price: b.online, currency_id: 'CLP' });
    }

    const proto = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0];
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const base = `${proto}://${host}`;

    const preferencia = {
      items,
      payer: {
        name: nombre || undefined,
        email: email || undefined,
      },
      back_urls: {
        success: `${base}/gracias?estado=exito&curso=${encodeURIComponent(courseId)}`,
        pending: `${base}/gracias?estado=pendiente&curso=${encodeURIComponent(courseId)}`,
        failure: `${base}/gracias?estado=error&curso=${encodeURIComponent(courseId)}`,
      },
      auto_return: 'approved',
      statement_descriptor: 'KATALINA',
      external_reference: `${courseId}-${mod}-${Date.now()}`,
      metadata: {
        curso: courseId,
        modalidad: mod,
        bump: bumpCourseId || null,
        telefono: telefono || null,
      },
    };

    const r = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(preferencia),
    });
    const data = await r.json();

    if (!r.ok) {
      res.status(502).json({ error: 'error_mercadopago', detalle: data && data.message ? data.message : data });
      return;
    }
    res.status(200).json({ init_point: data.init_point, id: data.id });
  } catch (e) {
    res.status(500).json({ error: 'error_interno', mensaje: String((e && e.message) || e) });
  }
}
