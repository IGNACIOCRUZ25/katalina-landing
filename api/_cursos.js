// Configuración compartida de cursos: precios y enlace de entrega (Drive).
// Los precios se usan tanto para crear el pago como para verificarlo.
// 'drive' es el enlace que recibe la alumna al pagar. Pega aquí el de cada curso.

const CURSOS = {
  lif: { name: 'Lifting de pestañas',                              online: 30000, pres: 150000, drive: '' },
  cor: { name: 'Lifting de pestañas · Técnica Coreana',           online: 40000, pres: 150000, drive: '' },
  tej: { name: 'Diseño de cejas con tinte',                       online: 20000, pres: 130000, drive: '' },
  lam: { name: 'Laminado de cejas',                               online: 30000, pres: 150000, drive: '' },
  man: { name: 'Manicure inicial · Esmaltado permanente con torno',              pres: 150000, drive: '' },
  mav: { name: 'Manicure avanzada · Técnica rusa',                         pres: 150000, drive: '' },
};

module.exports = { CURSOS };
