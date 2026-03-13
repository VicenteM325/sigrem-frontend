// src/pages/dashboard/recolecciones/RecoleccionDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Card, Typography, Button, Chip } from '@material-tailwind/react';
import { recoleccionService } from '@/services/recoleccionService';
import { RecoleccionPuntosMap } from "@/components/maps/RecoleccionPuntosMap";

const ESTADOS = {
  programada: { label: 'Programada', color: 'blue' },
  en_proceso: { label: 'En Proceso', color: 'yellow' },
  completada: { label: 'Completada', color: 'green' },
  incompleta: { label: 'Incompleta', color: 'red' },
};

export function RecoleccionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recoleccion, setRecoleccion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecoleccion();
  }, [id]);

  const loadRecoleccion = async () => {
    try {
      setLoading(true);
      const response = await recoleccionService.getById(id);
      setRecoleccion(response.data.recoleccion);
    } catch (error) {
      console.error('Error cargando recolección:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFechaHora = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleString('es-ES', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <Typography>Cargando detalles de la recolección...</Typography>
      </div>
    );
  }

  if (!recoleccion) {
    return (
      <div className="p-6 text-center">
        <Typography color="red">Recolección no encontrada</Typography>
        <Button
          variant="text"
          onClick={() => navigate('/dashboard/recolecciones')}
          className="mt-4"
        >
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="text"
          size="sm"
          onClick={() => navigate('/dashboard/recolecciones')}
          className="flex items-center gap-2"
        >
          <ArrowLeftIcon className="h-4 w-4" /> Volver
        </Button>
        <Typography variant="h5" color="blue-gray">
          Detalles de Recolección #{recoleccion.id_recoleccion}
        </Typography>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información general */}
        <Card className="p-6">
          <Typography variant="h6" color="blue-gray" className="mb-4">
            Información General
          </Typography>

          <div className="space-y-4">
            <div>
              <Typography variant="small" color="gray">Estado</Typography>
              <Chip
                size="sm"
                value={ESTADOS[recoleccion.estado]?.label || recoleccion.estado}
                color={ESTADOS[recoleccion.estado]?.color || 'gray'}
                className="w-fit mt-1"
              />
            </div>

            <div>
              <Typography variant="small" color="gray">Hora Inicio</Typography>
              <Typography variant="h6">{formatFechaHora(recoleccion.hora_inicio)}</Typography>
            </div>

            <div>
              <Typography variant="small" color="gray">Hora Fin</Typography>
              <Typography variant="h6">{formatFechaHora(recoleccion.hora_fin)}</Typography>
            </div>

            <div>
              <Typography variant="small" color="gray">Basura Recolectada</Typography>
              <Typography variant="h6">
                {recoleccion.basura_recolectada ? `${recoleccion.basura_recolectada} toneladas` : 'No registrada'}
              </Typography>
            </div>

            {recoleccion.observaciones && (
              <div>
                <Typography variant="small" color="gray">Observaciones</Typography>
                <Typography variant="h6" className="whitespace-pre-wrap">
                  {recoleccion.observaciones}
                </Typography>
              </div>
            )}
          </div>
        </Card>

        {/* Información de asignación */}
        <Card className="p-6">
          <Typography variant="h6" color="blue-gray" className="mb-4">
            Asignación Relacionada
          </Typography>

          {recoleccion.asignacion && (
            <div className="space-y-4">
              <div>
                <Typography variant="small" color="gray">Ruta</Typography>
                <Typography variant="h6">{recoleccion.asignacion.ruta?.nombre}</Typography>
                <Typography variant="small" color="gray">
                  {recoleccion.asignacion.ruta?.zona?.nombre}
                </Typography>
              </div>

              <div>
                <Typography variant="small" color="gray">Camión</Typography>
                <Typography variant="h6">{recoleccion.asignacion.camion?.placa}</Typography>
                <Typography variant="small" color="gray">
                  Capacidad: {recoleccion.asignacion.camion?.capacidad} ton
                </Typography>
              </div>

              {recoleccion.asignacion.camion?.conductor && (
                <div>
                  <Typography variant="small" color="gray">Conductor</Typography>
                  <Typography variant="h6">
                    {recoleccion.asignacion.camion.conductor.nombre_completo}
                  </Typography>
                  <Typography variant="small" color="gray">
                    Licencia: {recoleccion.asignacion.camion.conductor.licencia}
                  </Typography>
                </div>
              )}

              <div>
                <Typography variant="small" color="gray">Fecha Programada</Typography>
                <Typography variant="h6">
                  {new Date(recoleccion.asignacion.fecha_programada).toLocaleDateString()}
                </Typography>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* MAPA DE LA RUTA */}
      <Card className="p-6 mt-6">
        <Typography variant="h6" color="blue-gray" className="mb-4">
          Ruta de la Recolección
        </Typography>

        {recoleccion.asignacion?.ruta ? (
          <div className="h-[500px] rounded-lg overflow-hidden border">
            <RecoleccionPuntosMap puntos={recoleccion.puntos_basura} />
          </div>
        ) : (
          <Typography color="gray">
            No hay ruta disponible para esta recolección
          </Typography>
        )}
      </Card>
    </div>
  );
}