// src/pages/dashboard/rutas/RutaDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { rutaService } from '@/services/rutaService';
import { RutaViewMap } from '@/components/maps/RutaViewMap';
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  MapPinIcon, 
  CalendarIcon, 
  ClockIcon,
  TruckIcon,
  TrashIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

export const RutaDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ruta, setRuta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    cargarRuta();
  }, [id]);

  const cargarRuta = async () => {
    try {
      setLoading(true);
      const response = await rutaService.getById(id);
      setRuta(response.data.ruta);
    } catch (err) {
      setError('Error al cargar los detalles de la ruta');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async () => {
    if (!window.confirm('¿Estás seguro de eliminar esta ruta?')) return;
    
    try {
      await rutaService.delete(id);
      navigate('/dashboard/rutas');
    } catch (err) {
      alert('Error al eliminar la ruta');
    }
  };

  const getColorEstado = (estado) => {
    switch(estado?.toLowerCase()) {
      case 'activa': return 'bg-green-100 text-green-800 border-green-200';
      case 'en mantenimiento': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactiva': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !ruta) {
    return (
      <div className="p-6">
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          {error || 'Ruta no encontrada'}
        </div>
        <Link to="/dashboard/rutas" className="text-blue-600 hover:underline">
          ← Volver a rutas
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard/rutas"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">{ruta.nombre}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getColorEstado(ruta.estado?.nombre)}`}>
            {ruta.estado?.nombre}
          </span>
        </div>
        
        <div className="flex gap-2">
          <Link
            to={`/dashboard/rutas/${id}/edit`}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2"
          >
            <PencilIcon className="w-5 h-5" />
            Editar
          </Link>
          <button
            onClick={handleEliminar}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
          >
            <TrashIcon className="w-5 h-5" />
            Eliminar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-2 px-1 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'info'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Información General
          </button>
          <button
            onClick={() => setActiveTab('mapa')}
            className={`pb-2 px-1 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'mapa'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Mapa de la Ruta
          </button>
          <button
            onClick={() => setActiveTab('estadisticas')}
            className={`pb-2 px-1 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'estadisticas'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Estadísticas
          </button>
        </nav>
      </div>

      {/* Contenido según tab */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* TAB: Información General */}
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Columna izquierda */}
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                  Detalles Básicos
                </h3>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Nombre</p>
                    <p className="font-medium text-lg">{ruta.nombre}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Descripción</p>
                    <p className="text-gray-700">{ruta.descripcion || 'Sin descripción'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Zona</p>
                      <p className="font-medium">{ruta.zona?.nombre}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Estado</p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${getColorEstado(ruta.estado?.nombre)}`}>
                        {ruta.estado?.nombre}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span className="w-1 h-6 bg-green-500 rounded-full"></span>
                  Horario y Días
                </h3>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
                    <ClockIcon className="w-6 h-6 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Horario</p>
                      <p className="font-medium">{ruta.horario?.inicio} - {ruta.horario?.fin}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CalendarIcon className="w-6 h-6 text-gray-400 mt-1" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-2">Días de recolección</p>
                        <div className="flex flex-wrap gap-1">
                          {ruta.dias_recoleccion?.map(dia => (
                            <span key={dia} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                              {dia.slice(0, 3)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna derecha */}
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                  Coordenadas
                </h3>
                <div className="space-y-3">
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <p className="text-sm text-green-600 flex items-center gap-1 mb-1">
                      <MapPinIcon className="w-4 h-4" />
                      Punto de inicio
                    </p>
                    <p className="font-mono text-sm bg-white p-2 rounded">
                      Lat: {ruta.coordenadas?.inicio?.lat.toFixed(6)}<br />
                      Lng: {ruta.coordenadas?.inicio?.lng.toFixed(6)}
                    </p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                    <p className="text-sm text-red-600 flex items-center gap-1 mb-1">
                      <MapPinIcon className="w-4 h-4" />
                      Punto final
                    </p>
                    <p className="font-mono text-sm bg-white p-2 rounded">
                      Lat: {ruta.coordenadas?.fin?.lat.toFixed(6)}<br />
                      Lng: {ruta.coordenadas?.fin?.lng.toFixed(6)}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-600">Puntos intermedios</p>
                      <p className="text-2xl font-bold text-blue-600">{ruta.puntos_intermedios?.length || 0}</p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <p className="text-sm text-orange-600">Distancia total</p>
                      <p className="text-2xl font-bold text-orange-600">{ruta.distancia_km} km</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Tipos de Residuo</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex flex-wrap gap-2">
                    {ruta.tipos_residuo?.map(tipo => (
                      <span key={tipo.id} className="px-4 py-2 bg-white text-gray-700 rounded-lg text-sm border border-gray-200 shadow-sm">
                        {tipo.nombre}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-sm font-semibold text-gray-500 mb-2">Información del sistema</h3>
                <div className="space-y-1 text-xs text-gray-500">
                  <p>Creado: {formatFecha(ruta.created_at)}</p>
                  <p>Actualizado: {formatFecha(ruta.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: Mapa de la Ruta */}
        {activeTab === 'mapa' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPinIcon className="w-5 h-5 text-blue-500" />
                Vista previa de la ruta
              </h3>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span>Inicio</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                  <span>Intermedios ({ruta.puntos_intermedios?.length || 0})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  <span>Fin</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-100 rounded-lg h-[500px] overflow-hidden border-2 border-gray-200">
              <RutaViewMap ruta={ruta} />
            </div>

            {/* Información adicional de la ruta */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <p className="text-xs text-green-600 font-medium uppercase tracking-wider">INICIO</p>
                <p className="font-mono text-sm mt-1 text-green-800">
                  {ruta.coordenadas?.inicio?.lat.toFixed(4)}°, {ruta.coordenadas?.inicio?.lng.toFixed(4)}°
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-600 font-medium uppercase tracking-wider">INTERMEDIOS</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{ruta.puntos_intermedios?.length || 0}</p>
              </div>
              
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                <p className="text-xs text-red-600 font-medium uppercase tracking-wider">FIN</p>
                <p className="font-mono text-sm mt-1 text-red-800">
                  {ruta.coordenadas?.fin?.lat.toFixed(4)}°, {ruta.coordenadas?.fin?.lng.toFixed(4)}°
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                <p className="text-xs text-purple-600 font-medium uppercase tracking-wider">DISTANCIA</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{ruta.distancia_km} km</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB: Estadísticas */}
        {activeTab === 'estadisticas' && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5 text-blue-500" />
              Estadísticas de la Ruta
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg">
                <TruckIcon className="w-8 h-8 text-white mb-2" />
                <p className="text-white/80 text-sm">Total Asignaciones</p>
                <p className="text-3xl font-bold text-white">{ruta.estadisticas?.total_asignaciones || 0}</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow-lg">
                <CalendarIcon className="w-8 h-8 text-white mb-2" />
                <p className="text-white/80 text-sm">Última asignación</p>
                <p className="text-xl font-bold text-white">
                  {ruta.estadisticas?.ultima_asignacion || 'N/A'}
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg shadow-lg">
                <MapPinIcon className="w-8 h-8 text-white mb-2" />
                <p className="text-white/80 text-sm">Puntos totales</p>
                <p className="text-3xl font-bold text-white">
                  {(ruta.puntos_intermedios?.length || 0) + 2}
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-lg shadow-lg">
                <CurrencyDollarIcon className="w-8 h-8 text-white mb-2" />
                <p className="text-white/80 text-sm">Costo estimado</p>
                <p className="text-2xl font-bold text-white">
                  Q {(ruta.distancia_km * 3.25).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
  );
};