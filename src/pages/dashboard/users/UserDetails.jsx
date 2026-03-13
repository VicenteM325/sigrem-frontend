// src/pages/dashboard/users/UserDetails.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Button,
  Avatar,
  Spinner,
  Alert,
  Chip,
} from "@material-tailwind/react";
import { ArrowLeftIcon, PencilIcon } from "@heroicons/react/24/solid";
import { userService } from "@/services/userService";

export function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const data = await userService.getUser(id);
      setUser(data.user || data);
    } catch (err) {
      setError("Error al cargar los detalles del usuario");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Función para mostrar información específica según el rol
  const renderProfileInfo = () => {
    if (!user?.perfil) return null;
    
    if (user.perfil.tipo === 'conductor') {
      return (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <Typography variant="h6" color="blue" className="mb-4">
            Información del Conductor
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Typography variant="small" className="font-bold text-blue-gray-700">
                Licencia:
              </Typography>
              <Typography className="text-blue-gray-600 font-mono">
                {user.perfil.licencia || 'No especificada'}
              </Typography>
            </div>
            <div>
              <Typography variant="small" className="font-bold text-blue-gray-700">
                Categoría:
              </Typography>
              <Typography className="text-blue-gray-600">
                {user.perfil.categoria_licencia || 'No especificada'}
              </Typography>
            </div>
            <div>
              <Typography variant="small" className="font-bold text-blue-gray-700">
                Vencimiento Licencia:
              </Typography>
              <Typography className="text-blue-gray-600">
                {user.perfil.fecha_vencimiento_licencia 
                  ? new Date(user.perfil.fecha_vencimiento_licencia).toLocaleDateString() 
                  : 'No especificado'}
              </Typography>
            </div>
            <div>
              <Typography variant="small" className="font-bold text-blue-gray-700">
                Disponible:
              </Typography>
              <Chip
                value={user.perfil.disponible ? "Sí" : "No"}
                color={user.perfil.disponible ? "green" : "gray"}
                size="sm"
                className="mt-1 w-fit"
              />
            </div>
          </div>
        </div>
      );
    }
    
    if (user.perfil.tipo === 'ciudadano') {
      return (
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <Typography variant="h6" color="green" className="mb-4">
            Información del Ciudadano
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Typography variant="small" className="font-bold text-blue-gray-700">
                Puntos Acumulados:
              </Typography>
              <Typography className="text-blue-gray-600">
                {user.perfil.puntos_acumulados || 0} puntos
              </Typography>
            </div>
            <div>
              <Typography variant="small" className="font-bold text-blue-gray-700">
                Nivel:
              </Typography>
              <Typography className="text-blue-gray-600">
                {user.perfil.nivel || 1}
              </Typography>
            </div>
            {user.perfil.logros && user.perfil.logros.length > 0 && (
              <div className="col-span-2">
                <Typography variant="small" className="font-bold text-blue-gray-700 mb-2">
                  Logros:
                </Typography>
                <div className="flex flex-wrap gap-2">
                  {user.perfil.logros.map((logro, index) => (
                    <Chip
                      key={index}
                      value={logro}
                      color="amber"
                      size="sm"
                      className="rounded-full"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex justify-center items-center h-96">
        <Alert color="red" className="max-w-md">
          {error || "Usuario no encontrado"}
        </Alert>
      </div>
    );
  }

  // Avatar URL usando ui-avatars como fallback
  const avatarUrl = user.profile_photo_url || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nombres + ' ' + user.apellidos)}&background=0D9488&color=fff&size=128&bold=true&length=2`;

  // Información básica del usuario (ahora con teléfono y dirección en user)
  const userInfo = [
    { label: "ID", value: user.id },
    { label: "Nombres", value: user.nombres },
    { label: "Apellidos", value: user.apellidos },
    { label: "Email", value: user.email },
    { label: "Teléfono", value: user.telefono || "No especificado" },
    { label: "Dirección", value: user.direccion || "No especificada" },
    { 
      label: "Fecha de creación", 
      value: user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A" 
    },
    { 
      label: "Última actualización", 
      value: user.updated_at ? new Date(user.updated_at).toLocaleDateString() : "N/A" 
    },
  ];

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
              Detalles del Usuario
            </Typography>
          </div>
        </CardHeader>
        
        <CardBody>
          <div className="flex flex-col items-center mb-8">
            <Avatar
              src={avatarUrl}
              alt={user.nombres}
              size="xxl"
              className="mb-4 border-4 border-blue-500/20"
            />
            <Typography variant="h4" color="blue-gray" className="font-bold">
              {user.nombres} {user.apellidos}
            </Typography>
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              {user.roles?.map((rol, i) => (
                <Chip
                  key={i}
                  value={rol}
                  color="blue"
                  size="sm"
                  className="rounded-full capitalize"
                />
              ))}
            </div>
            <div className="mt-3">
              <Chip
                value={user.estado ? "Activo" : "Inactivo"}
                color={user.estado ? "green" : "red"}
                size="sm"
                className="rounded-full"
              />
            </div>
          </div>

          <div className="border-t border-blue-gray-100 pt-6">
            <Typography variant="h5" color="blue-gray" className="mb-4">
              Información General
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userInfo.map((item, index) => (
                <div key={index} className="border-b border-blue-gray-50 py-2">
                  <Typography variant="small" color="blue-gray" className="font-bold">
                    {item.label}
                  </Typography>
                  <Typography variant="small" className="font-normal text-blue-gray-600">
                    {item.value}
                  </Typography>
                </div>
              ))}
            </div>
          </div>

          {/* Información específica según el rol */}
          {renderProfileInfo()}
        </CardBody>
        
        <CardFooter className="flex justify-end gap-4 border-t border-blue-gray-50 p-6">
          <Button
            color="blue"
            className="flex items-center gap-2"
            onClick={() => navigate(`/dashboard/users/${id}/edit`)}
          >
            <PencilIcon className="h-4 w-4" />
            Editar Usuario
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default UserDetails;