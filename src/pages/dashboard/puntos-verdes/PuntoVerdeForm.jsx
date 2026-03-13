import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, MapPinIcon } from '@heroicons/react/24/outline';
import {
  Card,
  Typography,
  Button,
  Input,
  Alert
} from '@material-tailwind/react';
import { puntoVerdeService } from '@/services/puntoVerdeService';
import { zonaService } from '@/services/zonaService';
import { rutaService } from '@/services/rutaService';
import { RutasSelectMap } from '@/components/maps/RutasSelectMap';

export function PuntoVerdeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [zonas, setZonas] = useState([]);
  const [encargados, setEncargados] = useState([]);
  const [rutas, setRutas] = useState([]);
  const [cargandoRutas, setCargandoRutas] = useState(false);

  const [formData, setFormData] = useState({
    id_zona: '',
    nombre: '',
    direccion: '',
    latitud: 14.8361,
    longitud: -91.5186,
    capacidad_total_m3: '',
    horario_atencion: '',
    id_encargado: ''
  });

  // Cargar zonas y encargados
  useEffect(() => {
    loadZonas();
    loadEncargadosDisponibles();
    if (isEditing) {
      loadPuntoVerde();
    }
  }, [id]);

  const loadZonas = async () => {
    try {
      const response = await zonaService.getForSelect();
      setZonas(response.data.zonas || []);
    } catch (error) {
      console.error('Error cargando zonas:', error);
    }
  };

  const loadEncargadosDisponibles = async () => {
    try {
      const response = await puntoVerdeService.getEncargadosDisponibles();
      setEncargados(response.data.encargados || []);
    } catch (error) {
      console.error('Error cargando encargados:', error);
    }
  };

  const loadPuntoVerde = async () => {
    try {
      setLoading(true);
      const response = await puntoVerdeService.getById(id);
      const punto = response.data.punto_verde;

      setFormData({
        id_zona: punto.zona?.id ? String(punto.zona.id) : '',
        nombre: punto.nombre || '',
        direccion: punto.direccion || '',
        latitud: punto.ubicacion?.lat || 14.8361,
        longitud: punto.ubicacion?.lng || -91.5186,
        capacidad_total_m3: punto.capacidad || '',
        horario_atencion: punto.horario || '',
        id_encargado: punto.encargado?.id ? String(punto.encargado.id) : ''
      });

      // Si tiene zona, cargar sus rutas
      if (punto.zona?.id) {
        await cargarRutasDeZona(punto.zona.id);
      }
      
    } catch (error) {
      console.error('Error cargando punto verde:', error);
      setError('Error al cargar los datos del punto verde');
    } finally {
      setLoading(false);
    }
  };

  const cargarRutasDeZona = async (zonaId) => {
    if (!zonaId) {
      setRutas([]);
      return;
    }

    try {
      setCargandoRutas(true);
      
      // Obtener lista básica de rutas
      const response = await rutaService.getByZona(zonaId);
      const rutasBasicas = response.data.rutas || [];
      
      if (rutasBasicas.length === 0) {
        setRutas([]);
        return;
      }

      // Cargar detalles en paralelo con Promise.allSettled para manejar errores individuales
      const resultados = await Promise.allSettled(
        rutasBasicas.map(async (ruta) => {
          const detalle = await rutaService.getById(ruta.id);
          const rutaCompleta = detalle.data.ruta;
          
          // Validar que tenga las coordenadas necesarias
          if (!rutaCompleta?.coordenadas?.inicio || !rutaCompleta?.coordenadas?.fin) {
            throw new Error(`Ruta ${ruta.id} sin coordenadas completas`);
          }

          return {
            id: rutaCompleta.id,
            nombre: rutaCompleta.nombre,
            coordenadas: {
              inicio: {
                lat: rutaCompleta.coordenadas.inicio.lat,
                lng: rutaCompleta.coordenadas.inicio.lng
              },
              fin: {
                lat: rutaCompleta.coordenadas.fin.lat,
                lng: rutaCompleta.coordenadas.fin.lng
              }
            },
            puntos_intermedios: (rutaCompleta.puntos_intermedios || []).map(p => ({
              lat: p.lat,
              lng: p.lng
            }))
          };
        })
      );

      // Procesar resultados exitosos
      const rutasValidas = resultados
        .filter(r => r.status === 'fulfilled' && r.value !== null)
        .map(r => r.value);

      // Registrar errores si los hay
      const errores = resultados.filter(r => r.status === 'rejected');
      if (errores.length > 0) {
        console.warn(`${errores.length} ruta(s) no pudieron cargarse completamente`);
      }

      console.log(`${rutasValidas.length} ruta(s) cargadas correctamente`);
      setRutas(rutasValidas);
      
    } catch (error) {
      console.error('Error cargando rutas:', error);
    } finally {
      setCargandoRutas(false);
    }
  };

  const handleZonaChange = async (e) => {
    const zonaId = e.target.value;
    setFormData(prev => ({ ...prev, id_zona: zonaId }));
    await cargarRutasDeZona(zonaId);
  };

  const handleMapClick = (latLng) => {
    setFormData(prev => ({
      ...prev,
      latitud: latLng.lat,
      longitud: latLng.lng
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.nombre.trim()) {
      alert('El nombre es obligatorio');
      return;
    }
    if (!formData.id_zona) {
      alert('Debes seleccionar una zona');
      return;
    }
    if (!formData.direccion.trim()) {
      alert('La dirección es obligatoria');
      return;
    }
    if (!formData.capacidad_total_m3 || parseFloat(formData.capacidad_total_m3) <= 0) {
      alert('La capacidad debe ser mayor a 0');
      return;
    }
    if (!formData.horario_atencion.trim()) {
      alert('El horario de atención es obligatorio');
      return;
    }
    if (!formData.id_encargado) {
      alert('Debes seleccionar un encargado');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const dataToSend = {
        id_zona: parseInt(formData.id_zona),
        nombre: formData.nombre.trim(),
        direccion: formData.direccion.trim(),
        latitud: parseFloat(formData.latitud),
        longitud: parseFloat(formData.longitud),
        capacidad_total_m3: parseFloat(formData.capacidad_total_m3),
        horario_atencion: formData.horario_atencion.trim(),
        id_encargado: parseInt(formData.id_encargado)
      };

      if (isEditing) {
        await puntoVerdeService.update(id, dataToSend);
      } else {
        await puntoVerdeService.create(dataToSend);
      }

      navigate('/dashboard/puntos-verdes');
    } catch (error) {
      console.error('Error guardando punto verde:', error);
      if (error.response?.data?.errors) {
        const messages = Object.values(error.response.data.errors).flat();
        setError(messages.join(', '));
      } else {
        setError(error.response?.data?.message || 'Error al guardar el punto verde');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/dashboard/puntos-verdes')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
        </button>
        <Typography variant="h5" color="blue-gray">
          {isEditing ? 'Editar Punto Verde' : 'Nuevo Punto Verde'}
        </Typography>
      </div>

      {error && (
        <Alert color="red" className="mb-6">
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Zona */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zona <span className="text-red-500">*</span>
              </label>
              <select
                name="id_zona"
                value={formData.id_zona}
                onChange={handleZonaChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                required
              >
                <option value="">Seleccionar zona</option>
                {zonas.map(zona => (
                  <option key={zona.value} value={zona.value}>
                    {zona.label}
                  </option>
                ))}
              </select>
              
              {/* Indicador de rutas */}
              {cargandoRutas && (
                <Typography variant="small" color="blue" className="mt-1">
                  Cargando rutas de la zona...
                </Typography>
              )}
              {rutas.length > 0 && !cargandoRutas && (
                <Typography variant="small" color="green" className="mt-1">
                  {rutas.length} ruta(s) disponible(s) en esta zona
                </Typography>
              )}
            </div>

            {/* Nombre */}
            <div>
              <Input
                label="Nombre del punto *"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>

            {/* Dirección */}
            <div>
              <Input
                label="Dirección *"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                required
              />
            </div>

            {/* Capacidad */}
            <div>
              <Input
                type="number"
                step="0.01"
                min="0"
                label="Capacidad total (m³) *"
                name="capacidad_total_m3"
                value={formData.capacidad_total_m3}
                onChange={handleChange}
                required
              />
            </div>

            {/* Horario */}
            <div>
              <Input
                label="Horario de atención *"
                name="horario_atencion"
                value={formData.horario_atencion}
                onChange={handleChange}
                placeholder="Ej: Lunes a Viernes 8:00-17:00"
                required
              />
            </div>

            {/* Encargado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Encargado <span className="text-red-500">*</span>
              </label>
              <select
                name="id_encargado"
                value={formData.id_encargado}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                required
              >
                <option value="">Seleccionar encargado</option>
                {encargados.map(enc => (
                  <option key={enc.value} value={enc.value}>
                    {enc.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Coordenadas */}
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Latitud"
                value={formData.latitud.toFixed(6)}
                readOnly
              />
              <Input
                label="Longitud"
                value={formData.longitud.toFixed(6)}
                readOnly
              />
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outlined"
                onClick={() => navigate('/dashboard/puntos-verdes')}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                color="blue"
                className="flex-1"
                disabled={saving}
              >
                {saving ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
              </Button>
            </div>
          </form>
        </Card>

        {/* Mapa con todas las rutas de la zona */}
        <Card className="p-6">
          <Typography variant="h6" className="mb-4 flex items-center gap-2">
            <MapPinIcon className="h-5 w-5 text-green-600" />
            {rutas.length > 0 
              ? `Rutas en la zona seleccionada (${rutas.length})`
              : 'Selecciona una zona para ver las rutas disponibles'
            }
          </Typography>

          <RutasSelectMap
            rutas={rutas}
            ubicacion={{
              lat: formData.latitud,
              lng: formData.longitud
            }}
            onMapClick={handleMapClick}
            altura="500px"
          />

          <div className="mt-4 space-y-2">
            <Typography variant="small" color="gray" className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span>Haz clic en el mapa o arrastra el marcador verde para ubicar el punto verde</span>
            </Typography>
            {rutas.map((ruta, index) => {
              const colores = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
              const color = colores[index % colores.length];
              return (
                <Typography key={ruta.id} variant="small" color="gray" className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></span>
                  <span>{ruta.nombre}</span>
                </Typography>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}