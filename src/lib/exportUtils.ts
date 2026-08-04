import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toPng } from 'html-to-image';
import { TerritorioRecord } from '../types.ts';

/**
 * Exporta los registros a archivo CSV compatible con Excel
 */
export function exportToCSV(records: TerritorioRecord[], filename = 'territoriomix_registros.csv') {
  const headers = [
    'ID',
    'Territorio',
    'Manzana',
    'Calle',
    'Numeración',
    'Calle y Numeración',
    'Tipo de Edificación',
    'Pisos',
    'Cantidad de Departamentos',
    'Portería/Vigilancia',
    'Observaciones',
    'Creado Por',
    'Fecha Creación',
  ];

  const rows = records.map((r) => [
    r.id,
    r.territorio,
    r.manzana,
    r.calle || '',
    r.numeracion || '',
    r.calleNumeracion,
    r.tipoEdificacion,
    r.pisos || '',
    r.cantidadDepartamentos || '',
    r.porteriaVigilancia || '',
    r.observaciones || '',
    r.createdByName,
    new Date(r.createdAt).toLocaleString('es-AR'),
  ]);

  const escapeCSV = (val: string) => {
    const stringified = String(val).replace(/"/g, '""');
    return `"${stringified}"`;
  };

  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.map(escapeCSV).join(',')),
  ].join('\r\n');

  // UTF-8 BOM para que Excel en Windows lo interprete con acentos de español
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exporta registros a PDF formal y profesional en formato vertical 9:16
 */
export function exportToPDF(records: TerritorioRecord[], filename = 'territoriomix_reporte.pdf') {
  // Hoja en formato vertical (portrait) con relación de aspecto 9:16 (216mm x 384mm)
  const pageWidth = 216;
  const pageHeight = 384;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [pageWidth, pageHeight],
  });

  // Encabezado del documento
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('TerritorioMix - Reporte Territorial', 12, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generado: ${new Date().toLocaleString('es-AR')} • Total: ${records.length} registros`, 12, 20);

  const tableBody = records.map((r) => {
    let tipoText = r.tipoEdificacion;
    if (r.tipoEdificacion === 'Departamentos' && (r.pisos || r.cantidadDepartamentos || r.porteriaVigilancia)) {
      const details = [
        r.pisos ? `Pisos: ${r.pisos}` : '',
        r.cantidadDepartamentos ? `Dptos: ${r.cantidadDepartamentos}` : '',
        r.porteriaVigilancia ? `Portería: ${r.porteriaVigilancia}` : '',
      ]
        .filter(Boolean)
        .join(' | ');
      if (details) {
        tipoText += `\n(${details})`;
      }
    }
    return [
      `${r.territorio} - ${r.manzana}`,
      r.calleNumeracion || `${r.calle || ''} ${r.numeracion || ''}`.trim(),
      tipoText,
      r.observaciones || '-',
      r.createdByName,
      new Date(r.createdAt).toLocaleDateString('es-AR'),
    ];
  });

  autoTable(doc, {
    startY: 32,
    head: [
      [
        'Terr. - Mza.',
        'Calle y N°',
        'Edificación',
        'Observaciones',
        'Censista',
        'Fecha',
      ],
    ],
    body: tableBody,
    styles: {
      fontSize: 8.5,
      cellPadding: 2.5,
      textColor: [30, 41, 59],
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [37, 99, 235], // blue-600
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // slate-50
    },
    margin: { top: 32, left: 12, right: 12, bottom: 15 },
  });

  doc.save(filename);
}

/**
 * Exporta un elemento DOM o tarjeta de resumen a imagen PNG en alta resolución (para dispositivos móviles)
 */
export async function exportElementToPNG(
  elementId: string,
  filename = 'territoriomix_resumen.png'
): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) return false;

  try {
    const dataUrl = await toPng(element, {
      cacheBust: true,
      backgroundColor: '#f8fafc', // slate-50 background
      pixelRatio: 2,
    });

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (err) {
    console.error('Error exportando PNG:', err);
    return false;
  }
}
