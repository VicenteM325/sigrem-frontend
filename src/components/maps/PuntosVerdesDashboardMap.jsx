// src/components/maps/PuntosVerdesDashboardMap.jsx
import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export const PuntosVerdesDashboardMap = ({ 
  puntos = [], 
  altura = '600px',
  onPuntoClick 
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [popup, setPopup] = useState(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Centrar en Quetzaltenango
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
        // Eliminamos glyphs para evitar errores
      },
      center: [-91.5186, 14.8361],
      zoom: 12
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.current.addControl(new maplibregl.FullscreenControl(), 'top-right');

    map.current.on('load', () => {
      agregarMarcadores();
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (map.current && map.current.loaded()) {
      agregarMarcadores();
    }
  }, [puntos]);

  const agregarMarcadores = () => {
    if (!map.current) return;

    // Limpiar popup anterior
    if (popup) {
      popup.remove();
    }

    // Limpiar capas anteriores
    const estilos = map.current.getStyle();
    if (estilos?.sources) {
      Object.keys(estilos.sources).forEach(sourceId => {
        if (sourceId.startsWith('punto-')) {
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

    const puntosAgrupados = puntos;

    // Colores según capacidad
    const getColorByCapacidad = (capacidad) => {
      if (capacidad >= 100) return '#22c55e';
      if (capacidad >= 50) return '#eab308';
      return '#ef4444';
    };

    // Crear fuente GeoJSON
    map.current.addSource('puntos-verdes', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: puntosAgrupados.map(punto => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [punto.ubicacion.lng, punto.ubicacion.lat]
          },
          properties: {
            id: punto.id,
            nombre: punto.nombre,
            direccion: punto.direccion,
            capacidad: punto.capacidad,
            horario: punto.horario,
            encargado: punto.encargado?.nombre || 'No asignado',
            zona: punto.zona?.nombre || 'Sin zona',
            color: getColorByCapacidad(punto.capacidad)
          }
        }))
      }
    });

    // Capa de círculos con borde blanco
    map.current.addLayer({
      id: 'puntos-verdes-circulos',
      type: 'circle',
      source: 'puntos-verdes',
      paint: {
        'circle-radius': 10,
        'circle-color': ['get', 'color'],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
        'circle-opacity': 0.9
      }
    });

    // Eventos de clic
    map.current.on('click', 'puntos-verdes-circulos', (e) => {
      const coordinates = e.features[0].geometry.coordinates.slice();
      const props = e.features[0].properties;

      const popupContent = `
        <div class="p-3 max-w-xs">
          <h3 class="font-bold text-lg text-gray-900 mb-1">${props.nombre}</h3>
          <p class="text-sm text-gray-600 mb-2">${props.direccion}</p>
          <div class="grid grid-cols-2 gap-2 text-xs mb-2">
            <div>
              <span class="text-gray-500">Capacidad:</span>
              <span class="font-medium text-gray-900 ml-1">${props.capacidad} m³</span>
            </div>
            <div>
              <span class="text-gray-500">Zona:</span>
              <span class="font-medium text-gray-900 ml-1">${props.zona}</span>
            </div>
          </div>
          <p class="text-xs text-gray-600 mb-1">
            <span class="font-medium">Horario:</span> ${props.horario}
          </p>
          <p class="text-xs text-gray-600">
            <span class="font-medium">Encargado:</span> ${props.encargado}
          </p>
          <button 
            class="mt-3 w-full bg-green-600 text-white text-sm py-2 px-3 rounded-lg hover:bg-green-700 transition-colors"
            onclick="window.handleVerDetalle(${props.id})"
          >
            Ver detalles
          </button>
        </div>
      `;

      const newPopup = new maplibregl.Popup()
        .setLngLat(coordinates)
        .setHTML(popupContent)
        .addTo(map.current);

      setPopup(newPopup);
    });

    // Cursor pointer al hover
    map.current.on('mouseenter', 'puntos-verdes-circulos', () => {
      map.current.getCanvas().style.cursor = 'pointer';
    });

    map.current.on('mouseleave', 'puntos-verdes-circulos', () => {
      map.current.getCanvas().style.cursor = '';
    });

    // Ajustar bounds
    if (puntosAgrupados.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      puntosAgrupados.forEach(punto => {
        bounds.extend([punto.ubicacion.lng, punto.ubicacion.lat]);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }
  };

  // Función global para popups
  useEffect(() => {
    window.handleVerDetalle = (id) => {
      if (onPuntoClick) {
        onPuntoClick(id);
      }
    };

    return () => {
      delete window.handleVerDetalle;
    };
  }, [onPuntoClick]);

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-gray-200 shadow-lg">
      <div 
        ref={mapContainer} 
        className="w-full"
        style={{ height: altura }}
      />
      
      {/* Leyenda */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200 z-10">
        <h4 className="font-semibold text-sm text-gray-700 mb-2">Capacidad</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-green-500 rounded-full"></span>
            <span className="text-xs text-gray-600">Alta (≥100 m³)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-yellow-500 rounded-full"></span>
            <span className="text-xs text-gray-600">Media (50-99 m³)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-red-500 rounded-full"></span>
            <span className="text-xs text-gray-600">Baja ({"<"}50 m³)</span>
          </div>
        </div>
      </div>

      {/* Contador de puntos */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-gray-200 z-10">
        <span className="text-sm font-medium text-gray-700">
          📍 {puntos.length} puntos verdes
        </span>
      </div>
    </div>
  );
};