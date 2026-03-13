// src/pages/dashboard/recolecciones/RecoleccionesList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { EyeIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { 
  Card, 
  Typography, 
  Button, 
  IconButton, 
  Chip,
  Select,
  Option,
  Input
} from '@material-tailwind/react';
import { recoleccionService } from '@/services/recoleccionService';

const TABLE_HEAD = ["ID", "Ruta", "Camión", "Fecha", "Estado", "Basura", "Acciones"];
const ESTADOS = [
  { value: 'programada', label: 'Programada', color: 'blue' },
  { value: 'en_proceso', label: 'En Proceso', color: 'yellow' },
  { value: 'completada', label: 'Completada', color: 'green' },
  { value: 'incompleta', label: 'Incompleta', color: 'red' },
];

export function RecoleccionesList() {
  const [recolecciones, setRecolecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    estado: '',
    fecha: ''
  });
  const [showFiltros, setShowFiltros] = useState(false);

  useEffect(() => {
    loadRecolecciones();
  }, []);

  const loadRecolecciones = async () => {
    try {
      setLoading(true);
      const response = await recoleccionService.getAll();
      setRecolecciones(response.data.recolecciones || []);
    } catch (error) {
      console.error('Error cargando recolecciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = async () => {
    // Aquí implementarías la lógica de filtrado
    setShowFiltros(false);
  };

  const getEstadoColor = (estado) => {
    const estadoObj = ESTADOS.find(e => e.value === estado);
    return estadoObj?.color || 'gray';
  };

  const getEstadoTexto = (estado) => {
    const estadoObj = ESTADOS.find(e => e.value === estado);
    return estadoObj?.label || estado;
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <Typography>Cargando recolecciones...</Typography>
      </div>
    );
  }

  return (
    <Card className="h-full w-full overflow-scroll">
      <div className="flex items-center justify-between p-4">
        <Typography variant="h5" color="blue-gray">
          Gestión de Recolecciones
        </Typography>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outlined"
            className="flex items-center gap-2"
            onClick={() => setShowFiltros(!showFiltros)}
          >
            <FunnelIcon className="h-4 w-4" /> Filtros
          </Button>
        </div>
      </div>

      {showFiltros && (
        <div className="p-4 border-t border-blue-gray-100 bg-blue-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Estado"
              value={filtros.estado}
              onChange={(val) => setFiltros({...filtros, estado: val})}
            >
              <Option value="">Todos</Option>
              {ESTADOS.map(estado => (
                <Option key={estado.value} value={estado.value}>
                  {estado.label}
                </Option>
              ))}
            </Select>
            <Input
              type="date"
              label="Fecha"
              value={filtros.fecha}
              onChange={(e) => setFiltros({...filtros, fecha: e.target.value})}
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button size="sm" variant="outlined" onClick={() => setFiltros({estado: '', fecha: ''})}>
              Limpiar
            </Button>
            <Button size="sm" color="blue" onClick={aplicarFiltros}>
              Aplicar Filtros
            </Button>
          </div>
        </div>
      )}

      {recolecciones.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No hay recolecciones registradas
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
            {recolecciones.map((rec) => (
              <tr key={rec.id_recoleccion} className="even:bg-blue-gray-50/50">
                <td className="p-4">
                  <Typography variant="small" color="blue-gray">
                    {rec.id_recoleccion}
                  </Typography>
                </td>
                <td className="p-4">
                  <Typography variant="small" color="blue-gray">
                    {rec.asignacion?.ruta?.nombre || 'N/A'}
                  </Typography>
                </td>
                <td className="p-4">
                  <Typography variant="small" color="blue-gray">
                    {rec.asignacion?.camion?.placa || 'N/A'}
                  </Typography>
                </td>
                <td className="p-4">
                  <Typography variant="small" color="blue-gray">
                    {formatFecha(rec.asignacion?.fecha_programada)}
                  </Typography>
                </td>
                <td className="p-4">
                  <Chip
                    size="sm"
                    value={getEstadoTexto(rec.estado)}
                    color={getEstadoColor(rec.estado)}
                    className="w-fit"
                  />
                </td>
                <td className="p-4">
                  <Typography variant="small" color="blue-gray">
                    {rec.basura_recolectada ? `${rec.basura_recolectada} t` : '-'}
                  </Typography>
                </td>
                <td className="p-4">
                  <Link to={`/dashboard/recolecciones/${rec.id_recoleccion}`}>
                    <IconButton variant="text" size="sm">
                      <EyeIcon className="h-4 w-4" />
                    </IconButton>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}