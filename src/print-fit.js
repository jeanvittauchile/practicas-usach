// print-fit.js — Evita que la firma de un PDF quede sola en una hoja nueva.
// Los documentos marcan su bloque de firma con la clase "firma-bloque".
// fitFirmaPrint(w) se llama sobre la ventana de impresión, antes de imprimir.
(function () {
  const PX_POR_MM = 96 / 25.4;
  const TAMANOS_MM = { letter: [215.9, 279.4], a4: [210, 297], legal: [215.9, 355.6] };
  const PAGINA_DEFECTO = 'size: letter; margin: 12mm;';
  const MARGEN_MIN_FIRMA = 36; // px: espacio mínimo para firmar a mano
  const ZOOM_MIN = 0.7;
  const HOLGURA = 0.985; // el navegador redondea distinto al paginar de verdad

  // Área imprimible según la última regla @page del documento.
  function areaImprimible(doc) {
    const css = Array.from(doc.querySelectorAll('style')).map(s => s.textContent).join('\n');
    const reglas = css.match(/@page\s*\{[^}]*\}/g);
    const regla = reglas ? reglas[reglas.length - 1] : PAGINA_DEFECTO;
    const size = (/size\s*:\s*([^;}]+)/.exec(regla) || [, 'letter'])[1].trim().toLowerCase();
    const [ancho, alto] = TAMANOS_MM[size.split(/\s+/)[0]] || TAMANOS_MM.letter;
    const horizontal = /landscape/.test(size);
    const m = ((/margin\s*:\s*([^;}]+)/.exec(regla) || [, '12mm'])[1].match(/[\d.]+/g) || ['12']).map(Number);
    const sup = m[0];
    const der = m[1] != null ? m[1] : sup;
    const inf = m[2] != null ? m[2] : sup;
    const izq = m[3] != null ? m[3] : der;
    return {
      ancho: ((horizontal ? alto : ancho) - izq - der) * PX_POR_MM,
      alto: ((horizontal ? ancho : alto) - sup - inf) * PX_POR_MM,
    };
  }

  // Simula la paginación con columnas CSS (una columna = una hoja), que respetan
  // los saltos reales: filas y bloques con break-inside: avoid no se parten.
  function medir(w, firma, area) {
    const doc = w.document;
    const body = doc.body;
    const previo = body.style.cssText;
    body.style.cssText = previo + `;margin:0;padding:0;width:${area.ancho}px;height:${area.alto}px;` +
      `columns:${area.ancho}px;column-gap:0;column-fill:auto;overflow:visible;`;
    const izq = body.getBoundingClientRect().left;
    const hoja = r => Math.floor((r.left + r.width / 2 - izq) / area.ancho);

    // Al imprimir, el encabezado de tabla se repite en cada hoja, pero no entre columnas:
    // se simula con una copia temporal al comienzo de cada hoja nueva.
    const copias = [];
    Array.from(doc.querySelectorAll('table')).forEach(tabla => {
      if (!tabla.tHead) return;
      let hojaActual = hoja(tabla.tHead.getBoundingClientRect());
      Array.from(tabla.tBodies).forEach(tbody => Array.from(tbody.rows).forEach(fila => {
        const h = hoja(fila.getBoundingClientRect());
        if (h === hojaActual) return;
        hojaActual = h;
        Array.from(tabla.tHead.rows).forEach(enc => {
          const copia = enc.cloneNode(true);
          tbody.insertBefore(copia, fila);
          copias.push(copia);
        });
      }));
    });

    const previoAFirma = doc.createRange();
    previoAFirma.setStart(body, 0);
    previoAFirma.setEndBefore(firma);
    let ultimaConContenido = 0;
    Array.from(previoAFirma.getClientRects()).forEach(r => {
      if (r.width > 0 && r.height > 0) ultimaConContenido = Math.max(ultimaConContenido, hoja(r));
    });
    const hojaFirma = Array.from(firma.getClientRects()).reduce((max, r) => Math.max(max, hoja(r)), 0);
    const totalHojas = Math.ceil((body.scrollWidth - 1) / area.ancho);
    copias.forEach(copia => copia.remove());
    body.style.cssText = previo;
    return hojaFirma <= ultimaConContenido && totalHojas <= ultimaConContenido + 1;
  }

  // Debe caber en ambas: con la holgura sola, una fila desplazada de más puede simular
  // compañía en la hoja de la firma, que en el papel real queda sola.
  function firmaCabe(w, firma, area) {
    return medir(w, firma, area) && medir(w, firma, { ancho: area.ancho, alto: area.alto * HOLGURA });
  }

  function fitFirmaPrint(w) {
    const doc = w.document;
    if (doc.__firmaAjustada) return;
    const firmas = doc.querySelectorAll('.firma-bloque');
    if (!firmas.length) return;
    doc.__firmaAjustada = true;
    const firma = firmas[firmas.length - 1];

    const tienePage = Array.from(doc.querySelectorAll('style')).some(s => /@page\s*\{/.test(s.textContent));
    const estilo = doc.createElement('style');
    estilo.textContent = (tienePage ? '' : `@page { ${PAGINA_DEFECTO} }\n`) +
      '.firma-bloque { break-inside: avoid; page-break-inside: avoid; }\n' +
      // El margen de hoja ya lo da @page: el de la vista previa solo empujaría la firma.
      '.pdf-page { margin: 0 auto !important; padding-top: 0 !important; padding-bottom: 0 !important; box-shadow: none !important; }\n' +
      '@media print { .no-print { display: none !important; } }';
    doc.head.insertBefore(estilo, doc.head.firstChild);

    const area = areaImprimible(doc);
    const ocultos = Array.from(doc.querySelectorAll('.no-print'));
    const displayPrevio = ocultos.map(el => el.style.display);
    ocultos.forEach(el => { el.style.display = 'none'; });
    const hijos = Array.from(doc.body.children);
    const aplicarZoom = z => hijos.forEach(el => { el.style.zoom = z === 1 ? '' : String(z); });

    try {
      if (firmaCabe(w, firma, area)) return;

      // La firma puede ser el propio bloque o, en la carta, ir dentro junto a la despedida.
      const conEspacio = [firma, ...firma.querySelectorAll('.firma')]
        .filter(el => parseFloat(w.getComputedStyle(el).marginTop) > MARGEN_MIN_FIRMA);
      const margenesPrevios = conEspacio.map(el => el.style.marginTop);
      if (conEspacio.length) {
        conEspacio.forEach(el => { el.style.marginTop = MARGEN_MIN_FIRMA + 'px'; });
        if (firmaCabe(w, firma, area)) return;
      }

      for (let z = 0.99; z >= ZOOM_MIN; z -= 0.01) {
        aplicarZoom(z);
        if (firmaCabe(w, firma, area)) return;
      }
      // Sin solución razonable: mejor el documento legible a tamaño normal.
      aplicarZoom(1);
      conEspacio.forEach((el, i) => { el.style.marginTop = margenesPrevios[i]; });
    } finally {
      ocultos.forEach((el, i) => { el.style.display = displayPrevio[i]; });
    }
  }

  window.fitFirmaPrint = fitFirmaPrint;
})();
