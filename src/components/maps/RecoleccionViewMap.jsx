import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export const RecoleccionViewMap = ({ ruta, puntosRecolectados = [] }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (!mapContainer.current || map.current || !ruta?.coordenadas) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap"
          }
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm"
          }
        ]
      },
      center: [ruta.coordenadas.inicio.lng, ruta.coordenadas.inicio.lat],
      zoom: 12
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    map.current.on("load", () => {

      const coordinates = [
        [ruta.coordenadas.inicio.lng, ruta.coordenadas.inicio.lat],
        ...(ruta.puntos_intermedios?.map(p => [p.lng, p.lat]) || []),
        [ruta.coordenadas.fin.lng, ruta.coordenadas.fin.lat]
      ];

      // LINEA DE RUTA
      map.current.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates
          }
        }
      });

      map.current.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        paint: {
          "line-color": "#3b82f6",
          "line-width": 5
        }
      });

      // CREAR PUNTOS CON ESTADO
      const puntos = ruta.puntos_intermedios?.map((p, index) => {

        const estado = puntosRecolectados.find(
          pr => pr.index === index
        );

        return {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [p.lng, p.lat]
          },
          properties: {
            estado: estado?.estado || "pendiente"
          }
        };

      }) || [];

      map.current.addSource("points", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: puntos
        }
      });

      map.current.addLayer({
        id: "points",
        type: "circle",
        source: "points",
        paint: {
          "circle-radius": 7,
          "circle-color": [
            "match",
            ["get", "estado"],
            "recolectado", "#10b981",
            "problema", "#ef4444",
            "#f59e0b"
          ],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff"
        }
      });

    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };

  }, [ruta, puntosRecolectados]);

  return <div ref={mapContainer} className="w-full h-full" />;
};