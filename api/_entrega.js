// Entrega automática por correo (Resend). Se llama SOLO desde el webhook,
// después de confirmar con Mercado Pago que el pago está aprobado.

const { CURSOS } = require('./_cursos');

const GOLD = '#79693A';
const SKEDU = process.env.SKEDU_URL || 'https://katalinasalon.skedu.com/';
const WHATSAPP = process.env.WHATSAPP || '56937142655';

function waLink(msg) { return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(msg); }

function bloqueAcceso(curso, etiqueta) {
  const link = curso.drive
    ? `<a href="${curso.drive}" style="display:inline-block;background:${GOLD};color:#fff;text-decoration:none;padding:12px 22px;border-radius:100px;font-weight:600;font-size:15px">Acceder al curso →</a>`
    : `<span style="color:#a5432f;font-size:13px">Te enviaremos el acceso a la brevedad.</span>`;
  return `
    <div style="border:1px solid #e4ddcd;border-radius:12px;padding:18px 20px;margin:0 0 14px">
      <div style="font-size:12px;letter-spacing:.06em;color:#9a9182;text-transform:uppercase;margin-bottom:4px">${etiqueta}</div>
      <div style="font-family:Georgia,serif;font-size:20px;color:#3a3428;margin-bottom:14px">${curso.name}</div>
      ${link}
    </div>`;
}

function emailAlumna({ nombre, courseId, modality, bumpCourseId }) {
  const curso = CURSOS[courseId];
  const esPresencial = modality === 'presencial';
  let bloques = '';

  if (esPresencial) {
    // Presencial: incluye el online de regalo + agendar la clase
    bloques += bloqueAcceso(curso, 'Tu curso online (de regalo)');
    bloques += `
      <div style="border:1px solid #e4ddcd;border-radius:12px;padding:18px 20px;margin:0 0 14px;background:#f5f1e9">
        <div style="font-size:12px;letter-spacing:.06em;color:#9a9182;text-transform:uppercase;margin-bottom:4px">Tu clase presencial</div>
        <div style="font-family:Georgia,serif;font-size:20px;color:#3a3428;margin-bottom:6px">${curso.name}</div>
        <p style="font-size:14px;color:#6b6354;margin:0 0 14px">Agenda el día y la hora de tu práctica 1 a 1. Todos los materiales incluidos.</p>
        <a href="${SKEDU}" style="display:inline-block;background:${GOLD};color:#fff;text-decoration:none;padding:12px 22px;border-radius:100px;font-weight:600;font-size:15px">Agendar mi clase →</a>
      </div>`;
  } else {
    bloques += bloqueAcceso(curso, 'Tu curso online');
  }

  if (bumpCourseId && CURSOS[bumpCourseId]) {
    bloques += bloqueAcceso(CURSOS[bumpCourseId], 'Curso adicional que sumaste');
  }

  return `
  <div style="background:#E9E5DA;padding:28px 16px;font-family:Arial,Helvetica,sans-serif">
    <div style="max-width:520px;margin:0 auto;background:#f8f8f6;border-radius:18px;overflow:hidden">
      <div style="background:${GOLD};padding:26px 28px;text-align:center">
        <div style="font-family:Georgia,serif;font-size:22px;letter-spacing:.14em;color:#f3efe6;font-weight:bold">KATALINA</div>
        <div style="font-size:9px;letter-spacing:.34em;color:#e0d6bf">BEAUTY SALON ACADEMY</div>
      </div>
      <div style="padding:30px 28px">
        <h1 style="font-family:Georgia,serif;font-size:26px;color:#3a3428;margin:0 0 10px">¡Bienvenida, ${nombre || 'crack'}! 🎉</h1>
        <p style="font-size:15px;line-height:1.6;color:#5b5344;margin:0 0 22px">Tu pago fue confirmado y ya tienes acceso. Aquí está todo lo que compraste:</p>
        ${bloques}
        <p style="font-size:14px;line-height:1.6;color:#6b6354;margin:20px 0 0">Al terminar tu curso podrás descargar tu <b>certificado profesional</b> desde la página. ¿Dudas? Escríbenos por WhatsApp.</p>
        <div style="text-align:center;margin-top:22px">
          <a href="${waLink('Hola Katalina! Acabo de comprar ' + curso.name + ' y tengo una consulta.')}" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:12px 24px;border-radius:100px;font-weight:600;font-size:14px">Escribir por WhatsApp</a>
        </div>
      </div>
      <div style="padding:16px;text-align:center;font-size:11px;color:#9a9182;border-top:1px solid #e4ddcd">Katalina Beauty Salon Academy · Formación profesional en estética</div>
    </div>
  </div>`;
}

function emailKatalina({ nombre, email, telefono, courseId, modality, bumpCourseId, monto }) {
  const curso = CURSOS[courseId];
  const extra = bumpCourseId && CURSOS[bumpCourseId] ? ` + ${CURSOS[bumpCourseId].name} (online)` : '';
  return `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:20px">
    <h2 style="font-family:Georgia,serif;color:${GOLD}">💰 Nueva venta confirmada</h2>
    <table style="width:100%;border-collapse:collapse;font-size:15px;color:#3a3428">
      <tr><td style="padding:6px 0;color:#6b6354">Curso</td><td style="padding:6px 0;font-weight:bold">${curso.name}${extra}</td></tr>
      <tr><td style="padding:6px 0;color:#6b6354">Modalidad</td><td style="padding:6px 0;font-weight:bold">${modality === 'presencial' ? 'Presencial' : 'Online'}</td></tr>
      <tr><td style="padding:6px 0;color:#6b6354">Monto</td><td style="padding:6px 0;font-weight:bold">$${(monto || 0).toLocaleString('es-CL')}</td></tr>
      <tr><td style="padding:6px 0;color:#6b6354">Alumna</td><td style="padding:6px 0;font-weight:bold">${nombre || '—'}</td></tr>
      <tr><td style="padding:6px 0;color:#6b6354">Correo</td><td style="padding:6px 0">${email || '—'}</td></tr>
      <tr><td style="padding:6px 0;color:#6b6354">Teléfono</td><td style="padding:6px 0">${telefono || '—'}</td></tr>
    </table>
    ${telefono ? `<p style="margin-top:16px"><a href="${waLink('Hola ' + (nombre || '') + '! Bienvenida a Katalina Beauty Salon Academy 💛 Vi que compraste ' + curso.name + '. Cualquier duda me dices por aquí.')}" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:11px 20px;border-radius:100px;font-weight:600;font-size:14px">Dar la bienvenida por WhatsApp</a></p>` : ''}
  </div>`;
}

async function enviarResend(to, subject, html) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'Katalina Beauty Salon <onboarding@resend.dev>';
  if (!key) return { ok: false, reason: 'sin_resend' };
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, subject, html }),
  });
  const data = await r.json().catch(() => ({}));
  return { ok: r.ok, data };
}

async function entregarCurso(info) {
  const curso = CURSOS[info.courseId];
  if (!curso) return { ok: false, reason: 'curso_invalido' };
  const resultados = {};

  if (info.email) {
    resultados.alumna = await enviarResend(
      info.email,
      `¡Bienvenida! Tu acceso a ${curso.name} 💛`,
      emailAlumna(info)
    );
  }
  const notif = process.env.EMAIL_NOTIF;
  if (notif) {
    resultados.katalina = await enviarResend(
      notif,
      `Nueva venta: ${curso.name}`,
      emailKatalina(info)
    );
  }
  return { ok: true, resultados };
}

module.exports = { entregarCurso };
