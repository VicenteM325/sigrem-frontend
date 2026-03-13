// src/pages/dashboard/recolecciones/RecoleccionEnProgreso.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
    ArrowLeftIcon,
    MapPinIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ClockIcon,
    TruckIcon
} from '@heroicons/react/24/outline';
import {
    Card,
    Typography,
    Button,
    Progress,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input,
    Textarea,
    Chip
} from '@material-tailwind/react';
import { recoleccionService } from '@/services/recoleccionService';
import { puntoRecoleccionService } from '@/services/puntoRecoleccionService';

export function RecoleccionEnProgreso() {
    const { id } = useParams();
    const navigate = useNavigate();
    const mapContainer = useRef(null);
    const map = useRef(null);
    const markers = useRef([]);

    const [recoleccion, setRecoleccion] = useState(null);
    const [puntos, setPuntos] = useState([]);
    const [puntoActual, setPuntoActual] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showRegistroDialog, setShowRegistroDialog] = useState(false);
    const [showProblemaDialog, setShowProblemaDialog] = useState(false);
    const [basuraRegistrada, setBasuraRegistrada] = useState('');
    const [observaciones, setObservaciones] = useState('');
    const [registrando, setRegistrando] = useState(false);
    const [totalAcumulado, setTotalAcumulado] = useState(0);
    const [tiempoTranscurrido, setTiempoTranscurrido] = useState('00:00:00');

    useEffect(() => {
        cargarDatos();
        const interval = setInterval(actualizarTiempo, 1000);
        return () => clearInterval(interval);
    }, [id]);

    useEffect(() => {
        if (recoleccion?.hora_inicio) {
            actualizarTiempo();
        }
    }, [recoleccion]);

    // Inicializar mapa cuando tengamos los puntos
    useEffect(() => {
        if (puntos.length > 0 && !map.current) {
            inicializarMapa();
        }
        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, [puntos]);

    // Actualizar marcadores cuando cambian los puntos
    useEffect(() => {
        if (map.current && puntos.length > 0) {
            actualizarMarcadores();
        }
    }, [puntos, puntoActual]);

    const cargarDatos = async () => {
        try {
            setLoading(true);

            const recResponse = await recoleccionService.getById(id);
            setRecoleccion(recResponse.data.recoleccion);

            const puntosResponse = await puntoRecoleccionService.getByRecoleccion(id);
            const puntosData = puntosResponse.data.puntos || [];
            setPuntos(puntosData);

            const total = puntosData
                .filter(p => p.estado === 'recolectado')
                .reduce((sum, p) => sum + (p.volumen_real_kg || p.volumen_estimado || 0), 0);
            setTotalAcumulado(total);

            const siguiente = puntosData.find(p => p.estado === 'pendiente');
            setPuntoActual(siguiente);

        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const inicializarMapa = () => {
        if (!mapContainer.current) return;

        // Calcular centro del mapa (promedio de todos los puntos)
        const lats = puntos.map(p => p.latitud);
        const lngs = puntos.map(p => p.longitud);
        const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
        const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: {
                version: 8,
                sources: {
                    'osm': {
                        type: 'raster',
                        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                        tileSize: 256,
                        attribution: '© OpenStreetMap'
                    }
                },
                layers: [{
                    id: 'osm',
                    type: 'raster',
                    source: 'osm'
                }]
            },
            center: [centerLng, centerLat],
            zoom: 14
        });

        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

        map.current.on('load', () => {
            actualizarMarcadores();
        });
    };

    const actualizarMarcadores = () => {
        // Limpiar marcadores existentes
        markers.current.forEach(marker => marker.remove());
        markers.current = [];

        // Crear nuevo marcador para cada punto
        puntos.forEach((punto, index) => {
            // Determinar color según estado
            let color = '#9CA3AF'; // gris por defecto
            if (punto.estado === 'recolectado') color = '#10B981'; // verde
            if (punto.estado === 'problema') color = '#EF4444'; // rojo
            if (punto.id === puntoActual?.id) color = '#3B82F6'; // azul para actual

            // Crear elemento del marcador
            const el = document.createElement('div');
            el.className = 'marker';
            el.style.backgroundColor = color;
            el.style.width = '24px';
            el.style.height = '24px';
            el.style.borderRadius = '50%';
            el.style.border = '3px solid white';
            el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
            el.style.cursor = 'pointer';
            
            // Agregar número
            const numberEl = document.createElement('span');
            numberEl.textContent = index + 1;
            numberEl.style.color = 'white';
            numberEl.style.fontSize = '12px';
            numberEl.style.fontWeight = 'bold';
            numberEl.style.display = 'flex';
            numberEl.style.justifyContent = 'center';
            numberEl.style.alignItems = 'center';
            numberEl.style.height = '100%';
            el.appendChild(numberEl);

            // Popup con información
            const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
                <div style="padding: 8px;">
                    <strong>Punto #${index + 1}</strong><br/>
                    <span>Estado: ${punto.estado}</span><br/>
                    <span>Vol. Estimado: ${punto.volumen_estimado} kg</span>
                    ${punto.volumen_real_kg ? `<br/><span style="color: #10B981;">Real: ${punto.volumen_real_kg} kg</span>` : ''}
                    ${punto.observaciones ? `<br/><small>${punto.observaciones}</small>` : ''}
                </div>
            `);

            // Crear y guardar marcador
            const marker = new maplibregl.Marker({ element: el })
                .setLngLat([punto.longitud, punto.latitud])
                .setPopup(popup)
                .addTo(map.current);

            markers.current.push(marker);
        });

        // Si hay punto actual, centrar el mapa en él
        if (puntoActual) {
            map.current.flyTo({
                center: [puntoActual.longitud, puntoActual.latitud],
                zoom: 16,
                duration: 1000
            });
        }
    };

    const actualizarTiempo = () => {
        if (recoleccion?.hora_inicio) {
            const inicio = new Date(recoleccion.hora_inicio);
            const ahora = new Date();
            const diff = Math.floor((ahora - inicio) / 1000);

            const horas = Math.floor(diff / 3600);
            const minutos = Math.floor((diff % 3600) / 60);
            const segundos = diff % 60;

            setTiempoTranscurrido(
                `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`
            );
        }
    };

    const handleRegistrarBasura = async () => {
        if (!puntoActual || !basuraRegistrada) return;

        try {
            setRegistrando(true);

            await puntoRecoleccionService.registrarBasura(puntoActual.id, {
                volumen_real_kg: parseFloat(basuraRegistrada),
                observaciones
            });

            const puntosActualizados = puntos.map(p =>
                p.id === puntoActual.id
                    ? { 
                        ...p, 
                        estado: 'recolectado',
                        volumen_real_kg: parseFloat(basuraRegistrada)
                      }
                    : p
            );
            setPuntos(puntosActualizados);
            setTotalAcumulado(prev => prev + parseFloat(basuraRegistrada));

            const siguiente = puntosActualizados.find(p => p.estado === 'pendiente');
            setPuntoActual(siguiente);

            setShowRegistroDialog(false);
            setBasuraRegistrada('');
            setObservaciones('');

            if (!siguiente) {
                if (window.confirm('¡Has completado todos los puntos! ¿Deseas finalizar la recolección?')) {
                    finalizarRecoleccion();
                }
            }

        } catch (error) {
            console.error('Error registrando basura:', error);
            alert('Error al registrar la basura: ' + (error.response?.data?.message || error.message));
        } finally {
            setRegistrando(false);
        }
    };

    const handleReportarProblema = async () => {
        if (!puntoActual || !observaciones) return;

        try {
            await puntoRecoleccionService.reportarProblema(puntoActual.id, observaciones);

            const puntosActualizados = puntos.map(p =>
                p.id === puntoActual.id
                    ? { ...p, estado: 'problema', observaciones }
                    : p
            );
            setPuntos(puntosActualizados);

            const siguiente = puntosActualizados.find(p => p.estado === 'pendiente');
            setPuntoActual(siguiente);

            setShowProblemaDialog(false);
            setObservaciones('');

        } catch (error) {
            console.error('Error reportando problema:', error);
            alert('Error al reportar el problema');
        }
    };

    const finalizarRecoleccion = async () => {
        try {
            const capacidadCamion = recoleccion?.asignacion?.camion?.capacidad || 0;
            const capacidadEnKg = capacidadCamion * 1000;
            
            if (totalAcumulado > capacidadEnKg) {
                alert(`El total acumulado (${totalAcumulado} kg) excede la capacidad del camión (${capacidadCamion} toneladas = ${capacidadEnKg} kg)`);
                return;
            }

            await recoleccionService.finalizar(id, {
                basura_recolectada: totalAcumulado,
                observaciones: 'Recolección completada'
            });
            
            navigate('/dashboard/recolecciones/en-progreso');
        } catch (error) {
            console.error('Error finalizando recolección:', error);
            alert('Error al finalizar: ' + (error.response?.data?.message || error.message));
        }
    };

    const progreso = puntos.length > 0
        ? (puntos.filter(p => p.estado === 'recolectado' || p.estado === 'problema').length / puntos.length) * 100
        : 0;

    const puntosCompletados = puntos.filter(p => p.estado === 'recolectado').length;
    const puntosProblema = puntos.filter(p => p.estado === 'problema').length;

    if (loading) {
        return (
            <div className="p-6 text-center">
                <Typography>Cargando recolección...</Typography>
            </div>
        );
    }

    if (!recoleccion) {
        return (
            <div className="p-6 text-center">
                <Typography color="red">Recolección no encontrada</Typography>
                <Button
                    variant="text"
                    onClick={() => navigate('/dashboard/recolecciones/en-progreso')}
                    className="mt-4"
                >
                    Volver
                </Button>
            </div>
        );
    }

    return (
        <div className="p-6 h-screen flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="text"
                        size="sm"
                        onClick={() => navigate('/dashboard/recolecciones/en-progreso')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeftIcon className="h-4 w-4" /> Volver
                    </Button>
                    <Typography variant="h5" color="blue-gray">
                        Recolección en Progreso
                    </Typography>
                </div>
                <Button
                    color="green"
                    onClick={finalizarRecoleccion}
                    disabled={puntosCompletados === 0}
                >
                    Finalizar Recolección
                </Button>
            </div>

            {/* Grid principal: Mapa + Información */}
            <div className="flex-1 grid grid-cols-3 gap-6 min-h-0">
                {/* Panel izquierdo - Información y puntos */}
                <div className="col-span-1 overflow-y-auto pr-2 space-y-6">
                    {/* Progreso */}
                    <Card className="p-4">
                        <div className="flex justify-between items-center mb-4">
                            <Typography variant="h6">Progreso</Typography>
                            <Typography variant="small" color="blue">
                                {puntosCompletados + puntosProblema} de {puntos.length} puntos
                            </Typography>
                        </div>
                        <Progress value={progreso} color="green" />
                        
                        <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <Typography variant="small" color="gray">Total Acumulado</Typography>
                                <Typography variant="h6" color="green">{totalAcumulado.toFixed(2)} kg</Typography>
                            </div>
                            <div className="flex items-center justify-between">
                                <Typography variant="small" color="gray">Tiempo</Typography>
                                <div className="flex items-center gap-1">
                                    <ClockIcon className="h-4 w-4 text-blue-500" />
                                    <Typography variant="h6" color="blue">{tiempoTranscurrido}</Typography>
                                </div>
                            </div>
                        </div>

                        {/* Leyenda del mapa */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <Typography variant="small" color="gray" className="mb-2">Leyenda:</Typography>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow"></div>
                                    <Typography variant="small">Actual</Typography>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow"></div>
                                    <Typography variant="small">Completado</Typography>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow"></div>
                                    <Typography variant="small">Problema</Typography>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-gray-400 border-2 border-white shadow"></div>
                                    <Typography variant="small">Pendiente</Typography>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Punto actual */}
                    {puntoActual ? (
                        <Card className="p-4 border-2 border-blue-200 bg-blue-50">
                            <div className="flex items-center gap-2 mb-3">
                                <MapPinIcon className="h-5 w-5 text-blue-600" />
                                <Typography variant="h6" color="blue">Punto Actual</Typography>
                            </div>
                            
                            <div className="space-y-2">
                                <div>
                                    <Typography variant="small" color="gray">Ubicación</Typography>
                                    <Typography>
                                        {puntoActual.latitud.toFixed(6)}, {puntoActual.longitud.toFixed(6)}
                                    </Typography>
                                </div>
                                <div>
                                    <Typography variant="small" color="gray">Volumen Estimado</Typography>
                                    <Typography variant="h6">{puntoActual.volumen_estimado} kg</Typography>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                                <Button
                                    size="sm"
                                    color="green"
                                    onClick={() => setShowRegistroDialog(true)}
                                    className="flex-1"
                                >
                                    Registrar
                                </Button>
                                <Button
                                    size="sm"
                                    color="red"
                                    variant="outlined"
                                    onClick={() => setShowProblemaDialog(true)}
                                    className="flex-1"
                                >
                                    Problema
                                </Button>
                            </div>
                        </Card>
                    ) : (
                        <Card className="p-4 bg-green-50">
                            <Typography variant="h6" color="green" className="text-center">
                                ¡Todos los puntos completados!
                            </Typography>
                        </Card>
                    )}

                    {/* Lista de puntos */}
                    <Card className="p-4">
                        <Typography variant="h6" className="mb-3">Puntos</Typography>
                        
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {puntos.map((punto, index) => (
                                <div
                                    key={punto.id}
                                    className={`flex items-center justify-between p-2 rounded-lg border ${
                                        punto.estado === 'recolectado' ? 'bg-green-50 border-green-200' :
                                        punto.estado === 'problema' ? 'bg-red-50 border-red-200' :
                                        punto.id === puntoActual?.id ? 'bg-blue-50 border-blue-200' :
                                        'bg-gray-50 border-gray-200'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${
                                            punto.estado === 'recolectado' ? 'bg-green-500' :
                                            punto.estado === 'problema' ? 'bg-red-500' :
                                            punto.id === puntoActual?.id ? 'bg-blue-500' :
                                            'bg-gray-400'
                                        }`} />
                                        <Typography variant="small">
                                            #{index + 1}: {punto.volumen_estimado}kg
                                        </Typography>
                                    </div>
                                    {punto.volumen_real_kg && (
                                        <Typography variant="small" color="green">
                                            {punto.volumen_real_kg}kg
                                        </Typography>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Información del camión */}
                    <Card className="p-4">
                        <Typography variant="h6" className="mb-2">Vehículo</Typography>
                        <div className="space-y-1">
                            <Typography><span className="font-bold">Camión:</span> {recoleccion?.asignacion?.camion?.placa}</Typography>
                            <Typography><span className="font-bold">Conductor:</span> {recoleccion?.asignacion?.camion?.conductor?.nombre_completo}</Typography>
                            <Typography><span className="font-bold">Capacidad:</span> {recoleccion?.asignacion?.camion?.capacidad} t</Typography>
                        </div>
                    </Card>
                </div>

                {/* Panel derecho - Mapa */}
                <div className="col-span-2 relative bg-gray-200 rounded-lg overflow-hidden shadow-lg">
                    <div ref={mapContainer} className="absolute inset-0" />
                    
                    {/* Overlay con información del punto actual */}
                    {puntoActual && (
                        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-blue-200">
                            <div className="flex items-center gap-2">
                                <MapPinIcon className="h-5 w-5 text-blue-600 animate-pulse" />
                                <Typography variant="h6" color="blue">Punto Actual</Typography>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Diálogos */}
            <Dialog open={showRegistroDialog} handler={setShowRegistroDialog}>
                <DialogHeader>Registrar Basura</DialogHeader>
                <DialogBody>
                    <div className="space-y-4">
                        <Input
                            type="number"
                            step="0.1"
                            label="Cantidad recolectada (kg)"
                            value={basuraRegistrada}
                            onChange={(e) => setBasuraRegistrada(e.target.value)}
                            autoFocus
                        />
                        <Textarea
                            label="Observaciones"
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            rows={3}
                        />
                    </div>
                </DialogBody>
                <DialogFooter>
                    <Button variant="text" color="red" onClick={() => setShowRegistroDialog(false)} className="mr-1">
                        Cancelar
                    </Button>
                    <Button color="green" onClick={handleRegistrarBasura} disabled={!basuraRegistrada}>
                        Registrar
                    </Button>
                </DialogFooter>
            </Dialog>

            <Dialog open={showProblemaDialog} handler={setShowProblemaDialog}>
                <DialogHeader>Reportar Problema</DialogHeader>
                <DialogBody>
                    <Textarea
                        label="Describa el problema"
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                        rows={4}
                        autoFocus
                    />
                </DialogBody>
                <DialogFooter>
                    <Button variant="text" color="gray" onClick={() => setShowProblemaDialog(false)} className="mr-1">
                        Cancelar
                    </Button>
                    <Button color="red" onClick={handleReportarProblema} disabled={!observaciones}>
                        Reportar
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
}