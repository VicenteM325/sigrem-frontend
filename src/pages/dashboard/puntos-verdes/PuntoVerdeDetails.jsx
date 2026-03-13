// src/pages/dashboard/puntos-verdes/PuntoVerdeDetails.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  ArrowLeftIcon,
  PencilIcon,
  MapPinIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import {
  Card,
  Typography,
  Button,
  Chip
} from '@material-tailwind/react';
import { puntoVerdeService } from '@/services/puntoVerdeService';

export function PuntoVerdeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);

  const [punto, setPunto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPuntoVerde();
  }, [id]);

  useEffect(() => {
    if (!mapContainer.current || !punto) return;

    // Inicializar mapa
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
      center: [punto.ubicacion.lng, punto.ubicacion.lat],
      zoom: 16
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      // Agregar marcador
      marker.current = new maplibregl.Marker({ color: '#22c55e' })
        .setLngLat([punto.ubicacion.lng, punto.ubicacion.lat])
        .addTo(map.current);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [punto]);

  const loadPuntoVerde = async () => {
    try {
      setLoading(true);
      const response = await puntoVerdeService.getById(id);
      setPunto(response.data.punto_verde);
    } catch (error) {
      console.error('Error cargando punto verde:', error);
      setError('No se pudo cargar la información del punto verde');
    } finally {
      setLoading(false);
    }
  };

  const formatNumero = (num) => {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !punto) {
    return (
      <div className="p-6 text-center">
        <Typography variant="h5" color="red" className="mb-4">
          {error || 'Punto verde no encontrado'}
        </Typography>
        <Button
          variant="text"
          onClick={() => navigate('/dashboard/puntos-verdes')}
          className="flex items-center gap-2 mx-auto"
        >
          <ArrowLeftIcon className="h-4 w-4" /> Volver a la lista
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard/puntos-verdes')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <Typography variant="h5" color="blue-gray">
            Punto Verde: {punto.nombre}
          </Typography>
        </div>
        <Link to={`/dashboard/puntos-verdes/${id}/edit`}>
          <Button size="sm" className="flex items-center gap-2">
            <PencilIcon className="h-4 w-4" /> Editar
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Datos generales */}
          <Card className="p-6">
            <Typography variant="h6" className="mb-4 flex items-center gap-2">
              <BuildingOfficeIcon className="h-5 w-5 text-blue-600" />
              Información General
            </Typography>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Typography variant="small" color="gray" className="font-normal">
                  Zona
                </Typography>
                <Typography variant="h6" className="mt-1">
                  {punto.zona?.nombre || 'N/A'}
                </Typography>
              </div>

              <div>
                <Typography variant="small" color="gray" className="font-normal">
                  Capacidad
                </Typography>
                <Typography variant="h6" className="mt-1 text-green-600">
                  {formatNumero(punto.capacidad)} m³
                </Typography>
              </div>

              <div className="md:col-span-2">
                <Typography variant="small" color="gray" className="font-normal">
                  Dirección
                </Typography>
                <Typography variant="h6" className="mt-1">
                  {punto.direccion}
                </Typography>
              </div>
            </div>
          </Card>

          {/* Horario y encargado */}
          <Card className="p-6">
            <Typography variant="h6" className="mb-4">Detalles de Operación</Typography>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <ClockIcon className="h-5 w-5 text-blue-500 mt-1" />
                <div>
                  <Typography variant="small" color="gray" className="font-normal">
                    Horario de Atención
                  </Typography>
                  <Typography variant="h6" className="mt-1">
                    {punto.horario}
                  </Typography>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <UserIcon className="h-5 w-5 text-blue-500 mt-1" />
                <div>
                  <Typography variant="small" color="gray" className="font-normal">
                    Encargado
                  </Typography>
                  <Typography variant="h6" className="mt-1">
                    {punto.encargado?.nombre || 'N/A'}
                  </Typography>
                  {punto.encargado?.email && (
                    <div className="flex items-center gap-1 mt-1">
                      <EnvelopeIcon className="h-4 w-4 text-gray-500" />
                      <Typography variant="small" color="gray">
                        {punto.encargado.email}
                      </Typography>
                    </div>
                  )}
                  {punto.encargado?.telefono && (
                    <div className="flex items-center gap-1 mt-1">
                      <PhoneIcon className="h-4 w-4 text-gray-500" />
                      <Typography variant="small" color="gray">
                        {punto.encargado.telefono}
                      </Typography>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Mapa y coordenadas */}
        <div className="space-y-6">
          <Card className="p-6">
            <Typography variant="h6" className="mb-4 flex items-center gap-2">
              <MapPinIcon className="h-5 w-5 text-green-600" />
              Ubicación
            </Typography>

            <div
              ref={mapContainer}
              className="w-full h-[300px] rounded-lg overflow-hidden border border-gray-200 mb-4"
            />

            <div className="bg-gray-50 p-3 rounded-lg">
              <Typography variant="small" color="gray" className="font-normal">
                Coordenadas
              </Typography>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                  <Typography variant="small" color="blue-gray" className="font-mono">
                    Lat: {punto.ubicacion.lat.toFixed(6)}
                  </Typography>
                </div>
                <div>
                  <Typography variant="small" color="blue-gray" className="font-mono">
                    Lng: {punto.ubicacion.lng.toFixed(6)}
                  </Typography>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}