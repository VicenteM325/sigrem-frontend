import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Card, Typography, Button, Input, Select, Option, Alert } from '@material-tailwind/react';
import { asignacionService } from '@/services/asignacionService';
import { rutaService } from '@/services/rutaService';
import { camionService } from '@/services/camionService';

export function AsignacionForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [formData, setFormData] = useState({
        id_ruta: '',
        id_camion: '',
        fecha_programada: '',
        total_estimado_kg: ''
    });

    const [rutas, setRutas] = useState([]);
    const [camiones, setCamiones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [verificando, setVerificando] = useState(false);

    // Estado para forzar re-render de los selects
    const [selectKey, setSelectKey] = useState({
        ruta: Date.now(),
        camion: Date.now()
    });

    useEffect(() => {
        console.log('Rutas cargadas:', rutas);
        console.log('Form data id_ruta:', formData.id_ruta, 'tipo:', typeof formData.id_ruta);
    }, [rutas, formData.id_ruta]);

    useEffect(() => {
        console.log('Camiones cargados:', camiones);
        console.log('Form data id_camion:', formData.id_camion, 'tipo:', typeof formData.id_camion);
    }, [camiones, formData.id_camion]);

    useEffect(() => {
        loadRutas();
        if (isEditing) {
            loadAsignacion();
        }
    }, [id]);

    useEffect(() => {
        if (formData.fecha_programada) {
            loadCamiones(formData.fecha_programada);
        } else {
            setCamiones([]);
        }
    }, [formData.fecha_programada]);

    useEffect(() => {
        if (formData.id_ruta && formData.fecha_programada) {
            verificarDisponibilidadRuta();
        }
    }, [formData.id_ruta, formData.fecha_programada]);

    const loadRutas = async () => {
        try {
            const response = await rutaService.getAll();
            setRutas(response.data.rutas || []);
        } catch (error) {
            console.error('Error cargando rutas:', error);
        }
    };

    const loadCamiones = async (fecha) => {
        try {
            setLoading(true);
            console.log('Cargando camiones para fecha:', fecha);

            let response;
            if (fecha) {
                response = await camionService.getDisponiblesParaFecha(fecha);
            } else {
                response = await camionService.getDisponibles();
            }

            console.log('Camiones recibidos:', response.data.camiones);
            setCamiones(response.data.camiones || []);
        } catch (error) {
            console.error('Error cargando camiones:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadAsignacion = async () => {
        try {
            setLoading(true);
            const response = await asignacionService.getById(id);
            const asignacion = response.data.asignacion;

            setFormData({
                id_ruta: asignacion.ruta?.id || '',
                id_camion: asignacion.camion?.id || '',
                fecha_programada: asignacion.fecha || '',
                total_estimado_kg: asignacion.total_estimado || ''
            });

            setSelectKey({
                ruta: Date.now(),
                camion: Date.now()
            });
        } catch (error) {
            console.error('Error cargando asignación:', error);
        } finally {
            setLoading(false);
        }
    };

    const verificarDisponibilidadRuta = async () => {
        if (!formData.id_ruta || !formData.fecha_programada) return;

        try {
            const response = await asignacionService.getByFecha(formData.fecha_programada);
            const asignacionesDelDia = response.data.asignaciones || [];

            const rutaOcupada = asignacionesDelDia.find(
                a => a.ruta?.id === parseInt(formData.id_ruta) &&
                    (isEditing ? a.id !== parseInt(id) : true)
            );

            if (rutaOcupada) {
                setErrors(prev => ({
                    ...prev,
                    ruta_ocupada: `La ruta ya tiene una asignación para esta fecha`
                }));
            } else {
                setErrors(prev => ({ ...prev, ruta_ocupada: null }));
            }
        } catch (error) {
            console.error('Error verificando disponibilidad de ruta:', error);
        }
    };

    const verificarDisponibilidadCamion = async () => {
        if (!formData.id_camion || !formData.fecha_programada) {
            alert('Selecciona un camión y una fecha');
            return;
        }

        try {
            setVerificando(true);
            const response = await asignacionService.verificarDisponibilidad(
                parseInt(formData.id_camion),
                formData.fecha_programada
            );

            if (!response.data.disponible) {
                setErrors(prev => ({
                    ...prev,
                    disponibilidad: response.data.asignacion_activa ?
                        `El camión ya tiene una asignación para el ${response.data.asignacion_activa.fecha}` :
                        'El camión no está disponible para esta fecha'
                }));
            } else {
                setErrors(prev => ({ ...prev, disponibilidad: null }));
            }
        } catch (error) {
            console.error('Error verificando disponibilidad:', error);
        } finally {
            setVerificando(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSelectChange = (value, name) => {
        console.log(`handleSelectChange - ${name}:`, value);

        if (value === '' || value === null || value === undefined) {
            setFormData(prev => ({
                ...prev,
                [name]: ''
            }));
            return;
        }

        // Convertir a número
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue)) {
            setFormData(prev => ({
                ...prev,
                [name]: numValue
            }));

            // Forzar re-render del select específico
            setSelectKey(prev => ({
                ...prev,
                [name === 'id_ruta' ? 'ruta' : 'camion']: Date.now()
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.id_ruta) {
            newErrors.id_ruta = 'La ruta es requerida';
        }

        if (!formData.id_camion) {
            newErrors.id_camion = 'El camión es requerido';
        }

        if (!formData.fecha_programada) {
            newErrors.fecha_programada = 'La fecha es requerida';
        } else {
            const fecha = new Date(formData.fecha_programada);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            if (fecha < hoy) {
                newErrors.fecha_programada = 'La fecha no puede ser anterior a hoy';
            }
        }

        if (formData.total_estimado_kg && formData.total_estimado_kg <= 0) {
            newErrors.total_estimado_kg = 'El total estimado debe ser mayor a 0';
        }

        if (errors.disponibilidad) {
            newErrors.disponibilidad = errors.disponibilidad;
        }

        if (errors.ruta_ocupada) {
            newErrors.ruta_ocupada = errors.ruta_ocupada;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        await verificarDisponibilidadCamion();

        if (!validateForm()) return;

        try {
            setLoading(true);

            const dataToSend = {
                id_ruta: parseInt(formData.id_ruta),
                id_camion: parseInt(formData.id_camion),
                fecha_programada: formData.fecha_programada.split('T')[0],
                total_estimado_kg: formData.total_estimado_kg ? parseFloat(formData.total_estimado_kg) : null
            };

            console.log('Enviando datos:', dataToSend);

            if (isEditing) {
                await asignacionService.update(id, dataToSend);
            } else {
                await asignacionService.create(dataToSend);
            }

            navigate('/dashboard/asignaciones');
        } catch (error) {
            console.error('Error completo:', error);

            if (error.response?.data?.message?.includes('unique') ||
                error.response?.data?.message?.includes('duplicada')) {
                setErrors(prev => ({
                    ...prev,
                    ruta_ocupada: 'Ya existe una asignación para esta ruta en la fecha seleccionada'
                }));
            } else if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else if (error.response?.data?.message) {
                alert(`Error: ${error.response.data.message}`);
            } else {
                alert('Error al guardar la asignación');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditing) {
        return (
            <div className="p-6 text-center">
                <Typography variant="h6">Cargando datos de la asignación...</Typography>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
                <Button
                    variant="text"
                    size="sm"
                    onClick={() => navigate('/dashboard/asignaciones')}
                    className="flex items-center gap-2"
                >
                    <ArrowLeftIcon className="h-4 w-4" /> Volver
                </Button>
                <Typography variant="h5" color="blue-gray">
                    {isEditing ? 'Editar Asignación' : 'Nueva Asignación'}
                </Typography>
            </div>

            <Card className="p-6 max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Ruta */}
                    <div>
                        <Select
                            key={selectKey.ruta}
                            label="Ruta"
                            value={formData.id_ruta ? String(formData.id_ruta) : ''}
                            onChange={(val) => handleSelectChange(val, 'id_ruta')}
                            error={!!errors.id_ruta}
                        >
                            {rutas.map((ruta) => (
                                <Option key={ruta.id} value={String(ruta.id)}>
                                    {ruta.nombre} - {ruta.zona?.nombre || ''}
                                </Option>
                            ))}
                        </Select>
                        {errors.id_ruta && (
                            <Typography variant="small" color="red" className="mt-1">
                                {errors.id_ruta}
                            </Typography>
                        )}
                    </div>

                    {/* Fecha */}
                    <div>
                        <Input
                            type="date"
                            label="Fecha Programada"
                            name="fecha_programada"
                            value={formData.fecha_programada}
                            onChange={handleChange}
                            error={!!errors.fecha_programada}
                            required
                        />
                        {errors.fecha_programada && (
                            <Typography variant="small" color="red" className="mt-1">
                                {errors.fecha_programada}
                            </Typography>
                        )}
                    </div>

                    {/* Alerta de ruta ocupada */}
                    {errors.ruta_ocupada && (
                        <Alert color="red" className="mt-2">
                            {errors.ruta_ocupada}
                        </Alert>
                    )}

                    {/* Camión y Verificación */}
                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Select
                                    key={selectKey.camion}
                                    label="Camión"
                                    value={formData.id_camion ? String(formData.id_camion) : ''}
                                    onChange={(val) => handleSelectChange(val, 'id_camion')}
                                    error={!!errors.id_camion}
                                >
                                    {camiones.map((camion) => (
                                        <Option key={camion.value} value={String(camion.value)}>
                                            {camion.label}
                                        </Option>
                                    ))}
                                </Select>
                            </div>
                            <Button
                                size="sm"
                                variant="outlined"
                                onClick={verificarDisponibilidadCamion}
                                disabled={!formData.id_camion || !formData.fecha_programada || verificando}
                                className="whitespace-nowrap"
                            >
                                {verificando ? 'Verificando...' : 'Verificar'}
                            </Button>
                        </div>
                        {errors.id_camion && (
                            <Typography variant="small" color="red" className="mt-1">
                                {errors.id_camion}
                            </Typography>
                        )}
                    </div>

                    {/* Resultado de verificación */}
                    {errors.disponibilidad && (
                        <Alert color="red" className="mt-2">
                            {errors.disponibilidad}
                        </Alert>
                    )}

                    {/* Total Estimado */}
                    <div>
                        <Input
                            type="number"
                            step="0.01"
                            label="Total Estimado (kg) - Opcional"
                            name="total_estimado_kg"
                            value={formData.total_estimado_kg}
                            onChange={handleChange}
                            error={!!errors.total_estimado_kg}
                        />
                        {errors.total_estimado_kg && (
                            <Typography variant="small" color="red" className="mt-1">
                                {errors.total_estimado_kg}
                            </Typography>
                        )}
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end gap-4 pt-4">
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/dashboard/asignaciones')}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            color="blue"
                            disabled={loading || !!errors.disponibilidad || !!errors.ruta_ocupada}
                        >
                            {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}