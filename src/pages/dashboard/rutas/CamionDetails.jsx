import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/outline';
import { Card, Typography, Button, Chip } from '@material-tailwind/react';
import { camionService } from '@/services/camionService';

export function CamionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [camion, setCamion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCamion();
  }, [id]);

  const loadCamion = async () => {
    try {
      setLoading(true);
      const response = await camionService.getById(id);
      setCamion(response.data.camion);
    } catch (error) {
      console.error('Error cargando camión:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'operativo': return 'green';
      case 'mantenimiento': return 'yellow';
      case 'fuera_servicio': return 'red';
      default: return 'gray';
    }
  };

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case 'operativo': return 'Operativo';
      case 'mantenimiento': return 'En Mantenimiento';
      case 'fuera_servicio': return 'Fuera de Servicio';
      default: return estado;
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <Typography variant="h6">Cargando detalles del camión...</Typography>
      </div>
    );
  }

  if (!camion) {
    return (
      <div className="p-6 text-center">
        <Typography variant="h6" color="red">Camión no encontrado</Typography>
        <Button
          variant="text"
          onClick={() => navigate('/dashboard/camiones')}
          className="mt-4"
        >
          Volver a la lista
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="text"
            size="sm"
            onClick={() => navigate('/dashboard/camiones')}
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="h-4 w-4" /> Volver
          </Button>
          <Typography variant="h5" color="blue-gray">
            Detalles del Camión
          </Typography>
        </div>
        <Link to={`/dashboard/camiones/${id}/edit`}>
          <Button size="sm" className="flex items-center gap-2">
            <PencilIcon className="h-4 w-4" /> Editar
          </Button>
        </Link>
      </div>

      <Card className="p-6 max-w-2xl">
        <div className="space-y-6">
          {/* Información principal */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Typography variant="small" color="gray" className="font-normal">
                Placa
              </Typography>
              <Typography variant="h6" color="blue-gray">
                {camion.placa}
              </Typography>
            </div>

            <div>
              <Typography variant="small" color="gray" className="font-normal">
                Capacidad
              </Typography>
              <Typography variant="h6" color="blue-gray">
                {camion.capacidad} toneladas
              </Typography>
            </div>
          </div>

          {/* Estado */}
          <div>
            <Typography variant="small" color="gray" className="font-normal">
              Estado
            </Typography>
            <Chip
              size="sm"
              value={getEstadoTexto(camion.estado)}
              color={getEstadoColor(camion.estado)}
              className="w-fit mt-1"
            />
          </div>

          {/* Conductor */}
          <div>
            <Typography variant="small" color="gray" className="font-normal">
              Conductor Asignado
            </Typography>
            {camion.conductor ? (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                <Typography variant="h6" color="blue-gray">
                  {camion.conductor.nombre_completo}
                </Typography>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <Typography variant="small" color="gray">
                      Licencia
                    </Typography>
                    <Typography variant="small" color="blue-gray">
                      {camion.conductor.licencia}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="small" color="gray">
                      Categoría
                    </Typography>
                    <Typography variant="small" color="blue-gray">
                      {camion.conductor.categoria}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="small" color="gray">
                      Email
                    </Typography>
                    <Typography variant="small" color="blue-gray">
                      {camion.conductor.email}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="small" color="gray">
                      Teléfono
                    </Typography>
                    <Typography variant="small" color="blue-gray">
                      {camion.conductor.telefono}
                    </Typography>
                  </div>
                </div>
              </div>
            ) : (
              <Typography variant="paragraph" color="gray" className="mt-1">
                Sin conductor asignado
              </Typography>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}