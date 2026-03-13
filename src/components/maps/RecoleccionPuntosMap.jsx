import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export const RecoleccionPuntosMap = ({ puntos = [] }) => {

  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {

    if (!mapContainer.current || map.current || puntos.length === 0) return;

    const first = puntos[0];

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
        layers: [{
          id: "osm",
          type: "raster",
          source: "osm"
        }]
      },
      center: [first.longitud, first.latitud],
      zoom: 15
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    map.current.on("load", () => {

      // Convertir puntos a GeoJSON
      const features = puntos.map((p, i) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [p.longitud, p.latitud]
        },
        properties: {
          estado: p.estado,
          volumen: p.volumen_estimado,
          numero: i + 1
        }
      }));

      map.current.addSource("puntos", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features
        }
      });

      // Línea del recorrido
      map.current.addSource("ruta", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: puntos.map(p => [p.longitud, p.latitud])
          }
        }
      });

      map.current.addLayer({
        id: "ruta-linea",
        type: "line",
        source: "ruta",
        paint: {
          "line-color": "#3b82f6",
          "line-width": 4
        }
      });

      // Puntos
      map.current.addLayer({
        id: "puntos-layer",
        type: "circle",
        source: "puntos",
        paint: {
          "circle-radius": 7,
          "circle-color": [
            "match",
            ["get", "estado"],
            "recolectado", "#10b981",
            "pendiente", "#f59e0b",
            "problema", "#ef4444",
            "#3b82f6"
          ],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff"
        }
      });

      // Popup con descripción
      map.current.on("click", "puntos-layer", (e) => {

        const props = e.features[0].properties;
        const coords = e.features[0].geometry.coordinates;

        new maplibregl.Popup()
          .setLngLat(coords)
          .setHTML(`
            <div style="font-size:14px">
              <strong>Punto #${props.numero}</strong><br/>
              Estado: ${props.estado}<br/>
              Volumen estimado: ${props.volumen} kg
            </div>
          `)
          .addTo(map.current);

      });

      map.current.on("mouseenter", "puntos-layer", () => {
        map.current.getCanvas().style.cursor = "pointer";
      });

      map.current.on("mouseleave", "puntos-layer", () => {
        map.current.getCanvas().style.cursor = "";
      });

      // Ajustar mapa a todos los puntos
      const bounds = puntos.reduce((b, p) => {
        return b.extend([p.longitud, p.latitud]);
      }, new maplibregl.LngLatBounds(
        [first.longitud, first.latitud],
        [first.longitud, first.latitud]
      ));

      map.current.fitBounds(bounds, { padding: 50 });

    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };

  }, [puntos]);

  return <div ref={mapContainer} className="w-full h-full" />;
};