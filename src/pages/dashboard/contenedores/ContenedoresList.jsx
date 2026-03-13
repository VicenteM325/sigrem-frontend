import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PlusIcon,
  FunnelIcon,
  CalendarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
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
  Input,
  Tooltip,
  Alert
} from '@material-tailwind/react';
import { contenedorService } from '@/services/contenedorService';
import { puntoVerdeService } from '@/services/puntoVerdeService';
import { materialService } from '@/services/materialService';

const TABLE_HEAD = ["Código", "Punto Verde", "Material", "Capacidad", "Llenado", "Estado", "Acciones"];
const ESTADOS = [
  { value: 'disponible', label: 'Disponible', color: 'green' },
  { value: 'lleno', label: 'Lleno', color: 'yellow' },
  { value: 'mantenimiento', label: 'Mantenimiento', color: 'red' },
];

export function ContenedoresList() {
  const [contenedores, setContenedores] = useState([]);
  const [puntosVerdes, setPuntosVerdes] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFiltros, setShowFiltros] = useState(false);
  const [showVaciadoDialog, setShowVaciadoDialog] = useState(false);
  const [selectedContenedor, setSelectedContenedor] = useState(null);
  const [fechaVaciado, setFechaVaciado] = useState('');
  const [vaciadosPendientes, setVaciadosPendientes] = useState([]);
  const [contenedoresPorLlenar, setContenedoresPorLlenar] = useState([]);

  const [filtros, setFiltros] = useState({
    estado: '',
    id_punto_verde: '',
    id_material: ''
  });

  useEffect(() => {
    loadContenedores();
    loadCatalogos();
    loadVaciadosPendientes();
    loadPorLlenar();
  }, []);

  const loadContenedores = async () => {
    try {
      setLoading(true);
      const response = await contenedorService.getAll();
      setContenedores(response.data.contenedores || []);
    } catch (error) {
      console.error('Error cargando contenedores:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCatalogos = async () => {
    try {
      const [pvRes, matRes] = await Promise.all([
        puntoVerdeService.getForSelect(),
        materialService.getForSelect()
      ]);
      setPuntosVerdes(pvRes.data.puntos || []);
      setMateriales(matRes.data.materiales || []);
    } catch (error) {
      console.error('Error cargando catálogos:', error);
    }
  };

  const loadVaciadosPendientes = async () => {
    try {
      const response = await contenedorService.getVaciadosPendientes();
      setVaciadosPendientes(response.data.vaciados || []);
    } catch (error) {
      console.error('Error cargando vaciados pendientes:', error);
    }
  };

  const loadPorLlenar = async () => {
    try {
      const response = await contenedorService.getPorLlenar();
      setContenedoresPorLlenar(response.data.contenedores || []);
    } catch (error) {
      console.error('Error cargando contenedores por llenar:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este contenedor?')) {
      try {
        await contenedorService.delete(id);
        loadContenedores();
      } catch (error) {
        console.error('Error eliminando contenedor:', error);
        alert('Error al eliminar el contenedor');
      }
    }
  };

  const openProgramarVaciado = (contenedor) => {
    setSelectedContenedor(contenedor);
    setFechaVaciado('');
    setShowVaciadoDialog(true);
  };

  const handleProgramarVaciado = async () => {
    if (!selectedContenedor || !fechaVaciado) return;

    try {
      await contenedorService.programarVaciado({
        id_contenedor: selectedContenedor.id,
        fecha_programada: fechaVaciado
      });
      setShowVaciadoDialog(false);
      loadVaciadosPendientes();
      alert('Vaciado programado correctamente');
    } catch (error) {
      console.error('Error programando vaciado:', error);
      alert('Error al programar vaciado');
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

  const getNivelLlenado = (porcentaje) => {
    if (porcentaje >= 90) return { color: 'red', texto: 'Crítico' };
    if (porcentaje >= 75) return { color: 'yellow', texto: 'Alto' };
    if (porcentaje >= 50) return { color: 'green', texto: 'Medio' };
    return { color: 'blue', texto: 'Bajo' };
  };

  if (loading) return (
    <div className="p-6 text-center">
      <Typography variant="h6">Cargando contenedores...</Typography>
    </div>
  );

  return (
    <>
      {/* Alertas de contenedores por llenar */}
      {contenedoresPorLlenar.length > 0 && (
        <div className="p-4">
          <Alert color="yellow" icon={<ExclamationTriangleIcon className="h-5 w-5" />}>
            <span className="font-bold">{contenedoresPorLlenar.length} contenedores</span> están cerca de su capacidad máxima.
            <Button
              size="sm"
              variant="text"
              className="ml-4"
              onClick={() => document.getElementById('vaciados-section').scrollIntoView({ behavior: 'smooth' })}
            >
              Ver detalles
            </Button>
          </Alert>
        </div>
      )}

      <Card className="h-full w-full overflow-scroll">
        <div className="flex items-center justify-between p-4">
          <Typography variant="h5" color="blue-gray">
            Gestión de Contenedores
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
            <Link to="/dashboard/contenedores/create">
              <Button size="sm" className="flex items-center gap-2">
                <PlusIcon className="h-4 w-4" /> Nuevo Contenedor
              </Button>
            </Link>
          </div>
        </div>

        {/* Panel de filtros */}
        {showFiltros && (
          <div className="p-4 border-t border-blue-gray-100 bg-blue-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Estado"
                value={filtros.estado}
                onChange={(val) => setFiltros({ ...filtros, estado: val })}
              >
                <Option value="">Todos</Option>
                {ESTADOS.map(estado => (
                  <Option key={estado.value} value={estado.value}>
                    {estado.label}
                  </Option>
                ))}
              </Select>
              <Select
                label="Punto Verde"
                value={filtros.id_punto_verde}
                onChange={(val) => setFiltros({ ...filtros, id_punto_verde: val })}
              >
                <Option value="">Todos</Option>
                {puntosVerdes.map(pv => (
                  <Option key={pv.value} value={pv.value}>
                    {pv.label}
                  </Option>
                ))}
              </Select>
              <Select
                label="Material"
                value={filtros.id_material}
                onChange={(val) => setFiltros({ ...filtros, id_material: val })}
              >
                <Option value="">Todos</Option>
                {materiales.map(mat => (
                  <Option key={mat.value} value={mat.value}>
                    {mat.label}
                  </Option>
                ))}
              </Select>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button size="sm" variant="outlined" onClick={() => setFiltros({ estado: '', id_punto_verde: '', id_material: '' })}>
                Limpiar
              </Button>
              <Button size="sm" color="blue" onClick={loadContenedores}>
                Aplicar Filtros
              </Button>
            </div>
          </div>
        )}

        {contenedores.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay contenedores registrados
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
              {contenedores.map((contenedor) => {
                const nivelLlenado = getNivelLlenado(contenedor.llenado);
                return (
                  <tr key={contenedor.id} className="even:bg-blue-gray-50/50">
                    <td className="p-4">
                      <Typography variant="small" color="blue-gray" className="font-normal">
                        CONT-{contenedor.id.toString().padStart(4, '0')}
                      </Typography>
                    </td>
                    <td className="p-4">
                      <Typography variant="small" color="blue-gray" className="font-normal">
                        {contenedor.punto_verde?.nombre || 'N/A'}
                      </Typography>
                    </td>
                    <td className="p-4">
                      <Typography variant="small" color="blue-gray" className="font-normal">
                        {contenedor.material?.nombre || 'N/A'}
                      </Typography>
                    </td>
                    <td className="p-4">
                      <Typography variant="small" color="blue-gray" className="font-normal">
                        {contenedor.capacidad} m³
                      </Typography>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className={`bg-${nivelLlenado.color}-500 h-2 rounded-full`}
                            style={{ width: `${Math.min(contenedor.llenado, 100)}%` }}
                          />
                        </div>
                        <Typography variant="small" color={nivelLlenado.color} className="font-medium">
                          {contenedor.llenado}%
                        </Typography>
                      </div>
                    </td>
                    <td className="p-4">
                      <Chip
                        size="sm"
                        value={getEstadoTexto(contenedor.estado)}
                        color={getEstadoColor(contenedor.estado)}
                        className="w-fit"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <Link to={`/dashboard/contenedores/${contenedor.id}`}>
                          <Tooltip content="Ver detalles">
                            <IconButton variant="text" size="sm">
                              <EyeIcon className="h-4 w-4" />
                            </IconButton>
                          </Tooltip>
                        </Link>

                        {contenedor.estado === 'lleno' && (
                          <Tooltip content="Programar vaciado">
                            <IconButton
                              variant="text"
                              size="sm"
                              color="yellow"
                              onClick={() => openProgramarVaciado(contenedor)}
                            >
                              <CalendarIcon className="h-4 w-4" />
                            </IconButton>
                          </Tooltip>
                        )}

                        <Link to={`/dashboard/contenedores/${contenedor.id}/edit`}>
                          <Tooltip content="Editar">
                            <IconButton variant="text" size="sm">
                              <PencilIcon className="h-4 w-4" />
                            </IconButton>
                          </Tooltip>
                        </Link>

                        <Tooltip content="Eliminar">
                          <IconButton
                            variant="text"
                            size="sm"
                            color="red"
                            onClick={() => handleDelete(contenedor.id)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      {/* Sección de vaciados pendientes */}
      <div id="vaciados-section" className="mt-8">
        <Typography variant="h5" color="blue-gray" className="mb-4">
          Vaciados Programados
        </Typography>

        {vaciadosPendientes.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            No hay vaciados programados
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vaciadosPendientes.map((vaciado) => (
              <Card key={vaciado.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <Typography variant="h6">
                      {vaciado.contenedor?.punto_verde}
                    </Typography>
                    <Typography variant="small" color="gray">
                      Material: {vaciado.contenedor?.material}
                    </Typography>
                    <Typography variant="small" color="gray">
                      Capacidad: {vaciado.contenedor?.capacidad} m³
                    </Typography>
                    <Typography variant="small" color="gray">
                      Llenado actual: {vaciado.contenedor?.llenado}%
                    </Typography>
                  </div>
                  <Chip
                    size="sm"
                    value={`${new Date(vaciado.fecha_programada).toLocaleDateString()}`}
                    color="blue"
                  />
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    color="green"
                    className="flex-1"
                    onClick={async () => {
                      try {
                        await contenedorService.realizarVaciado(vaciado.id);
                        loadVaciadosPendientes();
                        loadContenedores();
                      } catch (error) {
                        console.error('Error:', error);
                      }
                    }}
                  >
                    Realizar Vaciado
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Diálogo para programar vaciado */}
      <Dialog open={showVaciadoDialog} handler={setShowVaciadoDialog}>
        <DialogHeader>Programar Vaciado de Contenedor</DialogHeader>
        <DialogBody>
          {selectedContenedor ? (
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <Typography variant="small" color="blue-gray">
                  <strong>Punto Verde:</strong> {selectedContenedor.punto_verde?.nombre || 'N/A'}
                </Typography>
                <Typography variant="small" color="blue-gray">
                  <strong>Material:</strong> {selectedContenedor.material?.nombre || 'N/A'}
                </Typography>
                <Typography variant="small" color="blue-gray">
                  <strong>Llenado actual:</strong> {selectedContenedor.llenado || 0}%
                </Typography>
              </div>

              <Input
                type="date"
                label="Fecha programada"
                value={fechaVaciado}
                onChange={(e) => setFechaVaciado(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          ) : (
            <div className="text-center py-4">
              <Typography variant="paragraph" color="gray">
                Cargando información del contenedor...
              </Typography>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={() => setShowVaciadoDialog(false)}
            className="mr-1"
          >
            Cancelar
          </Button>
          <Button
            variant="gradient"
            color="green"
            onClick={handleProgramarVaciado}
            disabled={!fechaVaciado || !selectedContenedor}
          >
            Programar
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}