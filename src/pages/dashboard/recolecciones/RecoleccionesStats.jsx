// pages/Recolecciones/RecoleccionesStats.jsx
import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon,
  ChartBarIcon,
  TruckIcon,
  GlobeAltIcon
} from '@heroicons/react/24/solid';
import { Card, Typography, Input, Button } from '@material-tailwind/react';
import { recoleccionService } from '@/services/recoleccionService';

export function RecoleccionesStats() {
  const [fechaInicio, setFechaInicio] = useState(
    new Date(new Date().setDate(1)).toISOString().split('T')[0]
  );
  const [fechaFin, setFechaFin] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      const response = await recoleccionService.getEstadisticas(fechaInicio, fechaFin);
      setStats(response.data);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h5">Estadísticas de Recolección</Typography>
        <div className="flex gap-2">
          <Input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            containerProps={{ className: 'min-w-[150px]' }}
          />
          <Input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            containerProps={{ className: 'min-w-[150px]' }}
          />
          <Button size="sm" onClick={cargarEstadisticas} loading={loading}>
            Actualizar
          </Button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <Typography variant="small" color="gray">Total Recolecciones</Typography>
                <Typography variant="h5">{stats.total_recolecciones}</Typography>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TruckIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <Typography variant="small" color="gray">Total Basura</Typography>
                <Typography variant="h5">{stats.total_basura} ton</Typography>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <GlobeAltIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <Typography variant="small" color="gray">Promedio por Recolección</Typography>
                <Typography variant="h5">{stats.promedio_basura} ton</Typography>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <Typography variant="small" color="gray">Tiempo Promedio</Typography>
                <Typography variant="h5">{Math.round(stats.tiempo_promedio / 60)} horas</Typography>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}