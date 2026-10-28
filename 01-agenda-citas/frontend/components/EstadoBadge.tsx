import { Badge } from '@/components/ui';

const CONFIG_ESTADO: Record<string, { texto: string; tono: 'gris' | 'verde' | 'rojo' | 'azul' | 'naranja' | 'amarillo' }> = {
  reservada: { texto: 'Reservada', tono: 'gris' },
  confirmada: { texto: 'Confirmada', tono: 'verde' },
  cancelada: { texto: 'Cancelada', tono: 'rojo' },
  asistio: { texto: 'Asistió', tono: 'azul' },
  no_asistio: { texto: 'No asistió', tono: 'naranja' },
  reprogramada: { texto: 'Reprogramada', tono: 'amarillo' },
};

export function EstadoBadge({ estado }: { estado: string }) {
  const config = CONFIG_ESTADO[estado] ?? { texto: estado, tono: 'gris' as const };
  return <Badge tono={config.tono}>{config.texto}</Badge>;
}
