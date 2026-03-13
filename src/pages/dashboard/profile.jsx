import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import {
  Card,
  CardBody,
  Avatar,
  Typography,
  Tooltip,
} from "@material-tailwind/react";
import { PencilIcon } from "@heroicons/react/24/solid";
import { ProfileInfoCard } from "@/widgets/cards";

export function Profile() {
  const { user, roles } = useContext(AuthContext);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <Typography variant="h5">Cargando perfil...</Typography>
      </div>
    );
  }

  const memberSince = new Date(user.created_at).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const mainRole =
    roles && roles.length > 0
      ? roles[0].charAt(0).toUpperCase() + roles[0].slice(1)
      : "Usuario";

  const profileDetails = {
    "nombre completo": user.name || "No especificado",
    email: user.email,
    dirección: user.direccion || "No especificada",
    teléfono: user.telefono || "No disponible",
    "miembro desde": memberSince,
    estado: user.estado ? "Activo" : "Inactivo",
  };

  return (
    <>
      {/* Banner */}
      <div className="relative mt-8 h-72 w-full overflow-hidden rounded-xl bg-[url('/img/background-image.png')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gray-900/70" />
      </div>

      {/* Card principal */}
      <Card className="mx-3 -mt-16 mb-6 lg:mx-4 border border-blue-gray-100">
        <CardBody className="p-6">

          {/* Header usuario */}
          <div className="flex items-center gap-6 mb-8">
            <Avatar
              src={user.profile_photo_url || "/img/bruce-mars.jpeg"}
              alt={user.name}
              size="xl"
              variant="rounded"
              className="rounded-lg shadow-lg shadow-blue-gray-500/40"
            />

            <div>
              <Typography variant="h4" color="blue-gray">
                {user.name}
              </Typography>

              <Typography
                variant="small"
                className="font-normal text-blue-gray-600"
              >
                {mainRole}
              </Typography>

              <div className="flex flex-wrap gap-2 mt-2">
                {roles &&
                  roles.map((role, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                    >
                      {role}
                    </span>
                  ))}
              </div>
            </div>
          </div>

          {/* Información del perfil */}
          <div className="max-w-2xl">
            <ProfileInfoCard
              title="Información del Perfil"
              description={`Hola, soy ${user.name}. Esta es mi información personal.`}
              details={profileDetails}
              action={
                <Tooltip content="Editar Perfil">
                  <PencilIcon className="h-4 w-4 cursor-pointer text-blue-gray-500 hover:text-blue-500" />
                </Tooltip>
              }
            />
          </div>
        </CardBody>
      </Card>
    </>
  );
}

export default Profile;