import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PlusIcon,
  FunnelIcon,
  MapPinIcon
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
  Input
} from '@material-tailwind/react';
import { puntoVerdeService } from '@/services/puntoVerdeService';
import { zonaService } from '@/services/zonaService';

const TABLE_HEAD = ["Nombre", "Zona", "Dirección", "Capacidad", "Horario", "Encargado", "Acciones"];

export function PuntosVerdesList() {
  const [puntos, setPuntos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zonas, setZonas] = useState([]);
  const [showFiltros, setShowFiltros] = useState(false);
  const [filtros, setFiltros] = useState({
    id_zona: ''
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPunto, setSelectedPunto] = useState(null);

  useEffect(() => {
    loadPuntos();
    loadZonas();
  }, []);

  const loadPuntos = async () => {
    try {
      setLoading(true);
      const response = await puntoVerdeService.getAll();
      setPuntos(response.data.puntos || []);
    } catch (error) {
      console.error('Error cargando puntos verdes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadZonas = async () => {
    try {
      const response = await zonaService.getForSelect();
      setZonas(response.data.zonas || []);
    } catch (error) {
      console.error('Error cargando zonas:', error);
    }
  };

  const aplicarFiltros = async () => {
    if (!filtros.id_zona) {
      loadPuntos();
      return;
    }

    try {
      setLoading(true);
      const response = await puntoVerdeService.getByZona(filtros.id_zona);
      setPuntos(response.data.puntos || []);
      setShowFiltros(false);
    } catch (error) {
      console.error('Error aplicando filtros:', error);
    } finally {
      setLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setFiltros({ id_zona: '' });
    loadPuntos();
  };

  const confirmDelete = (punto) => {
    setSelectedPunto(punto);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!selectedPunto) return;

    try {
      await puntoVerdeService.delete(selectedPunto.id);
      setShowDeleteDialog(false);
      loadPuntos();
    } catch (error) {
      console.error('Error eliminando punto verde:', error);
      alert('Error al eliminar el punto verde');
    }
  };

  const formatNumero = (num) => {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <Typography variant="h6">Cargando puntos verdes...</Typography>
      </div>
    );
  }

  return (
    <>
      <Card className="h-full w-full overflow-scroll">
        <div className="flex items-center justify-between p-4">
          <Typography variant="h5" color="blue-gray">
            Gestión de Puntos Verdes
          </Typography>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outlined"
              className="flex items-center gap-2"
              onClick={() => setShowFiltros(!showFiltros)}
            >
              <FunnelIcon className="h-4 w-4" /> Filtrar por Zona
            </Button>
            <Link to="/dashboard/puntos-verdes/create">
              <Button size="sm" className="flex items-center gap-2">
                <PlusIcon className="h-4 w-4" /> Nuevo Punto Verde
              </Button>
            </Link>
          </div>
        </div>

        {/* Panel de filtros */}
        {showFiltros && (
          <div className="p-4 border-t border-blue-gray-100 bg-blue-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Select
                  label="Zona"
                  value={filtros.id_zona}
                  onChange={(val) => setFiltros({ ...filtros, id_zona: val })}
                >
                  <Option value="">Todas las zonas</Option>
                  {zonas.map(zona => (
                    <Option key={zona.value} value={zona.value}>
                      {zona.label}
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
                Aplicar Filtro
              </Button>
            </div>
          </div>
        )}

        {puntos.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MapPinIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <Typography variant="h6" color="gray">No hay puntos verdes registrados</Typography>
            <Typography variant="small" color="gray" className="mt-2">
              Comienza creando un nuevo punto verde
            </Typography>
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
              {puntos.map((punto) => (
                <tr key={punto.id} className="even:bg-blue-gray-50/50">
                  <td className="p-4">
                    <Typography variant="small" color="blue-gray" className="font-normal">
                      {punto.nombre}
                    </Typography>
                  </td>
                  <td className="p-4">
                    <Typography variant="small" color="blue-gray" className="font-normal">
                      {punto.zona?.nombre || 'N/A'}
                    </Typography>
                  </td>
                  <td className="p-4">
                    <Typography variant="small" color="blue-gray" className="font-normal">
                      {punto.direccion}
                    </Typography>
                  </td>
                  <td className="p-4">
                    <Typography variant="small" color="blue-gray" className="font-normal">
                      {formatNumero(punto.capacidad)} m³
                    </Typography>
                  </td>
                  <td className="p-4">
                    <Typography variant="small" color="blue-gray" className="font-normal">
                      {punto.horario}
                    </Typography>
                  </td>
                  <td className="p-4">
                    <div>
                      <Typography variant="small" color="blue-gray" className="font-normal">
                        {punto.encargado?.nombre || 'N/A'}
                      </Typography>
                      {punto.encargado?.email && (
                        <Typography variant="small" color="gray" className="text-xs">
                          {punto.encargado.email}
                        </Typography>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Link to={`/dashboard/puntos-verdes/${punto.id}`}>
                        <IconButton variant="text" size="sm">
                          <EyeIcon className="h-4 w-4" />
                        </IconButton>
                      </Link>
                      <Link to={`/dashboard/puntos-verdes/${punto.id}/edit`}>
                        <IconButton variant="text" size="sm">
                          <PencilIcon className="h-4 w-4" />
                        </IconButton>
                      </Link>
                      <IconButton
                        variant="text"
                        size="sm"
                        color="red"
                        onClick={() => confirmDelete(punto)}
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

      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={showDeleteDialog} handler={setShowDeleteDialog}>
        <DialogHeader>Confirmar eliminación</DialogHeader>
        <DialogBody>
          ¿Estás seguro que deseas eliminar el punto verde "{selectedPunto?.nombre}"?
          <Typography variant="small" color="red" className="mt-2">
            Esta acción no se puede deshacer.
          </Typography>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="gray"
            onClick={() => setShowDeleteDialog(false)}
            className="mr-1"
          >
            Cancelar
          </Button>
          <Button variant="gradient" color="red" onClick={handleDelete}>
            Eliminar
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}