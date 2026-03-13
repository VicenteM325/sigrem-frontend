// src/components/maps/RutaViewMap.jsx
import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export const RutaViewMap = ({ ruta }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (!mapContainer.current || map.current || !ruta?.coordenadas) return;

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
      center: [ruta.coordenadas.inicio.lng, ruta.coordenadas.inicio.lat],
      zoom: 12
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      const coordinates = [
        [ruta.coordenadas.inicio.lng, ruta.coordenadas.inicio.lat],
        ...(ruta.puntos_intermedios?.map(p => [p.lng, p.lat]) || []),
        [ruta.coordenadas.fin.lng, ruta.coordenadas.fin.lat]
      ];

      // Línea de la ruta
      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: coordinates
          }
        }
      });

      map.current.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        paint: {
          'line-color': '#3b82f6',
          'line-width': 5,
          'line-opacity': 0.8
        }
      });

      // Puntos
      const points = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [ruta.coordenadas.inicio.lng, ruta.coordenadas.inicio.lat] },
            properties: { type: 'inicio' }
          },
          ...(ruta.puntos_intermedios?.map((p, i) => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
            properties: { type: 'intermedio', index: i + 1 }
          })) || []),
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [ruta.coordenadas.fin.lng, ruta.coordenadas.fin.lat] },
            properties: { type: 'fin' }
          }
        ]
      };

      map.current.addSource('points', { type: 'geojson', data: points });

      map.current.addLayer({
        id: 'points',
        type: 'circle',
        source: 'points',
        filter: ['!=', ['get', 'type'], 'intermedio'],
        paint: {
          'circle-radius': 8,
          'circle-color': [
            'match',
            ['get', 'type'],
            'inicio', '#10b981',
            'fin', '#ef4444',
            '#3b82f6'
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });

      map.current.addLayer({
        id: 'intermediate-points',
        type: 'circle',
        source: 'points',
        filter: ['==', ['get', 'type'], 'intermedio'],
        paint: {
          'circle-radius': 6,
          'circle-color': '#3b82f6',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });

      // Ajustar zoom
      const bounds = coordinates.reduce((bounds, coord) => {
        return bounds.extend(coord);
      }, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));

      map.current.fitBounds(bounds, { padding: 50 });
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [ruta]);

  return <div ref={mapContainer} className="w-full h-full" />;
};