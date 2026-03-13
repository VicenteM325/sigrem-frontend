import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export const RutasSelectMap = ({ 
  rutas = [], 
  ubicacion, 
  onMapClick,
  altura = '500px' 
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Determinar centro del mapa
    let centro = [ubicacion.lng, ubicacion.lat];
    if (rutas.length > 0 && rutas[0].coordenadas?.inicio) {
      centro = [rutas[0].coordenadas.inicio.lng, rutas[0].coordenadas.inicio.lat];
    }

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap'
          }
        },
        layers: [{
          id: 'osm',
          type: 'raster',
          source: 'osm'
        }]
      },
      center: centro,
      zoom: 14
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      // Dibujar todas las rutas
      dibujarRutas();

      // Agregar marcador
      marker.current = new maplibregl.Marker({ color: '#22c55e', draggable: true })
        .setLngLat([ubicacion.lng, ubicacion.lat])
        .addTo(map.current);

      // Eventos del marcador
      marker.current.on('dragend', () => {
        const lngLat = marker.current.getLngLat();
        onMapClick({ lat: lngLat.lat, lng: lngLat.lng });
      });

      // Click en el mapa
      map.current.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        if (marker.current) {
          marker.current.setLngLat([lng, lat]);
        }
        onMapClick({ lat, lng });
      });

      // Ajustar bounds para mostrar todas las rutas
      ajustarBounds();
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Actualizar cuando cambian las rutas
  useEffect(() => {
    if (map.current && map.current.loaded()) {
      dibujarRutas();
      ajustarBounds();
    }
  }, [rutas]);

  // Actualizar marcador cuando cambia la ubicación
  useEffect(() => {
    if (marker.current && map.current) {
      marker.current.setLngLat([ubicacion.lng, ubicacion.lat]);
      map.current.flyTo({
        center: [ubicacion.lng, ubicacion.lat],
        zoom: 15
      });
    }
  }, [ubicacion]);

  const ajustarBounds = () => {
    if (!map.current || rutas.length === 0) return;

    const bounds = new maplibregl.LngLatBounds();
    let tieneCoordenadas = false;

    rutas.forEach(ruta => {
      if (ruta.coordenadas?.inicio) {
        bounds.extend([ruta.coordenadas.inicio.lng, ruta.coordenadas.inicio.lat]);
        tieneCoordenadas = true;
      }
      if (ruta.coordenadas?.fin) {
        bounds.extend([ruta.coordenadas.fin.lng, ruta.coordenadas.fin.lat]);
        tieneCoordenadas = true;
      }
      if (ruta.puntos_intermedios && Array.isArray(ruta.puntos_intermedios)) {
        ruta.puntos_intermedios.forEach(p => {
          if (p && p.lng !== undefined && p.lat !== undefined) {
            bounds.extend([p.lng, p.lat]);
            tieneCoordenadas = true;
          }
        });
      }
    });

    if (tieneCoordenadas) {
      map.current.fitBounds(bounds, { padding: 50 });
    }
  };

  const dibujarRutas = () => {
    if (!map.current || !rutas.length) return;

    // Limpiar capas y fuentes anteriores
    const estilos = map.current.getStyle();
    if (estilos?.sources) {
      Object.keys(estilos.sources).forEach(sourceId => {
        if (sourceId.startsWith('ruta-')) {
          const layerId = sourceId.replace('source', 'layer');
          if (map.current.getLayer(layerId)) {
            map.current.removeLayer(layerId);
          }
          if (map.current.getSource(sourceId)) {
            map.current.removeSource(sourceId);
          }
        }
      });
    }

    // Dibujar cada ruta
    rutas.forEach((ruta, index) => {
      // Verificar que la ruta tenga coordenadas válidas
      if (!ruta.coordenadas?.inicio || !ruta.coordenadas?.fin) {
        console.warn('Ruta sin coordenadas válidas:', ruta);
        return;
      }

      const sourceId = `ruta-source-${ruta.id || index}`;
      const layerId = `ruta-layer-${ruta.id || index}`;

      // Construir coordenadas
      const coordenadas = [
        [ruta.coordenadas.inicio.lng, ruta.coordenadas.inicio.lat],
        ...(ruta.puntos_intermedios || []).map(p => [p.lng, p.lat]),
        [ruta.coordenadas.fin.lng, ruta.coordenadas.fin.lat]
      ];

      try {
        map.current.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: coordenadas
            },
            properties: {
              nombre: ruta.nombre,
              id: ruta.id
            }
          }
        });

        // Color basado en el índice
        const colores = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
        const color = colores[index % colores.length];

        map.current.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': color,
            'line-width': 5,
            'line-opacity': 0.8,
            'line-dasharray': [2, 1]
          }
        });

      } catch (error) {
        console.error('Error dibujando ruta:', error);
      }
    });
  };

  return (
    <div 
      ref={mapContainer} 
      className="w-full rounded-lg overflow-hidden border border-gray-200"
      style={{ height: altura }}
    />
  );
};
