import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './src/lib/supabase';
import { LoginScreen } from './src/screens/LoginScreen';
import { MarcarScreen } from './src/screens/MarcarScreen';
import { HistorialScreen } from './src/screens/HistorialScreen';
import { color } from './src/tema';

type Pestana = 'marcar' | 'historial';

export default function App() {
  const [sesion, setSesion] = useState<Session | null | undefined>(undefined);
  const [pestana, setPestana] = useState<Pestana>('marcar');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSesion(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSesion(s));
    return () => data.subscription.unsubscribe();
  }, []);

  if (sesion === undefined) {
    return <View style={s.centro}><ActivityIndicator color={color.marino} /></View>;
  }
  if (!sesion) return (<><StatusBar style="light" /><LoginScreen /></>);

  return (
    <SafeAreaView style={s.raiz}>
      <StatusBar style="dark" />
      <View style={{ flex: 1 }}>{pestana === 'marcar' ? <MarcarScreen /> : <HistorialScreen />}</View>
      <View style={s.barra} accessibilityRole="tablist">
        {([['marcar', 'Marcar'], ['historial', 'Historial']] as const).map(([clave, texto]) => (
          <Pressable key={clave} style={s.tab} onPress={() => setPestana(clave)} accessibilityRole="tab" accessibilityState={{ selected: pestana === clave }}>
            <Text style={[s.tabTexto, pestana === clave && s.tabActiva]}>{texto}</Text>
          </Pressable>
        ))}
        <Pressable style={s.tab} onPress={() => supabase.auth.signOut()} accessibilityRole="button">
          <Text style={s.tabTexto}>Salir</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: color.fondo },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  barra: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: color.borde, backgroundColor: color.blanco },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabTexto: { color: color.gris, fontWeight: '600' },
  tabActiva: { color: color.turquesaOscuro },
});
