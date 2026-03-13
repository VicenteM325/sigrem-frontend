// pages/Recolecciones/RecoleccionesPendientes.jsx
import React, { useState, useEffect } from 'react';
import { PlayIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { Card, Typography, Button, Chip } from '@material-tailwind/react';
import { recoleccionService } from '@/services/recoleccionService';

export function RecoleccionesPendientes() {
  const [recolecciones, setRecolecciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendientes();
  }, []);

  const loadPendientes = async () => {
    try {
      const response = await recoleccionService.getPendientes();
      setRecolecciones(response.data.recolecciones || []);
    } catch (error) {
      console.error('Error cargando recolecciones pendientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIniciar = async (id) => {
    try {
      await recoleccionService.iniciar(id);
      loadPendientes(); // Recargar la lista
    } catch (error) {
      console.error('Error iniciando recolección:', error);
    }
  };

  if (loading) return <Typography>Cargando...</Typography>;

  return (
    <div className="p-6">
      <Typography variant="h5" className="mb-6">Recolecciones Pendientes</Typography>

      {recolecciones.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          No hay recolecciones pendientes
        </Card>

      ) : (

        <div className="grid gap-4">
          {recolecciones.map(rec => (
            <Card key={rec.id} className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <Typography variant="h6">{rec.ruta}</Typography>
                  <Typography variant="small" color="gray">
                    Camión: {rec.camion} | Fecha: {rec.fecha_programada}
                  </Typography>
                </div>
                <Button
                  size="sm"
                  color="green"
                  onClick={() => handleIniciar(rec.id)}
                  className="flex items-center gap-2"
                >
                  <PlayIcon className="h-4 w-4" /> Iniciar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}