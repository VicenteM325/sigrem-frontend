import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeftIcon, PencilIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { Card, Typography, Button, Chip, Dialog, DialogHeader, DialogBody, DialogFooter, Select, Option, Input } from '@material-tailwind/react';
import { asignacionService } from '@/services/asignacionService';

const ESTADOS = [
    { value: 'programada', label: 'Programada', color: 'blue' },
    { value: 'en_proceso', label: 'En Proceso', color: 'yellow' },
    { value: 'completada', label: 'Completada', color: 'green' },
    { value: 'cancelada', label: 'Cancelada', color: 'red' },
];

export function AsignacionDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [asignacion, setAsignacion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showEstadoDialog, setShowEstadoDialog] = useState(false);
    const [nuevoEstado, setNuevoEstado] = useState('');
    const [totalReal, setTotalReal] = useState('');

    useEffect(() => {
        loadAsignacion();
    }, [id]);

    const loadAsignacion = async () => {
        try {
            setLoading(true);
            const response = await asignacionService.getById(id);
            setAsignacion(response.data.asignacion);
            setNuevoEstado(response.data.asignacion.estado);
        } catch (error) {
            console.error('Error cargando asignación:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCambiarEstado = async () => {
        try {
            await asignacionService.cambiarEstado(
                id,
                nuevoEstado,
                nuevoEstado === 'completada' ? totalReal : null
            );
            setShowEstadoDialog(false);
            loadAsignacion();
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
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatHora = (hora) => {
        if (!hora) return 'N/A';
        const partes = hora.split(':');
        if (partes.length >= 2) {
            return `${partes[0]}:${partes[1]}`;
        }
        return hora;
    };

    if (loading) {
        return (
            <div className="p-6 text-center">
                <Typography variant="h6">Cargando detalles de la asignación...</Typography>
            </div>
        );
    }

    if (!asignacion) {
        return (
            <div className="p-6 text-center">
                <Typography variant="h6" color="red">Asignación no encontrada</Typography>
                <Button
                    variant="text"
                    onClick={() => navigate('/dashboard/asignaciones')}
                    className="mt-4"
                >
                    Volver a la lista
                </Button>
            </div>
        );
    }

    return (
        <>
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="text"
                            size="sm"
                            onClick={() => navigate('/dashboard/asignaciones')}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeftIcon className="h-4 w-4" /> Volver
                        </Button>
                        <Typography variant="h5" color="blue-gray">
                            Detalles de Asignación
                        </Typography>
                    </div>
                    <div className="flex gap-2">
                        {asignacion.estado !== 'completada' && asignacion.estado !== 'cancelada' && (
                            <>
                                <Button
                                    size="sm"
                                    color="yellow"
                                    className="flex items-center gap-2"
                                    onClick={() => setShowEstadoDialog(true)}
                                >
                                    <CalendarIcon className="h-4 w-4" /> Cambiar Estado
                                </Button>
                                <Link to={`/dashboard/asignaciones/${id}/edit`}>
                                    <Button size="sm" className="flex items-center gap-2">
                                        <PencilIcon className="h-4 w-4" /> Editar
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Información principal */}
                    <Card className="p-6">
                        <Typography variant="h6" color="blue-gray" className="mb-4">
                            Información General
                        </Typography>

                        <div className="space-y-4">
                            <div>
                                <Typography variant="small" color="gray" className="font-normal">
                                    Fecha Programada
                                </Typography>
                                <Typography variant="h6" color="blue-gray">
                                    {formatFecha(asignacion.fecha)}
                                </Typography>
                            </div>

                            <div>
                                <Typography variant="small" color="gray" className="font-normal">
                                    Estado
                                </Typography>
                                <Chip
                                    size="sm"
                                    value={getEstadoTexto(asignacion.estado)}
                                    color={getEstadoColor(asignacion.estado)}
                                    className="w-fit mt-1"
                                />
                            </div>

                            <div>
                                <Typography variant="small" color="gray" className="font-normal">
                                    Total Estimado
                                </Typography>
                                <Typography variant="h6" color="blue-gray">
                                    {asignacion.total_estimado ? `${asignacion.total_estimado} kg` : 'No especificado'}
                                </Typography>
                            </div>
                        </div>
                    </Card>

                    {/* Información de Ruta */}
                    <Card className="p-6">
                        <Typography variant="h6" color="blue-gray" className="mb-4">
                            Ruta Asignada
                        </Typography>

                        {asignacion.ruta && (
                            <div className="space-y-4">
                                <div>
                                    <Typography variant="small" color="gray" className="font-normal">
                                        Nombre
                                    </Typography>
                                    <Typography variant="h6" color="blue-gray">
                                        {asignacion.ruta.nombre}
                                    </Typography>
                                </div>

                                <div>
                                    <Typography variant="small" color="gray" className="font-normal">
                                        Zona
                                    </Typography>
                                    <Typography variant="h6" color="blue-gray">
                                        {asignacion.ruta.zona?.nombre || 'N/A'}
                                    </Typography>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Typography variant="small" color="gray" className="font-normal">
                                            Distancia
                                        </Typography>
                                        <Typography variant="h6" color="blue-gray">
                                            {asignacion.ruta.distancia} km
                                        </Typography>
                                    </div>
                                    <div>
                                        <Typography variant="small" color="gray" className="font-normal">
                                            Horario
                                        </Typography>
                                        <Typography variant="h6" color="blue-gray">
                                            {formatHora(asignacion.ruta.horario_inicio)} - {formatHora(asignacion.ruta.horario_fin)}
                                        </Typography>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Información de Camión */}
                    <Card className="p-6 lg:col-span-2">
                        <Typography variant="h6" color="blue-gray" className="mb-4">
                            Camión Asignado
                        </Typography>

                        {asignacion.camion ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <Typography variant="small" color="gray" className="font-normal">
                                            Placa
                                        </Typography>
                                        <Typography variant="h6" color="blue-gray">
                                            {asignacion.camion.placa}
                                        </Typography>
                                    </div>
                                    <div>
                                        <Typography variant="small" color="gray" className="font-normal">
                                            Capacidad
                                        </Typography>
                                        <Typography variant="h6" color="blue-gray">
                                            {asignacion.camion.capacidad} ton
                                        </Typography>
                                    </div>
                                    <div>
                                        <Typography variant="small" color="gray" className="font-normal">
                                            Estado del Camión
                                        </Typography>
                                        <Chip
                                            size="sm"
                                            value={asignacion.camion.estado}
                                            color={asignacion.camion.estado === 'operativo' ? 'green' : 'yellow'}
                                            className="w-fit mt-1"
                                        />
                                    </div>
                                </div>

                                {asignacion.camion.conductor && (
                                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                        <Typography variant="small" color="gray" className="font-normal">
                                            Conductor Asignado
                                        </Typography>
                                        <Typography variant="h6" color="blue-gray" className="mt-1">
                                            {asignacion.camion.conductor.nombre_completo}
                                        </Typography>
                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            <div>
                                                <Typography variant="small" color="gray">
                                                    Licencia
                                                </Typography>
                                                <Typography variant="small" color="blue-gray">
                                                    {asignacion.camion.conductor.licencia}
                                                </Typography>
                                            </div>
                                            <div>
                                                <Typography variant="small" color="gray">
                                                    Categoría
                                                </Typography>
                                                <Typography variant="small" color="blue-gray">
                                                    {asignacion.camion.conductor.categoria}
                                                </Typography>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Typography variant="paragraph" color="gray">
                                No hay camión asignado
                            </Typography>
                        )}
                    </Card>
                </div>
            </div>

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