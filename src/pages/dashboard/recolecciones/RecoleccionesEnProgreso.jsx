// src/pages/dashboard/recolecciones/RecoleccionesEnProgreso.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { EyeIcon } from '@heroicons/react/24/outline';
import { Card, Typography, Button, IconButton } from '@material-tailwind/react';
import { recoleccionService } from '@/services/recoleccionService';

export function RecoleccionesEnProgreso() {
  const [recolecciones, setRecolecciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEnProgreso();
  }, []);

  const loadEnProgreso = async () => {
    try {
      const response = await recoleccionService.getEnProgreso();
      setRecolecciones(response.data.recolecciones || []);
    } catch (error) {
      console.error('Error cargando recolecciones en progreso:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Typography>Cargando...</Typography>;

  return (
    <div className="p-6">
      <Typography variant="h5" className="mb-6">Recolecciones en Progreso</Typography>

      {recolecciones.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          No hay recolecciones en progreso
        </Card>

      ) : (
        <div className="grid gap-4">
          {recolecciones.map(rec => (
            <Card key={rec.id} className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <Typography variant="h6">{rec.ruta}</Typography>
                  <Typography variant="small" color="gray">
                    Camión: {rec.camion} | Inicio: {rec.hora_inicio} | Tiempo: {rec.tiempo_transcurrido}
                  </Typography>
                </div>
                <Link to={`/dashboard/recolecciones/en-progreso/${rec.id}`}>
                  <IconButton variant="text" color="blue">
                    <EyeIcon className="h-5 w-5" />
                  </IconButton>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}