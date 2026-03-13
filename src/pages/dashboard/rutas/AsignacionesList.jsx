import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon, 
  PlusIcon,
  CalendarIcon,
  FunnelIcon
} from '@heroicons/react/24/solid';
import { 
  Card, 
  Typography, 
  Button, 
  IconButton, 
  Chip,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Select,
  Option,
  Input
} from '@material-tailwind/react';
import { asignacionService } from '@/services/asignacionService';
import { rutaService } from '@/services/rutaService';
import { camionService } from '@/services/camionService';

const TABLE_HEAD = ["Fecha", "Ruta", "Camión", "Estado", "Total Est.", "Acciones"];
const ESTADOS = [
  { value: 'programada', label: 'Programada', color: 'blue' },
  { value: 'en_proceso', label: 'En Proceso', color: 'yellow' },
  { value: 'completada', label: 'Completada', color: 'green' },
  { value: 'cancelada', label: 'Cancelada', color: 'red' },
];

export function AsignacionesList() {
  const [asignaciones, setAsignaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    fecha: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado: '',
    id_camion: '',
    id_ruta: ''
  });
  const [showFiltros, setShowFiltros] = useState(false);
  const [rutas, setRutas] = useState([]);
  const [camiones, setCamiones] = useState([]);
  const [selectedAsignacion, setSelectedAsignacion] = useState(null);
  const [showEstadoDialog, setShowEstadoDialog] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [totalReal, setTotalReal] = useState('');

  useEffect(() => {
    loadAsignaciones();
    loadRutas();
    loadCamiones();
  }, []);

  const loadAsignaciones = async () => {
    try {
      setLoading(true);
      const response = await asignacionService.getAll();
      setAsignaciones(response.data.asignaciones || []);
    } catch (error) {
      console.error('Error cargando asignaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRutas = async () => {
    try {
      const response = await rutaService.getAll();
      setRutas(response.data.rutas || []);
    } catch (error) {
      console.error('Error cargando rutas:', error);
    }
  };

  const loadCamiones = async () => {
    try {
      const response = await camionService.getAll();
      setCamiones(response.data.camiones || []);
    } catch (error) {
      console.error('Error cargando camiones:', error);
    }
  };

  const aplicarFiltros = async () => {
    try {
      setLoading(true);
      const response = await asignacionService.getAll(filtros);
      setAsignaciones(response.data.asignaciones || []);
      setShowFiltros(false);
    } catch (error) {
      console.error('Error aplicando filtros:', error);
    } finally {
      setLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setFiltros({
      fecha: '',
      fecha_inicio: '',
      fecha_fin: '',
      estado: '',
      id_camion: '',
      id_ruta: ''
    });
    loadAsignaciones();
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta asignación?')) {
      try {
        await asignacionService.delete(id);
        loadAsignaciones();
      } catch (error) {
        console.error('Error eliminando asignación:', error);
        alert('Error al eliminar la asignación');
      }
    }
  };

  const openCambiarEstado = (asignacion) => {
    setSelectedAsignacion(asignacion);
    setNuevoEstado(asignacion.estado);
    setTotalReal('');
    setShowEstadoDialog(true);
  };

  const handleCambiarEstado = async () => {
    if (!selectedAsignacion) return;

    try {
      await asignacionService.cambiarEstado(
        selectedAsignacion.id, 
        nuevoEstado,
        nuevoEstado === 'completada' ? totalReal : null
      );
      setShowEstadoDialog(false);
      loadAsignaciones();
    } catch (error) {
      console.error('Error cambiando estado:', error);
      alert('Error al cambiar estado');
    }
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

  if (loading) return (
    <div className="p-6 text-center">
      <Typography variant="h6">Cargando asignaciones...</Typography>
    </div>
  );

  return (
    <>
      <Card className="h-full w-full overflow-scroll">
        <div className="flex items-center justify-between p-4">
          <Typography variant="h5" color="blue-gray">
            Gestión de Asignaciones
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
            <Link to="/dashboard/asignaciones/create">
              <Button size="sm" className="flex items-center gap-2">
                <PlusIcon className="h-4 w-4" /> Nueva Asignación
              </Button>
            </Link>
          </div>
        </div>

        {/* Panel de filtros */}
        {showFiltros && (
          <div className="p-4 border-t border-blue-gray-100 bg-blue-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Input
                  type="date"
                  label="Fecha exacta"
                  value={filtros.fecha}
                  onChange={(e) => setFiltros({...filtros, fecha: e.target.value})}
                  size="md"
                />
              </div>
              <div>
                <Input
                  type="date"
                  label="Fecha inicio"
                  value={filtros.fecha_inicio}
                  onChange={(e) => setFiltros({...filtros, fecha_inicio: e.target.value})}
                  size="md"
                />
              </div>
              <div>
                <Input
                  type="date"
                  label="Fecha fin"
                  value={filtros.fecha_fin}
                  onChange={(e) => setFiltros({...filtros, fecha_fin: e.target.value})}
                  size="md"
                />
              </div>
              <div>
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
              </div>
              <div>
                <Select
                  label="Ruta"
                  value={filtros.id_ruta}
                  onChange={(val) => setFiltros({...filtros, id_ruta: val})}
                >
                  <Option value="">Todas</Option>
                  {rutas.map(ruta => (
                    <Option key={ruta.id} value={ruta.id}>
                      {ruta.nombre}
                    </Option>
                  ))}
                </Select>
              </div>
              <div>
                <Select
                  label="Camión"
                  value={filtros.id_camion}
                  onChange={(val) => setFiltros({...filtros, id_camion: val})}
                >
                  <Option value="">Todos</Option>
                  {camiones.map(camion => (
                    <Option key={camion.id} value={camion.id}>
                      {camion.placa}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button size="sm" variant="outlined" onClick={limpiarFiltros}>
                Limpiar
              </Button>
              <Button size="sm" color="blue" onClick={aplicarFiltros}>
                Aplicar Filtros
              </Button>
            </div>
          </div>
        )}

        {asignaciones.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay asignaciones registradas
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
              {asignaciones.map((asignacion) => (
                <tr key={asignacion.id} className="even:bg-blue-gray-50/50">
                  <td className="p-4">
                    <Typography variant="small" color="blue-gray" className="font-normal">
                      {formatFecha(asignacion.fecha)}
                    </Typography>
                  </td>
                  <td className="p-4">
                    <Typography variant="small" color="blue-gray" className="font-normal">
                      {asignacion.ruta?.nombre || 'N/A'}
                    </Typography>
                    <Typography variant="small" color="gray" className="font-normal text-xs">
                      {asignacion.ruta?.zona?.nombre || ''}
                    </Typography>
                  </td>
                  <td className="p-4">
                    <Typography variant="small" color="blue-gray" className="font-normal">
                      {asignacion.camion?.placa || 'N/A'}
                    </Typography>
                    <Typography variant="small" color="gray" className="font-normal text-xs">
                      {asignacion.camion?.conductor?.nombre_completo || 'Sin conductor'}
                    </Typography>
                  </td>
                  <td className="p-4">
                    <Chip
                      size="sm"
                      value={getEstadoTexto(asignacion.estado)}
                      color={getEstadoColor(asignacion.estado)}
                      className="w-fit"
                    />
                  </td>
                  <td className="p-4">
                    <Typography variant="small" color="blue-gray" className="font-normal">
                      {asignacion.total_estimado ? `${asignacion.total_estimado} kg` : 'N/A'}
                    </Typography>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Link to={`/dashboard/asignaciones/${asignacion.id}`}>
                        <IconButton variant="text" size="sm">
                          <EyeIcon className="h-4 w-4" />
                        </IconButton>
                      </Link>
                      {asignacion.estado !== 'completada' && asignacion.estado !== 'cancelada' && (
                        <>
                          <Link to={`/dashboard/asignaciones/${asignacion.id}/edit`}>
                            <IconButton variant="text" size="sm">
                              <PencilIcon className="h-4 w-4" />
                            </IconButton>
                          </Link>
                          <IconButton 
                            variant="text" 
                            size="sm" 
                            color="yellow"
                            onClick={() => openCambiarEstado(asignacion)}
                          >
                            <CalendarIcon className="h-4 w-4" />
                          </IconButton>
                        </>
                      )}
                      <IconButton 
                        variant="text" 
                        size="sm" 
                        color="red"
                        onClick={() => handleDelete(asignacion.id)}
                        disabled={asignacion.estado === 'en_proceso' || asignacion.estado === 'completada'}
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

      {/* Diálogo para cambiar estado */}
      <Dialog open={showEstadoDialog} handler={setShowEstadoDialog}>
        <DialogHeader>Cambiar Estado de Asignación</DialogHeader>
        <DialogBody>
          <div className="space-y-4">
            <Select
              label="Nuevo Estado"
              value={nuevoEstado}
              onChange={(val) => setNuevoEstado(val)}
            >
              {ESTADOS.map(estado => (
                <Option key={estado.value} value={estado.value}>
                  {estado.label}
                </Option>
              ))}
            </Select>

            {nuevoEstado === 'completada' && (
              <Input
                type="number"
                label="Total Real (kg)"
                value={totalReal}
                onChange={(e) => setTotalReal(e.target.value)}
                required
              />
            )}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={() => setShowEstadoDialog(false)}
            className="mr-1"
          >
            Cancelar
          </Button>
          <Button variant="gradient" color="green" onClick={handleCambiarEstado}>
            Confirmar
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}