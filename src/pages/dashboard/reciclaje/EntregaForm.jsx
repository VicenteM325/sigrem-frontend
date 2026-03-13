// src/pages/dashboard/reciclaje/EntregaForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Card, Typography, Button, Input, Select, Option, Alert } from '@material-tailwind/react';
import { entregaReciclajeService } from '@/services/entregaReciclajeService';
import { puntoVerdeService } from '@/services/puntoVerdeService';
import { materialService } from '@/services/materialService';

export function EntregaForm() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    id_punto_verde: '',
    id_material: '',
    id_ciudadano: '',
    cantidad_kg: ''
  });

  const [puntosVerdes, setPuntosVerdes] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [puntosGanados, setPuntosGanados] = useState(0);

  useEffect(() => {
    loadCatalogos();
  }, []);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'cantidad_kg' && value) {
      setPuntosGanados(Math.floor(parseFloat(value) || 0));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSelectChange = (value, name) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.id_punto_verde) {
      newErrors.id_punto_verde = 'Selecciona un punto verde';
    }
    if (!formData.id_material) {
      newErrors.id_material = 'Selecciona un tipo de material';
    }
    if (!formData.id_ciudadano) {
      newErrors.id_ciudadano = 'El ID del ciudadano es requerido';
    }
    if (!formData.cantidad_kg) {
      newErrors.cantidad_kg = 'Ingresa la cantidad';
    } else if (formData.cantidad_kg <= 0) {
      newErrors.cantidad_kg = 'La cantidad debe ser mayor a 0';
    } else if (formData.cantidad_kg > 100) {
      newErrors.cantidad_kg = 'La cantidad no puede exceder 100 kg';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      
      // Convertir valores a números
      const dataToSend = {
        id_punto_verde: parseInt(formData.id_punto_verde),
        id_material: parseInt(formData.id_material),
        id_ciudadano: parseInt(formData.id_ciudadano),
        cantidad_kg: parseFloat(formData.cantidad_kg)
      };

      await entregaReciclajeService.create(dataToSend);
      navigate('/dashboard/reciclaje');
    } catch (error) {
      console.error('Error guardando entrega:', error);
      alert('Error al registrar la entrega');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="text"
          size="sm"
          onClick={() => navigate('/dashboard/reciclaje')}
          className="flex items-center gap-2"
        >
          <ArrowLeftIcon className="h-4 w-4" /> Volver
        </Button>
        <Typography variant="h5" color="blue-gray">
          Nueva Entrega de Reciclaje
        </Typography>
      </div>

      <Card className="p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Punto Verde */}
          <div>
            <Select
              label="Punto Verde"
              value={formData.id_punto_verde}
              onChange={(val) => handleSelectChange(val, 'id_punto_verde')}
              error={!!errors.id_punto_verde}
            >
              {puntosVerdes.map(pv => (
                <Option key={pv.value} value={String(pv.value)}>
                  {pv.label}
                </Option>
              ))}
            </Select>
            {errors.id_punto_verde && (
              <Typography variant="small" color="red" className="mt-1">
                {errors.id_punto_verde}
              </Typography>
            )}
          </div>

          {/* Material */}
          <div>
            <Select
              label="Tipo de Material"
              value={formData.id_material}
              onChange={(val) => handleSelectChange(val, 'id_material')}
              error={!!errors.id_material}
            >
              {materiales.map(mat => (
                <Option key={mat.value} value={String(mat.value)}>
                  {mat.label}
                </Option>
              ))}
            </Select>
            {errors.id_material && (
              <Typography variant="small" color="red" className="mt-1">
                {errors.id_material}
              </Typography>
            )}
          </div>

          {/* ID Ciudadano - Input numérico como en tus otros forms */}
          <div>
            <Input
              type="number"
              label="ID del Ciudadano"
              name="id_ciudadano"
              value={formData.id_ciudadano}
              onChange={handleChange}
              error={!!errors.id_ciudadano}
              required
            />
            {errors.id_ciudadano && (
              <Typography variant="small" color="red" className="mt-1">
                {errors.id_ciudadano}
              </Typography>
            )}
          </div>

          {/* Cantidad */}
          <div>
            <Input
              type="number"
              step="0.1"
              label="Cantidad (kg)"
              name="cantidad_kg"
              value={formData.cantidad_kg}
              onChange={handleChange}
              error={!!errors.cantidad_kg}
              required
            />
            {errors.cantidad_kg && (
              <Typography variant="small" color="red" className="mt-1">
                {errors.cantidad_kg}
              </Typography>
            )}
          </div>

          {/* Información de puntos */}
          {formData.cantidad_kg > 0 && (
            <Alert color="green">
              <Typography variant="small">
                ¡El ciudadano ganará <strong>{puntosGanados} punto{Math.floor(puntosGanados) !== 1 ? 's' : ''}</strong> por esta entrega!
              </Typography>
            </Alert>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-4 pt-4">
            <Button
              variant="outlined"
              onClick={() => navigate('/dashboard/reciclaje')}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              color="green"
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Registrar Entrega'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}