// src/pages/dashboard/rutas/RutaForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import maplibregl from 'maplibre-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import { rutaService } from '@/services/rutaService';
import { zonaService } from '@/services/zonaService';
import { catalogoService } from '@/services/catalogoService';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export const RutaForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const draw = useRef(null);

  // Estados
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [zonas, setZonas] = useState([]);
  const [tiposResiduo, setTiposResiduo] = useState([]);

  // Datos del formulario
  const [formData, setFormData] = useState({
    nombre_ruta: '',
    descripcion: '',
    id_zona: '',
    horario_inicio: '06:00',
    horario_fin: '12:00',
    dias_recoleccion: [],
    tipos_residuo: [],
    distancia_km: 0
  });

  // Datos de la ruta
  const [puntoInicio, setPuntoInicio] = useState(null);
  const [puntoFin, setPuntoFin] = useState(null);
  const [puntosIntermedios, setPuntosIntermedios] = useState([]);
  const [rutaDibujada, setRutaDibujada] = useState(false);

  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  // Cargar catálogos
  useEffect(() => {
    cargarCatalogos();
    if (id) cargarRuta();
  }, [id]);

  // Inicializar mapa
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    console.log('🎯 Iniciando mapa...');

    let isMounted = true;

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
      center: [-91.5186, 14.8361],
      zoom: 12
    });

    console.log('Mapa creado');

    map.current.on('load', () => {
      if (!isMounted) return;

      console.log('Mapa cargado');

      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

      draw.current = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          line_string: true,
          trash: true
        },
        defaultMode: 'draw_line_string',
        styles: [
          {
            'id': 'gl-draw-line',
            'type': 'line',
            'filter': ['all', ['==', '$type', 'LineString']],
            'paint': {
              'line-color': '#3b82f6',
              'line-width': 4,
              'line-dasharray': [2, 1]
            }
          }
        ]
      });

      map.current.addControl(draw.current);
      console.log('Draw listo');

      map.current.on('draw.create', (e) => procesarRutaDibujada(e.features[0]));
      map.current.on('draw.update', (e) => procesarRutaDibujada(e.features[0]));
      map.current.on('draw.delete', limpiarRuta);

      map.current.resize();
    });

    map.current.on('error', (e) => console.error('Error:', e));

    return () => {
      isMounted = false;
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  const cargarCatalogos = async () => {
    try {
      const [zonasRes, tiposRes] = await Promise.all([
        zonaService.getForSelect(),
        catalogoService.getTiposResiduoForSelect()
      ]);
      setZonas(zonasRes.data.zonas || []);
      setTiposResiduo(tiposRes.data.tipos || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const cargarRuta = async () => {
    try {
      setLoading(true);
      const response = await rutaService.getById(id);
      const ruta = response.data.ruta;

      setFormData({
        nombre_ruta: ruta.nombre,
        descripcion: ruta.descripcion || '',
        id_zona: ruta.zona.id,
        horario_inicio: ruta.horario.inicio,
        horario_fin: ruta.horario.fin,
        dias_recoleccion: ruta.dias_recoleccion,
        tipos_residuo: ruta.tipos_residuo.map(t => t.id),
        distancia_km: ruta.distancia_km
      });

      // Esperar a que el mapa cargue para dibujar
      setTimeout(() => {
        if (map.current && draw.current) {
          const coordinates = [
            [ruta.coordenadas.inicio.lng, ruta.coordenadas.inicio.lat],
            ...ruta.puntos_intermedios.map(p => [p.lng, p.lat]),
            [ruta.coordenadas.fin.lng, ruta.coordenadas.fin.lat]
          ];

          draw.current.add({
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: coordinates
            },
            properties: {}
          });

          setPuntoInicio(ruta.coordenadas.inicio);
          setPuntoFin(ruta.coordenadas.fin);
          setPuntosIntermedios(ruta.puntos_intermedios);
          setRutaDibujada(true);
        }
      }, 1000);

    } catch (error) {
      setError('Error al cargar la ruta');
    } finally {
      setLoading(false);
    }
  };

  const procesarRutaDibujada = (feature) => {
    const coordinates = feature.geometry.coordinates;

    const inicio = {
      lat: coordinates[0][1],
      lng: coordinates[0][0]
    };

    const fin = {
      lat: coordinates[coordinates.length - 1][1],
      lng: coordinates[coordinates.length - 1][0]
    };

    const intermedios = coordinates.slice(1, -1).map(coord => ({
      lat: coord[1],
      lng: coord[0]
    }));

    console.log('Inicio:', inicio);
    console.log('Intermedios:', intermedios.length);
    console.log('Fin:', fin);

    setPuntoInicio(inicio);
    setPuntoFin(fin);
    setPuntosIntermedios(intermedios);
    setRutaDibujada(true);
    calcularDistancia(coordinates);
  };

  const calcularDistancia = (coordinates) => {
    const R = 6371;
    let distancia = 0;

    for (let i = 0; i < coordinates.length - 1; i++) {
      const p1 = coordinates[i];
      const p2 = coordinates[i + 1];

      const dLat = (p2[1] - p1[1]) * Math.PI / 180;
      const dLon = (p2[0] - p1[0]) * Math.PI / 180;

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(p1[1] * Math.PI / 180) * Math.cos(p2[1] * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      distancia += R * c;
    }

    setFormData(prev => ({
      ...prev,
      distancia_km: Math.round(distancia * 10) / 10
    }));
  };

  const limpiarRuta = () => {
    if (draw.current) draw.current.deleteAll();
    setPuntoInicio(null);
    setPuntoFin(null);
    setPuntosIntermedios([]);
    setRutaDibujada(false);
    setFormData(prev => ({ ...prev, distancia_km: 0 }));
  };

  const handleDiaChange = (dia) => {
    const nuevos = formData.dias_recoleccion.includes(dia)
      ? formData.dias_recoleccion.filter(d => d !== dia)
      : [...formData.dias_recoleccion, dia];
    setFormData({ ...formData, dias_recoleccion: nuevos });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!rutaDibujada) {
    alert('Debes dibujar una ruta en el mapa');
    return;
  }

  if (!formData.id_zona) {
    alert('Selecciona una zona');
    return;
  }

  if (formData.dias_recoleccion.length === 0) {
    alert('Selecciona al menos un día');
    return;
  }

  if (formData.tipos_residuo.length === 0) {
    alert('Selecciona al menos un tipo de residuo');
    return;
  }

  setSaving(true);

  try {
    // Asegurar que los puntos tengan orden
    const puntosConOrden = puntosIntermedios.map((punto, index) => ({
      lat: punto.lat,
      lng: punto.lng,
      orden: index + 1
    }));

    const rutaData = {
      nombre_ruta: formData.nombre_ruta,
      descripcion: formData.descripcion || '',
      id_zona: parseInt(formData.id_zona),
      coordenada_inicio_lat: puntoInicio.lat,
      coordenada_inicio_lng: puntoInicio.lng,
      coordenada_fin_lat: puntoFin.lat,
      coordenada_fin_lng: puntoFin.lng,
      distancia_km: formData.distancia_km,
      horario_inicio: formData.horario_inicio,
      horario_fin: formData.horario_fin,
      puntos_intermedios: puntosConOrden,
      dias_recoleccion: formData.dias_recoleccion,
      tipos_residuo: formData.tipos_residuo
    };

    console.log('Enviando datos:', JSON.stringify(rutaData, null, 2));

    if (id) {
      await rutaService.update(id, rutaData);
    } else {
      await rutaService.create(rutaData);
    }

    navigate('/dashboard/rutas');
  } catch (error) {
    console.error('Error:', error);
    console.error('Respuesta:', error.response?.data);
    setError(error.response?.data?.message || 'Error al guardar la ruta');
  } finally {
    setSaving(false);
  }
};

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center gap-4 shadow-sm">
        <button
          onClick={() => navigate('/dashboard/rutas')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">
          {id ? 'Editar Ruta' : 'Nueva Ruta'}
        </h1>
        {rutaDibujada && (
          <span className="ml-4 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            Ruta dibujada ({formData.distancia_km} km)
          </span>
        )}
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 m-4 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* Contenido principal */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Panel izquierdo - Formulario */}
        <div className="w-96 bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
          <div className="bg-gradient-to-r from-gray-900 to-black px-6 py-4">
            <h2 className="text-white font-semibold">Detalles de la Ruta</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nombre_ruta}
                  onChange={(e) => setFormData({ ...formData, nombre_ruta: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Ruta Centro"
                  required
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Descripción opcional"
                />
              </div>

              {/* Zona */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zona <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.id_zona}
                  onChange={(e) => setFormData({ ...formData, id_zona: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar zona</option>
                  {zonas.map(z => (
                    <option key={z.value} value={z.value}>{z.label}</option>
                  ))}
                </select>
              </div>

              {/* Horarios */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Inicio</label>
                  <input
                    type="time"
                    value={formData.horario_inicio}
                    onChange={(e) => setFormData({ ...formData, horario_inicio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fin</label>
                  <input
                    type="time"
                    value={formData.horario_fin}
                    onChange={(e) => setFormData({ ...formData, horario_fin: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              {/* Distancia */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <label className="block text-sm font-medium text-blue-700 mb-1">
                  📏 Distancia calculada
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={formData.distancia_km}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border border-blue-200 rounded-lg text-blue-700 font-semibold"
                  />
                  <span className="text-blue-600 font-medium">km</span>
                </div>
              </div>

              {/* Días */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Días <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {diasSemana.map(dia => (
                    <label key={dia} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.dias_recoleccion.includes(dia)}
                        onChange={() => handleDiaChange(dia)}
                        className="rounded text-blue-600"
                      />
                      <span>{dia}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tipos de residuo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipos de residuo <span className="text-red-500">*</span>
                </label>
                <div className="border border-gray-200 rounded-lg p-3 max-h-40 overflow-y-auto">
                  {tiposResiduo.map(tipo => (
                    <label key={tipo.value} className="flex items-center gap-2 py-1">
                      <input
                        type="checkbox"
                        value={tipo.value}
                        checked={formData.tipos_residuo.includes(tipo.value)}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          const nuevos = formData.tipos_residuo.includes(value)
                            ? formData.tipos_residuo.filter(v => v !== value)
                            : [...formData.tipos_residuo, value];
                          setFormData({ ...formData, tipos_residuo: nuevos });
                        }}
                        className="rounded text-blue-600"
                      />
                      <span>{tipo.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </form>
          </div>

          {/* Botones */}
          <div className="border-t p-4 bg-gray-50">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => navigate('/dashboard/rutas')}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
              >
                {saving ? 'Guardando...' : (id ? 'Actualizar' : 'Crear')}
              </button>
            </div>

            {rutaDibujada && (
              <button
                type="button"
                onClick={limpiarRuta}
                className="w-full mt-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-all"
              >
                Limpiar Ruta
              </button>
            )}
          </div>
        </div>

        {/* Panel derecho - Mapa */}
        <div className="flex-1 relative bg-gray-200 rounded-lg overflow-hidden shadow-lg">
          <div ref={mapContainer} className="absolute inset-0" />

          {/* Panel de información de la ruta */}
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-xl border border-gray-200 min-w-[280px]">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              {rutaDibujada ? '📍 Ruta dibujada' : '✏️ Dibuja tu ruta'}
            </h3>

            {!rutaDibujada ? (
              <div className="space-y-2 text-sm text-gray-600">
                <p>1. Haz clic para comenzar</p>
                <p>2. Sigue haciendo clic para agregar puntos</p>
                <p>3. Doble clic para finalizar</p>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span className="text-gray-600">Inicio:</span>
                  <span className="font-mono text-xs">
                    {puntoInicio?.lat.toFixed(4)}, {puntoInicio?.lng.toFixed(4)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                  <span className="text-gray-600">Intermedios:</span>
                  <span className="font-bold text-blue-600">{puntosIntermedios.length}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  <span className="text-gray-600">Fin:</span>
                  <span className="font-mono text-xs">
                    {puntoFin?.lat.toFixed(4)}, {puntoFin?.lng.toFixed(4)}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t mt-2">
                  <span className="text-gray-600">📏 Distancia total:</span>
                  <span className="font-bold text-green-600">{formData.distancia_km} km</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};