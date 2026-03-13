import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Card, Typography, Button, Input } from '@material-tailwind/react';
import { camionService } from '@/services/camionService';

const ESTADOS = [
  { value: 'operativo', label: 'Operativo' },
  { value: 'mantenimiento', label: 'En Mantenimiento' },
  { value: 'fuera_servicio', label: 'Fuera de Servicio' },
];

export function CamionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    placa: '',
    capacidad_toneladas: '',
    estado_vehiculo: 'operativo',
    id_conductor: '',
  });

  const [conductores, setConductores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadConductores();
    if (isEditing) {
      loadCamion();
    }
  }, [id]);

  const loadConductores = async () => {
    try {
      const response = await camionService.getConductoresDisponibles();
      setConductores(response.data.conductores || []);
    } catch (error) {
      console.error('Error cargando conductores:', error);
    }
  };

  const loadCamion = async () => {
    try {
      setLoading(true);
      const response = await camionService.getById(id);
      const camion = response.data.camion;

      setFormData({
        placa: camion.placa || '',
        capacidad_toneladas: camion.capacidad || '',
        estado_vehiculo: camion.estado || 'operativo',
        id_conductor: camion.conductor?.id || '',
      });
    } catch (error) {
      console.error('Error cargando camión:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.placa.trim()) {
      newErrors.placa = 'La placa es requerida';
    } else if (formData.placa.length < 5) {
      newErrors.placa = 'La placa debe tener al menos 5 caracteres';
    }

    if (!formData.capacidad_toneladas) {
      newErrors.capacidad_toneladas = 'La capacidad es requerida';
    } else if (formData.capacidad_toneladas <= 0) {
      newErrors.capacidad_toneladas = 'La capacidad debe ser mayor a 0';
    } else if (formData.capacidad_toneladas > 100) {
      newErrors.capacidad_toneladas = 'La capacidad no puede ser mayor a 100 toneladas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      // Convertir id_conductor vacío a null para la API
      const dataToSend = {
        ...formData,
        id_conductor: formData.id_conductor === '' ? null : parseInt(formData.id_conductor)
      };

      if (isEditing) {
        await camionService.update(id, dataToSend);
      } else {
        await camionService.create(dataToSend);
      }

      navigate('/dashboard/camiones');
    } catch (error) {
      console.error('Error guardando camión:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert('Error al guardar el camión');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div className="p-6 text-center">
        <Typography variant="h6">Cargando datos del camión...</Typography>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="text"
          size="sm"
          onClick={() => navigate('/dashboard/camiones')}
          className="flex items-center gap-2"
        >
          <ArrowLeftIcon className="h-4 w-4" /> Volver
        </Button>
        <Typography variant="h5" color="blue-gray">
          {isEditing ? 'Editar Camión' : 'Nuevo Camión'}
        </Typography>
      </div>

      <Card className="p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Placa */}
          <div>
            <Input
              label="Placa"
              name="placa"
              value={formData.placa}
              onChange={handleChange}
              error={!!errors.placa}
              required
            />
            {errors.placa && (
              <Typography variant="small" color="red" className="mt-1">
                {errors.placa}
              </Typography>
            )}
          </div>

          {/* Capacidad */}
          <div>
            <Input
              type="number"
              step="0.1"
              label="Capacidad (toneladas)"
              name="capacidad_toneladas"
              value={formData.capacidad_toneladas}
              onChange={handleChange}
              error={!!errors.capacidad_toneladas}
              required
            />
            {errors.capacidad_toneladas && (
              <Typography variant="small" color="red" className="mt-1">
                {errors.capacidad_toneladas}
              </Typography>
            )}
          </div>

          {/* Estado - Select nativo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              name="estado_vehiculo"
              value={formData.estado_vehiculo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {ESTADOS.map((estado) => (
                <option key={estado.value} value={estado.value}>
                  {estado.label}
                </option>
              ))}
            </select>
          </div>

          {/* Conductor - Select nativo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conductor (opcional)
            </label>
            <select
              name="id_conductor"
              value={formData.id_conductor}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Sin conductor</option>
              {conductores.map((conductor) => (
                <option key={conductor.value} value={conductor.value}>
                  {conductor.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {conductores.length === 0 && 'No hay conductores disponibles'}
            </p>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4 pt-4">
            <Button
              variant="outlined"
              onClick={() => navigate('/dashboard/camiones')}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              color="blue"
              disabled={loading}
            >
              {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}