// src/pages/dashboard/users/UserForm.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Button,
  Input,
  Switch,
  Spinner,
  Alert,
} from "@material-tailwind/react";
import { userService } from "@/services/userService";
import { roleService } from "@/services/roleService";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";

export function UserForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [roles, setRoles] = useState([]);

  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    telefono: "", // Ahora en user
    direccion: "", // Ahora en user
    password: "",
    password_confirmation: "",
    estado: true,
    roles: [],
    // Datos específicos según rol
    licencia: "", // Para conductores
    fecha_vencimiento_licencia: "", // Para conductores
    categoria_licencia: "", // Para conductores
    disponible: true, // Para conductores
    puntos_acumulados: 0, // Para ciudadanos
    preferencias: null, // Para ciudadanos
  });

  useEffect(() => {
    loadRoles();
    if (isEditing) {
      loadUser();
    }
  }, [id]);

  const loadRoles = async () => {
    try {
      const data = await roleService.getRoles();
      setRoles(data.roles || []);
    } catch (err) {
      console.error("Error al cargar roles:", err);
    }
  };

  const loadUser = async () => {
    try {
      setLoading(true);
      const data = await userService.getUser(id);
      const user = data.user || data;

      setFormData({
        nombres: user.nombres || "",
        apellidos: user.apellidos || "",
        email: user.email || "",
        telefono: user.telefono || "",
        direccion: user.direccion || "",
        password: "",
        password_confirmation: "",
        estado: user.estado || false,
        roles: user.roles?.map(r => typeof r === 'string' ? r : r) || [],
        // Datos específicos según perfil
        licencia: user.perfil?.licencia || "",
        fecha_vencimiento_licencia: user.perfil?.fecha_vencimiento_licencia || "",
        categoria_licencia: user.perfil?.categoria_licencia || "",
        disponible: user.perfil?.disponible ?? true,
        puntos_acumulados: user.perfil?.puntos_acumulados || 0,
        preferencias: user.perfil?.preferencias || null,
      });
    } catch (err) {
      setError("Error al cargar el usuario");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRoleChange = (selectedRoles) => {
    setFormData(prev => ({
      ...prev,
      roles: selectedRoles,
      // Resetear campos específicos cuando cambian los roles
      licencia: "",
      fecha_vencimiento_licencia: "",
      categoria_licencia: "",
      disponible: true,
      puntos_acumulados: 0,
      preferencias: null,
    }));
  };

  // Función para determinar qué campos extra mostrar según el rol seleccionado
  const getRoleSpecificFields = () => {
    const selectedRoles = formData.roles;

    // Si tiene rol de conductor
    if (selectedRoles.includes('conductor')) {
      return (
        <div className="space-y-4 mt-6 p-4 bg-blue-50 rounded-lg">
          <Typography variant="h6" color="blue" className="mb-4">
            Datos del Conductor
          </Typography>

          <Input
            label="Licencia *"
            name="licencia"
            value={formData.licencia}
            onChange={handleChange}
            required
          />

          <Input
            label="Fecha Vencimiento Licencia *"
            name="fecha_vencimiento_licencia"
            type="date"
            value={formData.fecha_vencimiento_licencia}
            onChange={handleChange}
            required
          />

          <div>
            <Typography variant="small" color="blue-gray" className="mb-2">
              Categoría Licencia *
            </Typography>
            <select
              name="categoria_licencia"
              value={formData.categoria_licencia}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              required
            >
              <option value="">Seleccionar categoría</option>
              <option value="A">A - Motos</option>
              <option value="B">B - Automóviles</option>
              <option value="C">C - Camiones</option>
              <option value="D">D - Autobuses</option>
              <option value="E">E - Remolques</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="disponible"
              checked={formData.disponible}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <Typography variant="small" color="blue-gray">
              Disponible para asignar rutas
            </Typography>
          </div>
        </div>
      );
    }

    // Si tiene rol de ciudadano
    if (selectedRoles.includes('ciudadano')) {
      return (
        <div className="space-y-4 mt-6 p-4 bg-green-50 rounded-lg">
          <Typography variant="h6" color="green" className="mb-4">
            Datos del Ciudadano (Sistema de Puntos)
          </Typography>

          {isEditing && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Typography variant="small" color="blue-gray" className="font-bold">
                    Puntos Acumulados
                  </Typography>
                  <Typography variant="h5" color="green">
                    {formData.puntos_acumulados}
                  </Typography>
                </div>
                <div>
                  <Typography variant="small" color="blue-gray" className="font-bold">
                    Nivel
                  </Typography>
                  <Typography variant="h5" color="amber">
                    {Math.floor(formData.puntos_acumulados / 100) + 1}
                  </Typography>
                </div>
              </div>

              <Input
                label="Puntos a agregar (opcional)"
                name="puntos_extra"
                type="number"
                onChange={(e) => {
                  // Esto se manejaría en el backend
                }}
              />
            </>
          )}
        </div>
      );
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.nombres || !formData.apellidos || !formData.email || !formData.telefono || !formData.direccion) {
      setError("Por favor completa todos los campos obligatorios");
      return;
    }

    if (formData.roles.length === 0) {
      setError("Debes seleccionar al menos un rol");
      return;
    }

    if (!isEditing && formData.password !== formData.password_confirmation) {
      setError("Las contraseñas no coinciden");
      return;
    }

    // Validar campos específicos según rol
    if (formData.roles.includes('conductor')) {
      if (!formData.licencia || !formData.fecha_vencimiento_licencia || !formData.categoria_licencia) {
        setError("Completa todos los datos del conductor: licencia, fecha de vencimiento y categoría");
        return;
      }
    }

    try {
      setSaving(true);
      setError(null);

      // Preparar datos para enviar
      const userData = {
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        email: formData.email,
        telefono: formData.telefono,
        direccion: formData.direccion,
        estado: formData.estado,
        roles: formData.roles,
      };

      // SIEMPRE incluir password y password_confirmation si hay contraseña
      if (formData.password) {
        userData.password = formData.password;
        userData.password_confirmation = formData.password_confirmation; 
      }

      // Agregar campos específicos según rol
      if (formData.roles.includes('conductor')) {
        userData.licencia = formData.licencia;
        userData.fecha_vencimiento_licencia = formData.fecha_vencimiento_licencia;
        userData.categoria_licencia = formData.categoria_licencia;
        userData.disponible = formData.disponible;
      }

      if (!isEditing) {
        userData.password = formData.password;
        await userService.createUser(userData);
        setSuccess("Usuario creado exitosamente");
      } else {
        if (formData.password) {
          userData.password = formData.password;
        }
        await userService.updateUser(id, userData);
        setSuccess("Usuario actualizado exitosamente");
      }

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate("/dashboard/tables");
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || "Error al guardar el usuario");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
          <div className="flex items-center gap-4">
            <Button
              variant="text"
              color="white"
              size="sm"
              className="p-2"
              onClick={() => navigate("/dashboard/tables")}
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
            <Typography variant="h6" color="white">
              {isEditing ? "Editar Usuario" : "Nuevo Usuario"}
            </Typography>
          </div>
        </CardHeader>

        <CardBody>
          {error && (
            <Alert color="red" className="mb-6">
              {error}
            </Alert>
          )}

          {success && (
            <Alert color="green" className="mb-6">
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Columna 1: Información Personal */}
              <div className="space-y-4">
                <Typography variant="h6" color="blue-gray" className="mb-4">
                  Información Personal
                </Typography>

                <Input
                  label="Nombres *"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Apellidos *"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Email *"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Columna 2: Información de Contacto */}
              <div className="space-y-4">
                <Typography variant="h6" color="blue-gray" className="mb-4">
                  Información de Contacto
                </Typography>

                <Input
                  label="Teléfono *"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Dirección *"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Segunda fila: Información de Cuenta y Roles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {/* Columna 1: Contraseñas */}
              <div className="space-y-4">
                <Typography variant="h6" color="blue-gray" className="mb-4">
                  Información de Cuenta
                </Typography>

                {!isEditing && (
                  <>
                    <Input
                      label="Contraseña *"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      required={!isEditing}
                    />

                    <Input
                      label="Confirmar Contraseña *"
                      name="password_confirmation"
                      type="password"
                      value={formData.password_confirmation}
                      onChange={handleChange}
                      required={!isEditing}
                    />
                  </>
                )}

                {isEditing && (
                  <>
                    <Input
                      label="Nueva Contraseña (dejar vacío para no cambiar)"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                    />

                    <Input
                      label="Confirmar Nueva Contraseña"
                      name="password_confirmation"
                      type="password"
                      value={formData.password_confirmation}
                      onChange={handleChange}
                    />
                  </>
                )}

                <div className="flex items-center gap-2 pt-4">
                  <Switch
                    checked={formData.estado}
                    onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.checked }))}
                    label="Usuario Activo"
                    ripple={false}
                  />
                </div>
              </div>

              {/* Columna 2: Roles */}
              <div className="space-y-4">
                <Typography variant="h6" color="blue-gray" className="mb-4">
                  Roles *
                </Typography>

                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto p-2 border rounded-lg">
                  {roles.map((role) => {
                    const isSelected = formData.roles.includes(role.name);
                    return (
                      <div
                        key={role.id}
                        onClick={() => {
                          const newRoles = isSelected
                            ? formData.roles.filter(r => r !== role.name)
                            : [...formData.roles, role.name];
                          handleRoleChange(newRoles);
                        }}
                        className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                          }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {role.name.replace('-', ' ')}
                          </span>
                          {isSelected && (
                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {formData.roles.length === 0 && (
                  <Typography variant="small" color="red" className="mt-1">
                    Debes seleccionar al menos un rol
                  </Typography>
                )}
              </div>
            </div>

            {/* Campos específicos según el rol */}
            {getRoleSpecificFields()}

            <CardFooter className="flex justify-end gap-4 px-0 pt-6">
              <Button
                variant="outlined"
                onClick={() => navigate("/dashboard/tables")}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                color="blue"
                disabled={saving}
              >
                {saving ? <Spinner className="h-4 w-4" /> : (isEditing ? "Actualizar" : "Crear")}
              </Button>
            </CardFooter>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

export default UserForm;