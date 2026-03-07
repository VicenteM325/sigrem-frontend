// src/pages/dashboard/rutas/RutasList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { rutaService } from '@/services/rutaService';
import { PlusIcon, EyeIcon, TrashIcon } from '@heroicons/react/24/outline';

export const RutasList = () => {
  const [rutas, setRutas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarRutas();
  }, []);

  const cargarRutas = async () => {
    try {
      const response = await rutaService.getAll();
      setRutas(response.data.rutas || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Eliminar ruta?')) {
      try {
        await rutaService.delete(id);
        cargarRutas();
      } catch (error) {
        alert('Error al eliminar');
      }
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Rutas</h1>
        <Link to="/dashboard/rutas/create" className="bg-blue-500 text-white px-4 py-2 rounded">
          <PlusIcon className="w-5 h-5 inline mr-1" />
          Nueva Ruta
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">Nombre</th>
              <th className="px-6 py-3 text-left">Zona</th>
              <th className="px-6 py-3 text-left">Distancia</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rutas.map(ruta => (
              <tr key={ruta.id} className="border-t">
                <td className="px-6 py-4">{ruta.nombre}</td>
                <td className="px-6 py-4">{ruta.zona?.nombre}</td>
                <td className="px-6 py-4">{ruta.distancia_km} km</td>
                <td className="px-6 py-4 text-right">
                  <Link to={`/dashboard/rutas/${ruta.id}`} className="text-blue-600 mr-3">
                    <EyeIcon className="w-5 h-5 inline" />
                  </Link>
                  <button onClick={() => handleEliminar(ruta.id)} className="text-red-600">
                    <TrashIcon className="w-5 h-5 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};