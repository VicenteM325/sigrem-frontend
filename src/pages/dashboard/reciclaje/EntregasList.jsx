import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  EyeIcon, 
  PlusIcon,
  FunnelIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { 
  Card, 
  Typography, 
  Button, 
  IconButton, 
  Chip,
  Input,
  Select,
  Option,
  Tooltip
} from '@material-tailwind/react';
import { entregaReciclajeService } from '@/services/entregaReciclajeService';
import { puntoVerdeService } from '@/services/puntoVerdeService';
import { materialService } from '@/services/materialService';

const TABLE_HEAD = ["ID", "Ciudadano", "Punto Verde", "Material", "Cantidad", "Fecha", "Acciones"];

export function EntregasList() {
  const [entregas, setEntregas] = useState([]);
  const [puntosVerdes, setPuntosVerdes] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFiltros, setShowFiltros] = useState(false);
  const [filtros, setFiltros] = useState({
    fecha: '',
    id_punto_verde: '',
    id_material: ''
  });
  const [resumenDia, setResumenDia] = useState(null);

  useEffect(() => {
    loadData();
    loadResumenDia();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [entregasRes, pvRes, matRes] = await Promise.all([
        entregaReciclajeService.getAll(),
        puntoVerdeService.getForSelect(),
        materialService.getForSelect()
      ]);
      
      setEntregas(entregasRes.data.entregas || []);
      setPuntosVerdes(pvRes.data.puntos_verdes || []);
      setMateriales(matRes.data.materiales || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadResumenDia = async () => {
    try {
      const response = await entregaReciclajeService.getDelDia();
      setResumenDia(response.data);
    } catch (error) {
      console.error('Error cargando resumen del día:', error);
    }
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return (
    <div className="p-6 text-center">
      <Typography variant="h6">Cargando entregas...</Typography>
    </div>
  );

  return (
    <>
      {/* Resumen del día */}
      {resumenDia && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-blue-50">
            <Typography variant="small" color="blue-gray" className="font-normal">
              Entregas hoy
            </Typography>
            <Typography variant="h4" color="blue">
              {resumenDia.total}
            </Typography>
          </Card>
          <Card className="p-4 bg-green-50">
            <Typography variant="small" color="blue-gray" className="font-normal">
              Total reciclado hoy
            </Typography>
            <Typography variant="h4" color="green">
              {resumenDia.total_kg} kg
            </Typography>
          </Card>
          <Link to="/dashboard/reciclaje/estadisticas">
            <Card className="p-4 bg-purple-50 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="small" color="blue-gray" className="font-normal">
                    Ver estadísticas
                  </Typography>
                  <Typography variant="h6" color="purple">
                    Reportes
                  </Typography>
                </div>
                <ChartBarIcon className="h-8 w-8 text-purple-500" />
              </div>
            </Card>
          </Link>
        </div>
      )}

      <Card className="h-full w-full overflow-scroll">
        <div className="flex items-center justify-between p-4">
          <Typography variant="h5" color="blue-gray">
            Gestión de Entregas de Reciclaje
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
            <Link to="/dashboard/reciclaje/nueva-entrega">
              <Button size="sm" className="flex items-center gap-2">
                <PlusIcon className="h-4 w-4" /> Nueva Entrega
              </Button>
            </Link>
          </div>
        </div>

        {/* Panel de filtros */}
        {showFiltros && (
          <div className="p-4 border-t border-blue-gray-100 bg-blue-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                type="date"
                label="Fecha"
                value={filtros.fecha}
                onChange={(e) => setFiltros({...filtros, fecha: e.target.value})}
              />
              <Select
                label="Punto Verde"
                value={filtros.id_punto_verde}
                onChange={(val) => setFiltros({...filtros, id_punto_verde: val})}
              >
                <Option value="">Todos</Option>
                {puntosVerdes.map(pv => (
                  <Option key={pv.value} value={String(pv.value)}>
                    {pv.label}
                  </Option>
                ))}
              </Select>
              <Select
                label="Material"
                value={filtros.id_material}
                onChange={(val) => setFiltros({...filtros, id_material: val})}
              >
                <Option value="">Todos</Option>
                {materiales.map(mat => (
                  <Option key={mat.value} value={String(mat.value)}>
                    {mat.label}
                  </Option>
                ))}
              </Select>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button size="sm" variant="outlined" onClick={() => setFiltros({fecha: '', id_punto_verde: '', id_material: ''})}>
                Limpiar
              </Button>
              <Button size="sm" color="blue" onClick={loadData}>
                Aplicar
              </Button>
            </div>
          </div>
        )}

        {entregas.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay entregas registradas
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
              {entregas.map((entrega) => (
                <tr key={entrega.id} className="even:bg-blue-gray-50/50">
                  <td className="p-4">
                    <Typography variant="small" color="blue-gray">
                      #{entrega.id}
                    </Typography>
                  </td>
                  <td className="p-4">
                    <Typography variant="small" color="blue-gray">
                      {entrega.ciudadano?.nombre || 'N/A'}
                    </Typography>
                    <Typography variant="small" color="gray" className="text-xs">
                      {entrega.ciudadano?.puntos} pts
                    </Typography>
                  </td>
                  <td className="p-4">
                    <Typography variant="small" color="blue-gray">
                      {entrega.punto_verde?.nombre || 'N/A'}
                    </Typography>
                  </td>
                  <td className="p-4">
                    <Typography variant="small" color="blue-gray">
                      {entrega.material?.nombre || 'N/A'}
                    </Typography>
                  </td>
                  <td className="p-4">
                    <Typography variant="small" color="blue-gray" className="font-bold">
                      {entrega.cantidad} kg
                    </Typography>
                  </td>
                  <td className="p-4">
                    <Typography variant="small" color="blue-gray">
                      {formatFecha(entrega.fecha)}
                    </Typography>
                  </td>
                  <td className="p-4">
                    <Link to={`/dashboard/reciclaje/${entrega.id}`}>
                      <Tooltip content="Ver detalles">
                        <IconButton variant="text" size="sm">
                          <EyeIcon className="h-4 w-4" />
                        </IconButton>
                      </Tooltip>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}