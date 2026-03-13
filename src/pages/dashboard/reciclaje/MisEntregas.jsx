import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Chip } from '@material-tailwind/react';
import { entregaReciclajeService } from '@/services/entregaReciclajeService';
import { PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export function MisEntregas() {
  const { user } = useAuth();
  const [entregas, setEntregas] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.ciudadano_id) {
      loadMisEntregas();
    }
  }, [user]);

  const loadMisEntregas = async () => {
    try {
      setLoading(true);
      const response = await entregaReciclajeService.getByCiudadano(user.ciudadano_id);
      setEntregas(response.data.entregas || []);
      setResumen({
        total: response.data.total,
        total_kg: response.data.total_kg,
        puntos: response.data.ciudadano?.puntos,
        nivel: response.data.ciudadano?.nivel
      });
    } catch (error) {
      console.error('Error cargando mis entregas:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <ArrowPathIcon className="h-8 w-8 animate-spin mx-auto text-green-600" />
        <Typography variant="h6" className="mt-4">Cargando tus entregas...</Typography>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h4" color="blue-gray">
          Mis Entregas de Reciclaje
        </Typography>
        <Link to="/dashboard/reciclaje/nueva-entrega">
          <Button color="green" className="flex items-center gap-2">
            <PlusIcon className="h-5 w-5" /> Nueva Entrega
          </Button>
        </Link>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
          <Typography variant="h6" className="mb-2">Puntos Acumulados</Typography>
          <Typography variant="h2">{resumen?.puntos || 0}</Typography>
          <Typography variant="small">Nivel: {resumen?.nivel || 'Principiante'}</Typography>
        </Card>
        
        <Card className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <Typography variant="h6" className="mb-2">Total Entregas</Typography>
          <Typography variant="h2">{resumen?.total || 0}</Typography>
          <Typography variant="small">entregas realizadas</Typography>
        </Card>
        
        <Card className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <Typography variant="h6" className="mb-2">Total Reciclado</Typography>
          <Typography variant="h2">{resumen?.total_kg || 0} kg</Typography>
          <Typography variant="small">material reciclado</Typography>
        </Card>
      </div>

      {/* Lista de entregas */}
      <Typography variant="h5" className="mb-4">Historial de Entregas</Typography>
      
      {entregas.length === 0 ? (
        <Card className="p-8 text-center">
          <Typography variant="h6" color="gray">No has realizado entregas aún</Typography>
          <Link to="/dashboard/reciclaje/nueva-entrega">
            <Button color="green" className="mt-4">¡Haz tu primera entrega!</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {entregas.map((entrega) => (
            <Card key={entrega.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-center">
                <div>
                  <Typography variant="h6" color="blue-gray">
                    {entrega.material?.nombre}
                  </Typography>
                  <Typography variant="small" color="gray">
                    {entrega.punto_verde?.nombre}
                  </Typography>
                  <Typography variant="small" color="gray" className="text-xs">
                    {formatFecha(entrega.fecha)}
                  </Typography>
                </div>
                <div className="text-right">
                  <Chip
                    value={`${entrega.cantidad} kg`}
                    color="green"
                    className="mb-1"
                  />
                  <Typography variant="small" color="blue-gray" className="font-bold">
                    +{Math.floor(entrega.cantidad)} puntos
                  </Typography>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}