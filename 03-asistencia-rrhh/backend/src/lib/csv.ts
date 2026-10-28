/** Genera CSV compatible con Excel en español (separador ";" y BOM UTF-8). */
export function aCsv(encabezados: string[], filas: (string | number | boolean | null | undefined)[][]): string {
  const celda = (v: string | number | boolean | null | undefined) => {
    if (v === null || v === undefined) return '';
    let s = String(v);
    // Evita inyección de fórmulas al abrir en Excel
    if (/^[=+\-@]/.test(s)) s = `'${s}`;
    return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lineas = [encabezados, ...filas].map((f) => f.map(celda).join(';'));
  return '﻿' + lineas.join('\r\n') + '\r\n';
}
