// src/pages/dashboard/rutas/ZonasList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { zonaService } from '@/services/zonaService';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

export const ZonasList = () => {
  const [zonas, setZonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarZonas();
  }, []);

  const cargarZonas = async () => {
    try {
      setLoading(true);
      const response = await zonaService.getAll();
      setZonas(response.data.zonas || []);
    } catch (err) {
      setError('Error al cargar las zonas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta zona?')) return;
    
    try {
      await zonaService.delete(id);
      cargarZonas();
    } catch (err) {
      alert('Error al eliminar la zona');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Zonas</h1>
        <Link
          to="/dashboard/zonas/create"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Nueva Zona
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Nombre</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Densidad</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Tipos</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {zonas.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  No hay zonas registradas
                </td>
              </tr>
            ) : (
              zonas.map((zona) => (
                <tr key={zona.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{zona.nombre}</td>
                  <td className="px-6 py-4">{zona.densidad || '-'}</td>
                  <td className="px-6 py-4">
                    {zona.tipos?.map((tipo, idx) => (
                      <span
                        key={idx}
                        className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mr-1 mb-1"
                      >
                        {tipo}
                      </span>
                    ))}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/dashboard/zonas/${zona.id}/edit`}
                      className="text-yellow-600 hover:text-yellow-900 mr-3"
                      title="Editar"
                    >
                      <PencilIcon className="w-5 h-5 inline" />
                    </Link>
                    <button
                      onClick={() => handleEliminar(zona.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Eliminar"
                    >
                      <TrashIcon className="w-5 h-5 inline" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};