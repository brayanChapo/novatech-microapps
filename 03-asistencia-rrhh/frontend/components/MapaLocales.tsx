'use client';
import { useEffect } from 'react';
import { Circle, CircleMarker, MapContainer, TileLayer, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import { latLng, latLngBounds } from 'leaflet';

export interface PuntoMapa {
  id: string;
  nombre: string;
  lat: number;
  lng: number;
  radio_m: number;
  porcentaje?: number | null;
  etiqueta?: string;
}

function colorPorcentaje(p: number | null | undefined) {
  if (p === null || p === undefined) return '#64748b';
  if (p >= 90) return '#059669';
  if (p >= 70) return '#d97706';
  return '#dc2626';
}

/** Encuadra el mapa para que se vean todos los locales con su geocerca completa. */
function Encuadre({ puntos }: { puntos: PuntoMapa[] }) {
  const mapa = useMap();
  const clave = puntos.map((p) => `${p.lat},${p.lng},${p.radio_m}`).join('|');
  useEffect(() => {
    if (puntos.length === 0) return;
    const limites = latLngBounds(puntos.map((p) => latLng(p.lat, p.lng).toBounds(p.radio_m * 2)).flatMap((b) => [b.getSouthWest(), b.getNorthEast()]));
    mapa.fitBounds(limites, { padding: [30, 30], maxZoom: 17 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave, mapa]);
  return null;
}

function SelectorClic({ alElegir }: { alElegir: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => alElegir(e.latlng.lat, e.latlng.lng) });
  return null;
}

/** Mapa con OpenStreetMap (sin costo). Muestra cada local con su geocerca. */
export default function MapaLocales({ puntos, alHacerClic, alElegirPunto, alto = 360 }: {
  puntos: PuntoMapa[];
  alHacerClic?: (id: string) => void;
  alElegirPunto?: (lat: number, lng: number) => void;
  alto?: number;
}) {
  const centroLima: [number, number] = [-12.0864, -77.0353];

  return (
    <MapContainer
      center={puntos[0] ? [puntos[0].lat, puntos[0].lng] : centroLima}
      zoom={12}
      style={{ height: alto, width: '100%', borderRadius: 12 }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Encuadre puntos={puntos} />
      {alElegirPunto && <SelectorClic alElegir={alElegirPunto} />}
      {puntos.map((p) => {
        const color = colorPorcentaje(p.porcentaje);
        return (
          <div key={p.id}>
            <Circle center={[p.lat, p.lng]} radius={p.radio_m} pathOptions={{ color, fillOpacity: 0.12, weight: 1 }} />
            <CircleMarker
              center={[p.lat, p.lng]}
              radius={9}
              pathOptions={{ color: '#fff', weight: 2, fillColor: color, fillOpacity: 1 }}
              eventHandlers={alHacerClic ? { click: () => alHacerClic(p.id) } : undefined}
            >
              <Tooltip direction="top" offset={[0, -8]}>
                <strong>{p.nombre}</strong>
                {p.etiqueta ? <><br />{p.etiqueta}</> : null}
              </Tooltip>
            </CircleMarker>
          </div>
        );
      })}
    </MapContainer>
  );
}
