import { StyleSheet, Text, View } from 'react-native';
import { ESTADOS } from '../lib/formato';
import { color } from '../tema';

const TONOS = {
  ok: { fondo: color.okFondo, texto: color.ok },
  alerta: { fondo: color.alertaFondo, texto: color.alerta },
  error: { fondo: color.errorFondo, texto: color.error },
  neutro: { fondo: '#F2F4F7', texto: color.gris },
};

export function Etiqueta({ estado }: { estado: string }) {
  const e = ESTADOS[estado] ?? { texto: estado, tono: 'neutro' as const };
  const t = TONOS[e.tono];
  return (
    <View style={[s.caja, { backgroundColor: t.fondo }]}>
      <Text style={[s.texto, { color: t.texto }]}>{e.texto}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  caja: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' },
  texto: { fontSize: 12, fontWeight: '600' },
});
