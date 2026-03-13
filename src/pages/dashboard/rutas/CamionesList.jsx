import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PencilIcon, TrashIcon, EyeIcon, PlusIcon } from '@heroicons/react/24/solid';
import { Card, Typography, Button, IconButton, Chip } from '@material-tailwind/react';
import { camionService } from '@/services/camionService';

const TABLE_HEAD = ["Placa", "Capacidad", "Estado", "Conductor", "Acciones"];

export function CamionesList() {
  const [camiones, setCamiones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCamiones();
  }, []);

  const loadCamiones = async () => {
    try {
      setLoading(true);
      const response = await camionService.getAll();
      
      if (response?.data?.camiones) {
        setCamiones(response.data.camiones);
      } else {
        setCamiones([]);
      }
    } catch (error) {
      console.error('Error cargando camiones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este camión?')) {
      try {
        await camionService.delete(id);
        loadCamiones();
      } catch (error) {
        console.error('Error eliminando camión:', error);
        alert('Error al eliminar el camión');
      }
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

  if (loading) return <div className="p-6 text-center">Cargando camiones...</div>;

  return (
    <Card className="h-full w-full overflow-scroll">
      <div className="flex items-center justify-between p-4">
        <Typography variant="h5" color="blue-gray">
          Gestión de Camiones
        </Typography>
        <Link to="/dashboard/camiones/create">
          <Button size="sm" className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" /> Nuevo Camión
          </Button>
        </Link>
      </div>

      {camiones.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No hay camiones registrados
        </div>
      ) : (
        <table className="w-full min-w-max table-auto text-left">
          <thead>
            <tr>
              {TABLE_HEAD.map((head) => (
                <th key={head} className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                  <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                    {head}
                  </Typography>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {camiones.map((camion) => (
              <tr key={camion.id} className="even:bg-blue-gray-50/50">
                <td className="p-4">
                  <Typography variant="small" color="blue-gray" className="font-normal">
                    {camion.placa}
                  </Typography>
                </td>
                <td className="p-4">
                  <Typography variant="small" color="blue-gray" className="font-normal">
                    {camion.capacidad} ton
                  </Typography>
                </td>
                <td className="p-4">
                  <Chip
                    size="sm"
                    value={camion.estado}
                    color={getEstadoColor(camion.estado)}
                    className="w-fit"
                  />
                </td>
                <td className="p-4">
                  <Typography variant="small" color="blue-gray" className="font-normal">
                    {camion.conductor?.nombre_completo || 'Sin conductor'}
                  </Typography>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <Link to={`/dashboard/camiones/${camion.id}`}>
                      <IconButton variant="text" size="sm">
                        <EyeIcon className="h-4 w-4" />
                      </IconButton>
                    </Link>
                    <Link to={`/dashboard/camiones/${camion.id}/edit`}>
                      <IconButton variant="text" size="sm">
                        <PencilIcon className="h-4 w-4" />
                      </IconButton>
                    </Link>
                    <IconButton 
                      variant="text" 
                      size="sm" 
                      color="red"
                      onClick={() => handleDelete(camion.id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </IconButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}