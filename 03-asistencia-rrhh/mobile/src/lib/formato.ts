export function horaLima(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('es-PE', { timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit', hour12: false });
}

export function fechaCorta(fecha: string): string {
  return new Date(`${fecha}T12:00:00Z`).toLocaleDateString('es-PE', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short' });
}

export const ESTADOS: Record<string, { texto: string; tono: 'ok' | 'alerta' | 'error' | 'neutro' }> = {
  a_tiempo: { texto: 'A tiempo', tono: 'ok' },
  tardanza: { texto: 'Tardanza', tono: 'alerta' },
  salida: { texto: 'Salida', tono: 'neutro' },
  salida_anticipada: { texto: 'Salida anticipada', tono: 'alerta' },
  observada: { texto: 'Observada', tono: 'error' },
  extra: { texto: 'Día no programado', tono: 'neutro' },
};
