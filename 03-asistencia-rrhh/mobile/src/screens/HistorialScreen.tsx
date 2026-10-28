import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { api } from '../lib/api';
import { fechaCorta, horaLima } from '../lib/formato';
import { Etiqueta } from '../components/Etiqueta';
import { color } from '../tema';

interface Item {
  id: string;
  tipo: 'entrada' | 'salida';
  estado: string;
  marcado_en: string;
  fecha_local: string;
  local: { nombre: string } | null;
}

export function HistorialScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      setItems((await api<{ marcaciones: Item[] }>('/marcaciones/mias')).marcaciones);
      setError('');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  }, []);
  useEffect(() => { void cargar(); }, [cargar]);

  return (
    <FlatList
      style={{ backgroundColor: color.fondo }}
      contentContainerStyle={{ padding: 20, gap: 10 }}
      data={items}
      keyExtractor={(i) => i.id}
      refreshControl={<RefreshControl refreshing={cargando} onRefresh={cargar} />}
      ListHeaderComponent={<Text style={s.titulo}>Mis marcaciones (30 días)</Text>}
      ListEmptyComponent={!cargando ? <Text style={s.vacio}>{error || 'Aún no tienes marcaciones.'}</Text> : null}
      renderItem={({ item }) => (
        <View style={s.fila}>
          <View style={{ flex: 1 }}>
            <Text style={s.principal}>{item.tipo === 'entrada' ? 'Entrada' : 'Salida'} · {horaLima(item.marcado_en)}</Text>
            <Text style={s.secundario}>{fechaCorta(item.fecha_local)} · {item.local?.nombre ?? ''}</Text>
          </View>
          <Etiqueta estado={item.estado} />
        </View>
      )}
    />
  );
}

const s = StyleSheet.create({
  titulo: { fontSize: 22, fontWeight: '700', color: color.marino, marginBottom: 6 },
  vacio: { color: color.gris, textAlign: 'center', marginTop: 30 },
  fila: { backgroundColor: color.blanco, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  principal: { fontWeight: '600', color: color.texto },
  secundario: { color: color.gris, marginTop: 2, fontSize: 13, textTransform: 'capitalize' },
});
