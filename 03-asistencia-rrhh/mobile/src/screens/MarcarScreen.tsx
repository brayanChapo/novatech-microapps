import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, AppState, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { api, ErrorApi, type EstadoHoy } from '../lib/api';
import { distanciaMetros, formatoDistancia } from '../lib/geo';
import { horaLima } from '../lib/formato';
import { useUbicacionEnVivo } from '../hooks/useUbicacionEnVivo';
import { Etiqueta } from '../components/Etiqueta';
import { color } from '../tema';

type Aviso = { tipo: 'ok' | 'error'; texto: string } | null;

export function MarcarScreen() {
  const [hoy, setHoy] = useState<EstadoHoy | null>(null);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState<Aviso>(null);
  const puedeMarcar = !!hoy?.asignacion && hoy.siguiente !== null;
  const { estado: gps, reintentar, abrirAjustes } = useUbicacionEnVivo(puedeMarcar);

  const cargar = useCallback(async () => {
    try {
      setHoy(await api<EstadoHoy>('/yo'));
    } catch (e) {
      setAviso({ tipo: 'error', texto: (e as Error).message });
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
    const sub = AppState.addEventListener('change', (s) => { if (s === 'active') void cargar(); });
    const t = setInterval(() => void cargar(), 60_000);
    return () => { sub.remove(); clearInterval(t); };
  }, [cargar]);

  if (cargando) return <View style={s.centro}><ActivityIndicator size="large" color={color.marino} /></View>;

  const local = hoy?.asignacion?.local;
  const ubic = gps.tipo === 'ok' ? gps.ubicacion : null;
  const distancia = local && ubic ? distanciaMetros(ubic, local) : null;
  const dentro = distancia !== null && local ? distancia <= local.radio_m : false;
  const precisionOk = ubic ? ubic.precision_m <= (hoy?.reglas.precision_max_m ?? 50) : false;
  const permiteFuera = hoy?.reglas.politica_fuera_geocerca === 'observar';
  const habilitado = !!ubic && precisionOk && !ubic.simulada && (dentro || permiteFuera) && !enviando;

  async function marcar() {
    if (!ubic || !hoy?.siguiente) return;
    setEnviando(true);
    setAviso(null);
    try {
      const r = await api<{ mensaje: string }>('/marcaciones', {
        method: 'POST',
        body: JSON.stringify({
          tipo: hoy.siguiente,
          lat: ubic.lat,
          lng: ubic.lng,
          precision_m: ubic.precision_m,
          ubicacion_simulada: ubic.simulada,
          dispositivo: {
            plataforma: Platform.OS,
            modelo: Device.modelName ?? undefined,
            version_app: Constants.expoConfig?.version,
          },
        }),
      });
      setAviso({ tipo: 'ok', texto: r.mensaje });
      await cargar();
    } catch (e) {
      const err = e as ErrorApi;
      setAviso({ tipo: 'error', texto: err.message });
      if (err.codigo === 'JORNADA_COMPLETA' || err.codigo === 'MARCACION_DUPLICADA') await cargar();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <ScrollView style={s.fondo} contentContainerStyle={{ padding: 20, gap: 16 }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={cargar} />}>
      <View>
        <Text style={s.saludo}>Hola, {hoy?.usuario.nombre.split(' ')[0]}</Text>
        <Text style={s.sub}>Hora del servidor: {hoy?.hora_servidor}</Text>
      </View>

      {!hoy?.asignacion ? (
        <View style={s.tarjeta}>
          <Text style={s.tituloTarjeta}>Sin local asignado</Text>
          <Text style={s.texto}>Pide a tu administrador que te asigne un local y un horario para poder marcar.</Text>
        </View>
      ) : (
        <>
          <View style={s.tarjeta}>
            <Text style={s.etiquetaPeq}>TU LOCAL</Text>
            <Text style={s.tituloTarjeta}>{local?.nombre}</Text>
            <Text style={s.texto}>
              {hoy.asignacion.horario.nombre} · {hoy.asignacion.horario.hora_entrada.slice(0, 5)}–{hoy.asignacion.horario.hora_salida.slice(0, 5)}
            </Text>
          </View>

          {hoy.siguiente === null ? (
            <View style={[s.tarjeta, { backgroundColor: color.okFondo }]}>
              <Text style={[s.tituloTarjeta, { color: color.ok }]}>Jornada completa ✓</Text>
              <Text style={s.texto}>Ya registraste tu entrada y tu salida de hoy.</Text>
            </View>
          ) : (
            <View style={[s.tarjeta, { alignItems: 'center' }]}>
              <EstadoGps gps={gps} reintentar={reintentar} abrirAjustes={abrirAjustes} />
              {ubic && distancia !== null && (
                <>
                  <View style={[s.circulo, { borderColor: dentro ? color.ok : color.error, backgroundColor: dentro ? color.okFondo : color.errorFondo }]}>
                    <Text style={[s.distancia, { color: dentro ? color.ok : color.error }]}>{formatoDistancia(distancia)}</Text>
                    <Text style={s.texto}>{dentro ? 'Estás en tu local' : 'del local'}</Text>
                  </View>
                  <Text style={s.texto}>Radio permitido: {local?.radio_m} m · Precisión GPS: ±{Math.round(ubic.precision_m)} m</Text>
                  {!precisionOk && <Text style={s.advertencia}>Señal GPS débil. Acércate a una ventana o sal al exterior.</Text>}
                  {ubic.simulada && <Text style={s.advertencia}>Se detectó una ubicación simulada. Desactiva apps de GPS falso.</Text>}
                  {!dentro && permiteFuera && <Text style={s.advertencia}>Estás fuera del local: tu marcación quedará como observada.</Text>}
                </>
              )}
              <Pressable onPress={marcar} disabled={!habilitado} accessibilityRole="button"
                style={[s.boton, { backgroundColor: hoy.siguiente === 'entrada' ? color.ok : color.marino }, !habilitado && { opacity: 0.4 }]}>
                {enviando ? <ActivityIndicator color={color.blanco} /> : (
                  <Text style={s.botonTexto}>{hoy.siguiente === 'entrada' ? 'MARCAR ENTRADA' : 'MARCAR SALIDA'}</Text>
                )}
              </Pressable>
              {!dentro && !permiteFuera && ubic && <Text style={s.sub}>Acércate a tu local para habilitar el botón.</Text>}
            </View>
          )}
        </>
      )}

      {aviso && (
        <View style={[s.aviso, { backgroundColor: aviso.tipo === 'ok' ? color.okFondo : color.errorFondo }]} accessibilityLiveRegion="polite">
          <Text style={{ color: aviso.tipo === 'ok' ? color.ok : color.error, fontWeight: '600' }}>{aviso.texto}</Text>
        </View>
      )}

      {!!hoy?.marcaciones.length && (
        <View style={s.tarjeta}>
          <Text style={s.etiquetaPeq}>HOY</Text>
          {hoy.marcaciones.map((m) => (
            <View key={m.id} style={s.fila}>
              <Text style={s.texto}>{m.tipo === 'entrada' ? 'Entrada' : 'Salida'} · {horaLima(m.marcado_en)}</Text>
              <Etiqueta estado={m.estado} />
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function EstadoGps({ gps, reintentar, abrirAjustes }: {
  gps: ReturnType<typeof useUbicacionEnVivo>['estado'];
  reintentar: () => void;
  abrirAjustes: () => void;
}) {
  if (gps.tipo === 'ok') return null;
  const textos = {
    cargando: 'Buscando tu ubicación…',
    sin_permiso: 'Necesitamos permiso de ubicación para verificar que estás en tu local.',
    gps_apagado: 'Tu GPS está apagado. Actívalo para marcar.',
    error: gps.tipo === 'error' ? gps.mensaje : '',
  } as const;
  return (
    <View style={{ alignItems: 'center', gap: 10, marginBottom: 12 }}>
      {gps.tipo === 'cargando' && <ActivityIndicator color={color.marino} />}
      <Text style={[s.texto, { textAlign: 'center' }]}>{textos[gps.tipo]}</Text>
      {gps.tipo === 'sin_permiso' && !gps.puedePreguntar ? (
        <Pressable onPress={abrirAjustes}><Text style={s.enlace}>Abrir ajustes del celular</Text></Pressable>
      ) : gps.tipo !== 'cargando' ? (
        <Pressable onPress={reintentar}><Text style={s.enlace}>Reintentar</Text></Pressable>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: color.fondo },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  saludo: { fontSize: 24, fontWeight: '700', color: color.marino },
  sub: { color: color.gris, marginTop: 4, textAlign: 'center' },
  tarjeta: { backgroundColor: color.blanco, borderRadius: 16, padding: 18, gap: 6 },
  etiquetaPeq: { fontSize: 11, letterSpacing: 1.5, color: color.turquesaOscuro, fontWeight: '700' },
  tituloTarjeta: { fontSize: 18, fontWeight: '700', color: color.marino },
  texto: { color: color.texto },
  advertencia: { color: color.alerta, backgroundColor: color.alertaFondo, padding: 8, borderRadius: 8, marginTop: 6, textAlign: 'center' },
  circulo: { width: 180, height: 180, borderRadius: 90, borderWidth: 6, alignItems: 'center', justifyContent: 'center', marginVertical: 12 },
  distancia: { fontSize: 36, fontWeight: '800' },
  boton: { marginTop: 16, alignSelf: 'stretch', borderRadius: 14, paddingVertical: 18, alignItems: 'center' },
  botonTexto: { color: color.blanco, fontWeight: '800', fontSize: 17, letterSpacing: 1 },
  aviso: { borderRadius: 12, padding: 14 },
  fila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#F2F4F7' },
  enlace: { color: color.turquesaOscuro, fontWeight: '700' },
});
