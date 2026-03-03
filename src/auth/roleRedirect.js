export function getHomeByRole(roles = []) {

  if (roles.includes("super-admin"))
    return "/dashboard/home";

  if (roles.includes("administrador"))
    return "/dashboard/admin";

  if (roles.includes("supervisor-rutas"))
    return "/dashboard/rutas";

  if (roles.includes("conductor"))
    return "/dashboard/conductor";

  if (roles.includes("operador-recoleccion"))
    return "/dashboard/recoleccion";

  if (roles.includes("encargado-punto-verde"))
    return "/dashboard/punto-verde";

  if (roles.includes("cuadrilla-limpieza"))
    return "/dashboard/cuadrilla";

  if (roles.includes("auditor"))
    return "/dashboard/auditoria";

  if (roles.includes("ciudadano"))
    return "/dashboard/ciudadano";

  return "/dashboard/home";
}