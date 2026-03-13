import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Card, Typography, Button, Input, Select, Option, Alert } from '@material-tailwind/react';
import { contenedorService } from '@/services/contenedorService';
import { puntoVerdeService } from '@/services/puntoVerdeService';
import { materialService } from '@/services/materialService';

const ESTADOS = [
  { value: 'disponible', label: 'Disponible' },
  { value: 'lleno', label: 'Lleno' },
  { value: 'mantenimiento', label: 'Mantenimiento' }
];

export function ContenedorForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    id_punto_verde: '',
    id_material: '',
    capacidad_m3: '',
    estado_contenedor: 'disponible'
  });

  const [puntosVerdes, setPuntosVerdes] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadCatalogos();
    if (isEditing) {
      loadContenedor();
    }
  }, [id]);

  const loadCatalogos = async () => {
    try {
      const [pvRes, matRes] = await Promise.all([
        puntoVerdeService.getForSelect(),
        materialService.getForSelect()
      ]);
      setPuntosVerdes(pvRes.data.puntos || []);
      setMateriales(matRes.data.materiales || []);
    } catch (error) {
      console.error('Error cargando catálogos:', error);
    }
  };

  const loadContenedor = async () => {
    try {
      setLoading(true);
      const response = await contenedorService.getById(id);
      const contenedor = response.data.contenedor;

      setFormData({
        id_punto_verde: contenedor.punto_verde?.id || '',
        id_material: contenedor.material?.id || '',
        capacidad_m3: contenedor.capacidad || '',
        estado_contenedor: contenedor.estado || 'disponible'
      });
    } catch (error) {
      console.error('Error cargando contenedor:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.id_punto_verde) {
      newErrors.id_punto_verde = 'El punto verde es requerido';
    }
    if (!formData.id_material) {
      newErrors.id_material = 'El tipo de material es requerido';
    }
    if (!formData.capacidad_m3) {
      newErrors.capacidad_m3 = 'La capacidad es requerida';
    } else if (formData.capacidad_m3 <= 0) {
      newErrors.capacidad_m3 = 'La capacidad debe ser mayor a 0';
    } else if (formData.capacidad_m3 > 100) {
      newErrors.capacidad_m3 = 'La capacidad no puede exceder 100 m³';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      if (isEditing) {
        await contenedorService.update(id, formData);
      } else {
        await contenedorService.create(formData);
      }

      navigate('/dashboard/contenedores');
    } catch (error) {
      console.error('Error guardando contenedor:', error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Error al guardar el contenedor');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div className="p-6 text-center">
        <Typography variant="h6">Cargando datos del contenedor...</Typography>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="text"
          size="sm"
          onClick={() => navigate('/dashboard/contenedores')}
          className="flex items-center gap-2"
        >
          <ArrowLeftIcon className="h-4 w-4" /> Volver
        </Button>
        <Typography variant="h5" color="blue-gray">
          {isEditing ? 'Editar Contenedor' : 'Nuevo Contenedor'}
        </Typography>
      </div>

      <Card className="p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Punto Verde */}
          <div>
            <Select
              key={`pv-select-${formData.id_punto_verde}-${puntosVerdes.length}`}
              label="Punto Verde"
              value={formData.id_punto_verde ? String(formData.id_punto_verde) : ''}
              onChange={(val) => {
                console.log('Seleccionado PV:', val);
                setFormData({ ...formData, id_punto_verde: val ? parseInt(val) : '' });
              }}
              error={!!errors.id_punto_verde}
            >
              {puntosVerdes.length === 0 ? (
                <Option value="" disabled>Cargando...</Option>
              ) : (
                puntosVerdes.map(pv => (
                  <Option key={pv.value} value={String(pv.value)}>
                    {pv.label}
                  </Option>
                ))
              )}
            </Select>
            {errors.id_punto_verde && (
              <Typography variant="small" color="red" className="mt-1">
                {errors.id_punto_verde}
              </Typography>
            )}
          </div>

          {/* Tipo de Material */}
          <div>
            <Select
              key={`mat-select-${formData.id_material}-${materiales.length}`}
              label="Tipo de Material"
              value={formData.id_material ? String(formData.id_material) : ''}
              onChange={(val) => {
                console.log('Seleccionado Material:', val);
                setFormData({ ...formData, id_material: val ? parseInt(val) : '' });
              }}
              error={!!errors.id_material}
            >
              {materiales.length === 0 ? (
                <Option value="" disabled>Cargando...</Option>
              ) : (
                materiales.map(mat => (
                  <Option key={mat.value} value={String(mat.value)}>
                    {mat.label}
                  </Option>
                ))
              )}
            </Select>
            {errors.id_material && (
              <Typography variant="small" color="red" className="mt-1">
                {errors.id_material}
              </Typography>
            )}
          </div>

          {/* Capacidad */}
          <div>
            <Input
              type="number"
              step="0.1"
              label="Capacidad (m³)"
              name="capacidad_m3"
              value={formData.capacidad_m3}
              onChange={handleChange}
              error={!!errors.capacidad_m3}
              required
            />
            {errors.capacidad_m3 && (
              <Typography variant="small" color="red" className="mt-1">
                {errors.capacidad_m3}
              </Typography>
            )}
          </div>

          {/* Estado (solo para edición) */}
          {isEditing && (
            <div>
              <Select
                label="Estado"
                value={formData.estado_contenedor}
                onChange={(val) => setFormData({ ...formData, estado_contenedor: val })}
              >
                {ESTADOS.map(estado => (
                  <Option key={estado.value} value={estado.value}>
                    {estado.label}
                  </Option>
                ))}
              </Select>
            </div>
          )}

          {/* Información adicional para nuevo contenedor */}
          {!isEditing && (
            <Alert color="blue">
              <Typography variant="small">
                El contenedor se creará con estado "Disponible" y porcentaje de llenado 0%.
              </Typography>
            </Alert>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-4 pt-4">
            <Button
              variant="outlined"
              onClick={() => navigate('/dashboard/contenedores')}
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