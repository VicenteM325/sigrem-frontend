// src/pages/dashboard/rutas/ZonaForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { zonaService } from '@/services/zonaService';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export const ZonaForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    nombre_zona: '',
    densidad_poblacional: '',
    tipos_zona: []
  });

  const tiposDisponibles = ['Residencial', 'Comercial', 'Industrial', 'Mixta'];

  useEffect(() => {
    if (id) {
      cargarZona();
    }
  }, [id]);

  const cargarZona = async () => {
    try {
      setLoading(true);
      const response = await zonaService.getById(id);
      const zona = response.data.zona;
      setFormData({
        nombre_zona: zona.nombre,
        densidad_poblacional: zona.densidad || '',
        tipos_zona: zona.tipos || []
      });
    } catch (err) {
      setError('Error al cargar la zona');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre_zona.trim()) {
      alert('El nombre es obligatorio');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (id) {
        await zonaService.update(id, formData);
      } else {
        await zonaService.create(formData);
      }
      navigate('/dashboard/zonas');
    } catch (err) {
      setError('Error al guardar la zona');
    } finally {
      setSaving(false);
    }
  };

  const handleTipoChange = (tipo) => {
    const nuevosTipos = formData.tipos_zona.includes(tipo)
      ? formData.tipos_zona.filter(t => t !== tipo)
      : [...formData.tipos_zona, tipo];
    setFormData({ ...formData, tipos_zona: nuevosTipos });
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/dashboard/zonas')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">
          {id ? 'Editar Zona' : 'Nueva Zona'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        {/* Nombre */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de la Zona <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.nombre_zona}
            onChange={(e) => setFormData({ ...formData, nombre_zona: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ej: Zona 1, Centro Histórico"
            required
          />
        </div>

        {/* Densidad poblacional */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Densidad Poblacional (1-5)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="5"
            value={formData.densidad_poblacional}
            onChange={(e) => setFormData({ ...formData, densidad_poblacional: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: 2.5"
          />
          <p className="text-xs text-gray-500 mt-1">
            * Factor de densidad para cálculo de puntos de basura
          </p>
        </div>

        {/* Tipos de zona */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipos de Zona
          </label>
          <div className="space-y-2 border rounded-lg p-4">
            {tiposDisponibles.map(tipo => (
              <label key={tipo} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.tipos_zona.includes(tipo)}
                  onChange={() => handleTipoChange(tipo)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{tipo}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard/zonas')}
            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {saving ? 'Guardando...' : (id ? 'Actualizar' : 'Crear')}
          </button>
        </div>
      </form>
    </div>
  );
};