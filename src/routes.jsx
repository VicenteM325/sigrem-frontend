import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  QuestionMarkCircleIcon,
  UserPlusIcon,
  UserIcon,
  MapIcon,
  MapPinIcon,
  TruckIcon,
  CalendarIcon,
} from "@heroicons/react/24/solid";

import { Home, Profile, Tables, Notifications, About } from "@/pages/dashboard";
import { SignIn, SignUp } from "@/pages/auth";
import { UserForm, UserDetails } from "@/pages/dashboard/users";
import { RutasList, RutaForm, RutaDetails, ZonasList, 
         ZonaForm, CamionesList, CamionForm, CamionDetails,
         AsignacionesList, AsignacionForm, AsignacionDetails } from "@/pages/dashboard/rutas";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "dashboard",
        path: "/home",
        element: <Home />,
        roles: ["super-admin", "administrador", "auditor"],
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "profile",
        path: "/profile",
        element: <Profile />,
        roles: ["super-admin", "administrador", "auditor", "ciudadano", "conductor"],
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "usuarios",
        path: "/tables",
        element: <Tables />,
        roles: ["super-admin", "administrador"],
      },

      // ZONAS
      {
        icon: <MapPinIcon {...icon} />,
        name: "zonas",
        path: "/zonas",
        element: <ZonasList />,
        roles: ["super-admin", "administrador", "supervisor-rutas"],
      },

      // RUTAS
      {
        icon: <MapIcon {...icon} />,
        name: "rutas",
        path: "/rutas",
        element: <RutasList />,
        roles: ["super-admin", "administrador", "supervisor-rutas"],
      },

      // CAMIONES
      {
        icon: <TruckIcon {...icon} />, 
        name: "camiones",
        path: "/camiones",
        element: <CamionesList />,
        roles: ["super-admin", "administrador", "supervisor-rutas"],
      },
      //AsignacionRutaCamion
      {
        icon: <CalendarIcon {...icon} />,
        name: "asignaciones",
        path: "/asignaciones",
        element: <AsignacionesList />,
        roles: ["super-admin", "administrador", "supervisor-rutas"],
      },

      {
        icon: <QuestionMarkCircleIcon {...icon} />,
        name: "acerca de",
        path: "/about",
        element: <About />,
        roles: ["super-admin", "administrador", "auditor", "ciudadano", "conductor"],
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "notifications",
        path: "/notifications",
        element: <Notifications />,
        roles: ["auditor", "administrador"],
      },


      // RUTAS OCULTAS
      {
        icon: <UserPlusIcon {...icon} />,
        name: "nuevo usuario",
        path: "/users/create",
        element: <UserForm />,
        roles: ["super-admin", "administrador"],
        hidden: true,
      },
      {
        icon: <UserIcon {...icon} />,
        name: "editar usuario",
        path: "/users/:id/edit",
        element: <UserForm />,
        roles: ["super-admin", "administrador"],
        hidden: true,
      },
      {
        icon: <UserIcon {...icon} />,
        name: "detalles usuario",
        path: "/users/:id",
        element: <UserDetails />,
        roles: ["super-admin", "administrador"],
        hidden: true,
      },
      {
        icon: <MapPinIcon {...icon} />,
        name: "nueva zona",
        path: "/zonas/create",
        element: <ZonaForm />,
        roles: ["super-admin", "administrador", "supervisor-rutas"],
        hidden: true,
      },
      {
        icon: <MapPinIcon {...icon} />,
        name: "editar zona",
        path: "/zonas/:id/edit",
        element: <ZonaForm />,
        roles: ["super-admin", "administrador", "supervisor-rutas"],
        hidden: true,
      },
      {
        icon: <MapIcon {...icon} />,
        name: "nueva ruta",
        path: "/rutas/create",
        element: <RutaForm />,
        roles: ["super-admin", "administrador", "supervisor-rutas"],
        hidden: true,
      },
      {
        icon: <MapIcon {...icon} />,
        name: "editar ruta",
        path: "/rutas/:id/edit",
        element: <RutaForm />,
        roles: ["super-admin", "administrador", "supervisor-rutas"],
        hidden: true,
      },
      {
        icon: <MapIcon {...icon} />,
        name: "detalles ruta",
        path: "/rutas/:id",
        element: <RutaDetails />,
        roles: ["super-admin", "administrador", "supervisor-rutas", "conductor"],
        hidden: true,
      },
      {
        icon: <TruckIcon {...icon} />,
        name: "nuevo camión",
        path: "/camiones/create",
        element: <CamionForm />,
        roles: ["super-admin", "administrador"],
        hidden: true,
      },
      {
        icon: <TruckIcon {...icon} />,
        name: "editar camión",
        path: "/camiones/:id/edit",
        element: <CamionForm />,
        roles: ["super-admin", "administrador"],
        hidden: true,
      },
      {
        icon: <TruckIcon {...icon} />,
        name: "detalles camión",
        path: "/camiones/:id",
        element: <CamionDetails />,
        roles: ["super-admin", "administrador", "supervisor-rutas", "conductor"],
        hidden: true,
      },
      {
        name: "nueva asignación",
        path: "/asignaciones/create",
        element: <AsignacionForm />,
        roles: ["super-admin", "administrador", "supervisor-rutas"],
        hidden: true,
      },
      {
        name: "editar asignación",
        path: "/asignaciones/:id/edit",
        element: <AsignacionForm />,
        roles: ["super-admin", "administrador", "supervisor-rutas"],
        hidden: true,
      },
      {
        name: "detalles asignación",
        path: "/asignaciones/:id",
        element: <AsignacionDetails />,
        roles: ["super-admin", "administrador", "supervisor-rutas", "conductor"],
        hidden: true,
      },
    ],
  },
  {
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "sign up",
        path: "/sign-up",
        element: <SignUp />,
      },
    ],
  },
];

export default routes;