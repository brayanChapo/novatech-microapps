import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { color } from '../tema';

export function LoginScreen() {
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function ingresar() {
    setError('');
    setEnviando(true);
    const { error } = await supabase.auth.signInWithPassword({ email: correo.trim().toLowerCase(), password: clave });
    setEnviando(false);
    if (error) setError('Correo o contraseña incorrectos.');
  }

  return (
    <KeyboardAvoidingView style={s.fondo} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.tarjeta}>
        <Text style={s.marca}>NOVATECH · ASISTENCIA</Text>
        <Text style={s.titulo}>Marca tu asistencia</Text>
        <Text style={s.etiqueta}>Correo</Text>
        <TextInput style={s.input} autoCapitalize="none" keyboardType="email-address" autoComplete="email"
          value={correo} onChangeText={setCorreo} placeholder="tu@empresa.pe" accessibilityLabel="Correo" />
        <Text style={s.etiqueta}>Contraseña</Text>
        <TextInput style={s.input} secureTextEntry autoComplete="password" value={clave} onChangeText={setClave}
          accessibilityLabel="Contraseña" onSubmitEditing={ingresar} />
        {!!error && <Text style={s.error} accessibilityRole="alert">{error}</Text>}
        <Pressable style={[s.boton, enviando && { opacity: 0.6 }]} onPress={ingresar} disabled={enviando || !correo || !clave} accessibilityRole="button">
          {enviando ? <ActivityIndicator color={color.blanco} /> : <Text style={s.botonTexto}>Ingresar</Text>}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: color.marino, justifyContent: 'center', padding: 20 },
  tarjeta: { backgroundColor: color.blanco, borderRadius: 20, padding: 24 },
  marca: { color: color.turquesaOscuro, fontSize: 11, letterSpacing: 2, fontWeight: '600' },
  titulo: { color: color.marino, fontSize: 24, fontWeight: '700', marginTop: 6, marginBottom: 12 },
  etiqueta: { color: color.texto, fontWeight: '600', marginTop: 12, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: color.borde, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  error: { color: color.error, backgroundColor: color.errorFondo, padding: 10, borderRadius: 10, marginTop: 14 },
  boton: { backgroundColor: color.marino, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 20 },
  botonTexto: { color: color.blanco, fontWeight: '700', fontSize: 16 },
});
