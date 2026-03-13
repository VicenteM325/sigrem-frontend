// src/pages/dashboard/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TruckIcon, 
  MapPinIcon, 
  CalendarIcon, 
  UserGroupIcon,
  ArrowRightIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// Datos de ejemplo estáticos
const datosEjemplo = {
  recoleccionesHoy: 12,
  puntosVerdes: 8,
  rutasActivas: 5,
  usuarios: 19,
  recoleccionesRecientes: [
    { id: 1, ruta: 'Ruta Centro', camion: 'P-123ABC', estado: 'completada', basura: 450, hora: '08:30' },
    { id: 2, ruta: 'Ruta Norte', camion: 'P-456DEF', estado: 'en_proceso', basura: null, hora: '09:15' },
    { id: 3, ruta: 'Ruta Sur', camion: 'P-789GHI', estado: 'programada', basura: null, hora: '10:00' },
    { id: 4, ruta: 'Ruta Oriente', camion: 'P-101JKL', estado: 'completada', basura: 380, hora: '11:30' },
  ],
  contenedoresCriticos: [
    { id: 1, puntoVerde: 'PV Central', material: 'Plástico', porcentaje: 95 },
    { id: 2, puntoVerde: 'PV Norte', material: 'Vidrio', porcentaje: 92 },
  ]
};

export function Home() {
  const [loading, setLoading] = useState(true);
  const [stats] = useState(datosEjemplo);

  useEffect(() => {
    // Simulamos carga de datos
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const tarjetas = [
    {
      titulo: 'Recolecciones Hoy',
      valor: stats.recoleccionesHoy,
      icono: TruckIcon,
      color: 'bg-blue-500',
      link: '/dashboard/recolecciones'
    },
    {
      titulo: 'Puntos Verdes',
      valor: stats.puntosVerdes,
      icono: MapPinIcon,
      color: 'bg-green-500',
      link: '/dashboard/puntos-verdes'
    },
    {
      titulo: 'Rutas Activas',
      valor: stats.rutasActivas,
      icono: CalendarIcon,
      color: 'bg-purple-500',
      link: '/dashboard/rutas'
    },
    {
      titulo: 'Usuarios',
      valor: stats.usuarios,
      icono: UserGroupIcon,
      color: 'bg-orange-500',
      link: '/dashboard/tables'
    }
  ];

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'completada': return 'bg-green-100 text-green-700';
      case 'en_proceso': return 'bg-yellow-100 text-yellow-700';
      case 'programada': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Dashboard SIGREM
      </h1>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {tarjetas.map((tarjeta, index) => (
          <Link to={tarjeta.link} key={index}>
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{tarjeta.titulo}</p>
                  <p className="text-3xl font-bold text-gray-800">{tarjeta.valor}</p>
                </div>
                <div className={`${tarjeta.color} p-3 rounded-lg`}>
                  <tarjeta.icono className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-blue-600">
                <span>Ver detalles</span>
                <ArrowRightIcon className="h-4 w-4 ml-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Grid de dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recolecciones recientes */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Recolecciones Recientes
            </h2>
            <Link to="/dashboard/recolecciones" className="text-sm text-blue-600 hover:underline">
              Ver todas
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Ruta</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Camión</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Estado</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Basura</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Hora</th>
                </tr>
              </thead>
              <tbody>
                {stats.recoleccionesRecientes.map((rec) => (
                  <tr key={rec.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 text-sm text-gray-800">{rec.ruta}</td>
                    <td className="py-3 text-sm text-gray-600">{rec.camion}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(rec.estado)}`}>
                        {rec.estado}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-gray-600">
                      {rec.basura ? `${rec.basura} kg` : '-'}
                    </td>
                    <td className="py-3 text-sm text-gray-600">{rec.hora}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alertas y contenedores críticos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Alertas
          </h2>

          {stats.contenedoresCriticos.length > 0 ? (
            <div className="space-y-4">
              {stats.contenedoresCriticos.map((cont) => (
                <div key={cont.id} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{cont.puntoVerde}</p>
                    <p className="text-xs text-gray-600 mb-1">{cont.material} - {cont.porcentaje}% lleno</p>
                    <div className="w-full bg-red-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${cont.porcentaje}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No hay alertas activas</p>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pendientes hoy</span>
                <span className="font-medium text-gray-800">8</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Completadas hoy</span>
                <span className="font-medium text-green-600">4</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total reciclado</span>
                <span className="font-medium text-gray-800">830 kg</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Accesos Rápidos
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link 
            to="/dashboard/recolecciones/pendientes"
            className="bg-blue-50 hover:bg-blue-100 p-3 rounded-lg text-center transition-colors"
          >
            <ClockIcon className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <p className="text-xs font-medium text-blue-700">Pendientes</p>
          </Link>
          <Link 
            to="/dashboard/contenedores/llenos"
            className="bg-red-50 hover:bg-red-100 p-3 rounded-lg text-center transition-colors"
          >
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mx-auto mb-1" />
            <p className="text-xs font-medium text-red-700">Contenedores Llenos</p>
          </Link>
          <Link 
            to="/dashboard/rutas"
            className="bg-green-50 hover:bg-green-100 p-3 rounded-lg text-center transition-colors"
          >
            <CalendarIcon className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <p className="text-xs font-medium text-green-700">Rutas</p>
          </Link>
          <Link 
            to="/dashboard/puntos-verdes"
            className="bg-purple-50 hover:bg-purple-100 p-3 rounded-lg text-center transition-colors"
          >
            <MapPinIcon className="h-5 w-5 text-purple-600 mx-auto mb-1" />
            <p className="text-xs font-medium text-purple-700">Puntos Verdes</p>
          </Link>
        </div>
      </div>

      {/* Mensaje de bienvenida */}
      <div className="mt-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
        <h2 className="text-xl font-semibold mb-2">
          ¡Bienvenido al Sistema de Gestión de Residuos!
        </h2>
        <p className="text-blue-100">
          Desde aquí puedes monitorear todas las operaciones de recolección y reciclaje.
        </p>
      </div>
    </div>
  );
}

export default Home;