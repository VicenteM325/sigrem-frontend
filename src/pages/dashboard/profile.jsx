import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Avatar,
  Typography,
  Tabs,
  TabsHeader,
  Tab,
  Switch,
  Tooltip,
  Button,
} from "@material-tailwind/react";
import {
  HomeIcon,
  ChatBubbleLeftEllipsisIcon,
  Cog6ToothIcon,
  PencilIcon,
} from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import { ProfileInfoCard, MessageCard } from "@/widgets/cards";
import { platformSettingsData, conversationsData, projectsData } from "@/data";

export function Profile() {
  const { user, roles } = useContext(AuthContext);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <Typography variant="h5">Cargando perfil...</Typography>
      </div>
    );
  }

  // Formatear fecha de creación
  const memberSince = new Date(user.created_at).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Determinar el rol principal para mostrar como título
  const mainRole = roles && roles.length > 0 
    ? roles[0].charAt(0).toUpperCase() + roles[0].slice(1) 
    : 'Usuario';

  // Información para ProfileInfoCard
  const profileDetails = {
    "nombre completo": user.name || 'No especificado',
    "nombres": user.nombres || 'No especificado',
    "apellidos": user.apellidos || 'No especificado',
    "email": user.email,
    "dirección": user.direccion || 'No especificada',
    "teléfono": user.telefono || "(No disponible)", 
    "miembro desde": memberSince,
    "estado": user.estado ? 'Activo' : 'Inactivo',
    "social": (
      <div className="flex items-center gap-4">
        <i className="fa-brands fa-facebook text-blue-700 cursor-pointer hover:opacity-70" />
        <i className="fa-brands fa-twitter text-blue-400 cursor-pointer hover:opacity-70" />
        <i className="fa-brands fa-instagram text-purple-500 cursor-pointer hover:opacity-70" />
      </div>
    ),
  };

  return (
    <>
      <div className="relative mt-8 h-72 w-full overflow-hidden rounded-xl bg-[url('/img/background-image.png')] bg-cover bg-center">
        <div className="absolute inset-0 h-full w-full bg-gray-900/75" />
      </div>
      
      <Card className="mx-3 -mt-16 mb-6 lg:mx-4 border border-blue-gray-100">
        <CardBody className="p-4">
          {/* Header con información del usuario */}
          <div className="mb-10 flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center gap-6">
              <Avatar
                src={user.profile_photo_url || "/img/bruce-mars.jpeg"}
                alt={user.name}
                size="xl"
                variant="rounded"
                className="rounded-lg shadow-lg shadow-blue-gray-500/40"
              />
              <div>
                <Typography variant="h5" color="blue-gray" className="mb-1">
                  {user.name}
                </Typography>
                <Typography
                  variant="small"
                  className="font-normal text-blue-gray-600"
                >
                  {mainRole} {roles && roles.length > 1 && `+ ${roles.length - 1} roles más`}
                </Typography>
                {/* Chips de roles adicionales */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {roles && roles.map((role, index) => (
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
            
            {/* Tabs de navegación */}
            <div className="w-96">
              <Tabs value="app">
                <TabsHeader>
                  <Tab value="app">
                    <HomeIcon className="-mt-1 mr-2 inline-block h-5 w-5" />
                    App
                  </Tab>
                  <Tab value="message">
                    <ChatBubbleLeftEllipsisIcon className="-mt-0.5 mr-2 inline-block h-5 w-5" />
                    Message
                  </Tab>
                  <Tab value="settings">
                    <Cog6ToothIcon className="-mt-1 mr-2 inline-block h-5 w-5" />
                    Settings
                  </Tab>
                </TabsHeader>
              </Tabs>
            </div>
          </div>

          {/* Grid principal */}
          <div className="gird-cols-1 mb-12 grid gap-12 px-4 lg:grid-cols-2 xl:grid-cols-3">
            {/* Platform Settings */}
            <div>
              <Typography variant="h6" color="blue-gray" className="mb-3">
                Configuración de Plataforma
              </Typography>
              <div className="flex flex-col gap-12">
                {platformSettingsData.map(({ title, options }) => (
                  <div key={title}>
                    <Typography className="mb-4 block text-xs font-semibold uppercase text-blue-gray-500">
                      {title}
                    </Typography>
                    <div className="flex flex-col gap-6">
                      {options.map(({ checked, label }) => (
                        <Switch
                          key={label}
                          id={label}
                          label={label}
                          defaultChecked={checked}
                          labelProps={{
                            className: "text-sm font-normal text-blue-gray-500",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile Info Card */}
            <ProfileInfoCard
              title="Información de Perfil"
              description={`Hola, soy ${user.name}. Bienvenido a mi perfil.`}
              details={profileDetails}
              action={
                <Tooltip content="Editar Perfil">
                  <PencilIcon className="h-4 w-4 cursor-pointer text-blue-gray-500 hover:text-blue-500" />
                </Tooltip>
              }
            />

            {/* Conversations */}
            <div>
              <Typography variant="h6" color="blue-gray" className="mb-3">
                Conversaciones Recientes
              </Typography>
              <ul className="flex flex-col gap-6">
                {conversationsData.map((props) => (
                  <MessageCard
                    key={props.name}
                    {...props}
                    action={
                      <Button variant="text" size="sm">
                        responder
                      </Button>
                    }
                  />
                ))}
              </ul>
            </div>
          </div>

          {/* Projects Section */}
          <div className="px-4 pb-4">
            <Typography variant="h6" color="blue-gray" className="mb-2">
              Proyectos
            </Typography>
            <Typography
              variant="small"
              className="font-normal text-blue-gray-500"
            >
              Proyectos en los que participas
            </Typography>
            
            <div className="mt-6 grid grid-cols-1 gap-12 md:grid-cols-2 xl:grid-cols-4">
              {projectsData.map(
                ({ img, title, description, tag, route, members }) => (
                  <Card key={title} color="transparent" shadow={false}>
                    <CardHeader
                      floated={false}
                      color="gray"
                      className="mx-0 mt-0 mb-4 h-64 xl:h-40"
                    >
                      <img
                        src={img}
                        alt={title}
                        className="h-full w-full object-cover"
                      />
                    </CardHeader>
                    <CardBody className="py-0 px-1">
                      <Typography
                        variant="small"
                        className="font-normal text-blue-gray-500"
                      >
                        {tag}
                      </Typography>
                      <Typography
                        variant="h5"
                        color="blue-gray"
                        className="mt-1 mb-2"
                      >
                        {title}
                      </Typography>
                      <Typography
                        variant="small"
                        className="font-normal text-blue-gray-500"
                      >
                        {description}
                      </Typography>
                    </CardBody>
                    <CardFooter className="mt-6 flex items-center justify-between py-0 px-1">
                      <Link to={route}>
                        <Button variant="outlined" size="sm">
                          ver proyecto
                        </Button>
                      </Link>
                      <div className="flex">
                        {members.map(({ img, name }, key) => (
                          <Tooltip key={name} content={name}>
                            <Avatar
                              src={img}
                              alt={name}
                              size="xs"
                              variant="circular"
                              className={`cursor-pointer border-2 border-white ${
                                key === 0 ? "" : "-ml-2.5"
                              }`}
                            />
                          </Tooltip>
                        ))}
                      </div>
                    </CardFooter>
                  </Card>
                )
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </>
  );
}

export default Profile;