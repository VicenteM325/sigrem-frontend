// src/pages/dashboard/puntos-verdes/PuntosVerdesDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPinIcon,
  FunnelIcon,
  ArrowPathIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import {
  Card,
  Typography,
  Button,
  Select,
  Option,
  Alert
} from '@material-tailwind/react';
import { puntoVerdeService } from '@/services/puntoVerdeService';
import { zonaService } from '@/services/zonaService';
import { PuntosVerdesDashboardMap } from '@/components/maps/PuntosVerdesDashboardMap';

export function PuntosVerdesDashboard() {
  const navigate = useNavigate();
  const [puntos, setPuntos] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroZona, setFiltroZona] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    capacidadTotal: 0,
    conEncargado: 0,
    zonas: 0
  });

  useEffect(() => {
    loadPuntos();
    loadZonas();
  }, []);

  const loadPuntos = async () => {
    try {
      setLoading(true);
      const response = await puntoVerdeService.getPuntosVerdesMapa();
      const puntosData = response.data.puntos || [];
      setPuntos(puntosData);

      // Calcular estadísticas
      calcularEstadisticas(puntosData);
    } catch (error) {
      console.error('Error cargando puntos verdes:', error);
      setError('Error al cargar los puntos verdes');
    } finally {
      setLoading(false);
    }
  };

  const loadZonas = async () => {
    try {
      const response = await zonaService.getForSelect();
      setZonas(response.data.zonas || []);
    } catch (error) {
      console.error('Error cargando zonas:', error);
    }
  };

  const calcularEstadisticas = (puntosData) => {
    const total = puntosData.length;
    const capacidadTotal = puntosData.reduce((sum, p) => {
      const capacidad = typeof p.capacidad === 'number' ? p.capacidad : parseFloat(p.capacidad) || 0;
      return sum + capacidad;
    }, 0);

    const conEncargado = puntosData.filter(p => p.encargado).length;
    const zonasUnicas = new Set(puntosData.map(p => p.zona?.nombre)).size;

    setStats({
      total,
      capacidadTotal: capacidadTotal.toFixed(2), 
      conEncargado,
      zonas: zonasUnicas
    });
  };

  const handleFiltrar = async () => {
    if (!filtroZona) {
      loadPuntos();
      return;
    }

    try {
      setLoading(true);
      const response = await puntoVerdeService.getByZona(filtroZona);
      const puntosFiltrados = response.data.puntos || [];
      setPuntos(puntosFiltrados);
      calcularEstadisticas(puntosFiltrados);
    } catch (error) {
      console.error('Error filtrando puntos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalle = (id) => {
    navigate(`/dashboard/puntos-verdes/${id}`);
  };

  if (loading && puntos.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Typography variant="h4" color="blue-gray" className="flex items-center gap-2">
            <MapPinIcon className="h-8 w-8 text-green-600" />
            Dashboard de Puntos Verdes
          </Typography>
          <Typography variant="small" color="gray" className="mt-1">
            Visualiza todos los puntos verdes en el mapa y sus estadísticas
          </Typography>
        </div>
        <Button
          color="green"
          onClick={() => navigate('/dashboard/puntos-verdes/create')}
          className="flex items-center gap-2"
        >
          <MapPinIcon className="h-5 w-5" />
          Nuevo Punto Verde
        </Button>
      </div>

      {error && (
        <Alert color="red" className="mb-6">
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
          <Typography variant="small" color="green" className="font-medium">
            Total Puntos Verdes
          </Typography>
          <Typography variant="h3" color="green" className="font-bold">
            {stats.total}
          </Typography>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
          <Typography variant="small" color="blue" className="font-medium">
            Capacidad Total
          </Typography>
          <Typography variant="h3" color="blue" className="font-bold">
            {stats.capacidadTotal} m³
          </Typography>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200">
          <Typography variant="small" color="yellow" className="font-medium">
            Con Encargado
          </Typography>
          <Typography variant="h3" color="yellow" className="font-bold">
            {stats.conEncargado}
          </Typography>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
          <Typography variant="small" color="purple" className="font-medium">
            Zonas Cubiertas
          </Typography>
          <Typography variant="h3" color="purple" className="font-bold">
            {stats.zonas}
          </Typography>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <Select
              label="Filtrar por Zona"
              value={filtroZona}
              onChange={(val) => setFiltroZona(val)}
            >
              <Option value="">Todas las zonas</Option>
              {zonas.map(zona => (
                <Option key={zona.value} value={String(zona.value)}>
                  {zona.label}
                </Option>
              ))}
            </Select>
          </div>
          <Button
            size="md"
            color="blue"
            onClick={handleFiltrar}
            className="flex items-center gap-2"
          >
            <FunnelIcon className="h-5 w-5" />
            Filtrar
          </Button>
          <Button
            size="md"
            variant="outlined"
            onClick={loadPuntos}
            className="flex items-center gap-2"
          >
            <ArrowPathIcon className="h-5 w-5" />
            Limpiar
          </Button>
        </div>
      </Card>

      {/* Mapa */}
      <Card className="p-4">
        <PuntosVerdesDashboardMap
          puntos={puntos}
          altura="600px"
          onPuntoClick={handleVerDetalle}
        />
      </Card>

      {/* Lista rápida */}
      <Card className="p-4">
        <Typography variant="h6" className="mb-4">
          Puntos Verdes ({puntos.length})
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
          {puntos.map(punto => (
            <button
              key={punto.id}
              onClick={() => handleVerDetalle(punto.id)}
              className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors border border-gray-200 hover:border-green-500 group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <Typography variant="small" color="blue-gray" className="font-medium">
                    {punto.nombre}
                  </Typography>
                  <Typography variant="small" color="gray" className="text-xs">
                    {punto.zona?.nombre}
                  </Typography>
                </div>
                <EyeIcon className="h-4 w-4 text-gray-400 group-hover:text-green-600" />
              </div>
              <div className="mt-2 text-xs text-gray-600">
                <span className="inline-block mr-3">📍 {punto.direccion}</span>
                <span className="inline-block">{punto.capacidad} m³</span>
              </div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}