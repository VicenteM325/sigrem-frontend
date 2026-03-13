// src/pages/dashboard/tables.jsx
import { useState, useEffect } from "react";
import { PencilIcon, TrashIcon, EyeIcon, PlusIcon } from "@heroicons/react/24/solid";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Avatar,
  Spinner,
  Alert,
} from "@material-tailwind/react";
import { userService } from "@/services/userService";
import { useNavigate } from "react-router-dom";

export function Tables() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getUsers();
      console.log('Respuesta completa:', response);
      
      const usersList = response.users || [];
      setUsers(usersList);
    } catch (err) {
      console.error('Error detallado:', err);
      setError(err.response?.data?.message || "Error al cargar los usuarios");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este usuario?")) {
      try {
        setDeleteLoading(true);
        await userService.deleteUser(id);
        await loadUsers();
      } catch (err) {
        console.error("Error al eliminar usuario:", err);
        alert(err.response?.data?.message || "Error al eliminar el usuario");
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  // Función para obtener el color del badge según el rol
  const getRoleColor = (rol) => {
    const colors = {
      'super-admin': 'purple',
      'administrador': 'red',
      'auditor': 'orange',
      'conductor': 'blue',
      'ciudadano': 'green',
      'supervisor': 'indigo',
      'operador': 'amber',
      'encargado-pv': 'teal',
      'cuadrilla-limpieza': 'gray',
    };
    return colors[rol] || 'blue-gray';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-96">
        <Alert color="red" className="max-w-md">
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader
          variant="gradient"
          color="blue"
          className="mb-8 p-6 flex justify-between items-center"
        >
          <Typography variant="h6" color="white">
            Usuarios del Sistema
          </Typography>
          <Button
            size="sm"
            color="white"
            className="flex items-center gap-2"
            onClick={() => navigate("/dashboard/users/create")}
          >
            <PlusIcon className="h-4 w-4" />
            Nuevo Usuario
          </Button>
        </CardHeader>

        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          {users.length === 0 ? (
            <div className="text-center py-8">
              <Typography variant="h6" color="blue-gray">
                No hay usuarios registrados
              </Typography>
              <Button
                variant="text"
                color="blue"
                className="mt-4"
                onClick={() => navigate("/dashboard/users/create")}
              >
                Crear el primer usuario
              </Button>
            </div>
          ) : (
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {["usuario", "email", "roles", "estado", "acciones"].map((el) => (
                    <th
                      key={el}
                      className="border-b border-blue-gray-50 py-3 px-5 text-left"
                    >
                      <Typography
                        variant="small"
                        className="text-[11px] font-bold uppercase text-blue-gray-400"
                      >
                        {el}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user, key) => {
                  const className = `py-3 px-5 ${
                    key === users.length - 1 ? "" : "border-b border-blue-gray-50"
                  }`;

                  // Avatar con iniciales
                  const avatarUrl = user.profile_photo_url || 
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nombres + ' ' + user.apellidos)}&background=0D9488&color=fff&size=32&bold=true&length=2`;

                  return (
                    <tr key={user.id}>
                      <td className={className}>
                        <div className="flex items-center gap-4">
                          <Avatar
                            src={avatarUrl}
                            alt={user.nombres}
                            size="sm"
                          />
                          <div>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-semibold"
                            >
                              {user.nombres} {user.apellidos}
                            </Typography>
                            <Typography
                              variant="small"
                              className="text-xs font-normal text-blue-gray-500"
                            >
                              ID: {user.id}
                            </Typography>
                          </div>
                        </div>
                      </td>
                      <td className={className}>
                        <Typography variant="small" className="font-normal">
                          {user.email}
                        </Typography>
                      </td>
                      <td className={className}>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {user.roles?.map((rol, i) => {
                            const color = getRoleColor(rol);
                            return (
                              <span
                                key={i}
                                className={`px-2 py-1 text-xs rounded-full font-medium bg-${color}-50 text-${color}-700`}
                              >
                                {rol.replace('-', ' ')}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className={className}>
                        <div className="w-20">
                          <div
                            className={`py-1 px-2 text-xs rounded-full text-center font-medium ${
                              user.estado
                                ? "bg-green-50 text-green-600"
                                : "bg-red-50 text-red-600"
                            }`}
                          >
                            {user.estado ? "Activo" : "Inactivo"}
                          </div>
                        </div>
                      </td>
                      <td className={className}>
                        <div className="flex gap-2">
                          <Tooltip content="Ver detalles">
                            <IconButton
                              variant="text"
                              size="sm"
                              onClick={() => navigate(`/dashboard/users/${user.id}`)}
                              disabled={deleteLoading}
                            >
                              <EyeIcon className="h-4 w-4" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip content="Editar usuario">
                            <IconButton
                              variant="text"
                              size="sm"
                              onClick={() => navigate(`/dashboard/users/${user.id}/edit`)}
                              disabled={deleteLoading}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip content="Eliminar usuario">
                            <IconButton
                              variant="text"
                              size="sm"
                              color="red"
                              onClick={() => handleDelete(user.id)}
                              disabled={deleteLoading}
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
        </CardBody>

        {users.length > 0 && (
          <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
            <Typography variant="small" color="blue-gray" className="font-normal">
              Mostrando {users.length} usuarios
            </Typography>
            <div className="flex gap-2">
              <Button variant="outlined" size="sm" disabled>
                Anterior
              </Button>
              <Button variant="outlined" size="sm" disabled>
                Siguiente
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

export default Tables;