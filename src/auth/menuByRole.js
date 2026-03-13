export function filterRoutesByRole(routes, roles = []) {
    if (!Array.isArray(roles)) {
        roles = [];
    }

    return routes
        .map(section => ({
            ...section,
            pages: section.pages.filter(page => {
                // Filtrar por hidden para el menú
                if (page.hidden) return false;
                
                // Filtrar por roles
                if (!page.roles) return true;
                if (!Array.isArray(page.roles)) return false;
                return page.roles.some(role => roles.includes(role));
            })
        }))
        .filter(section => section.pages.length > 0);
}

// Para la navegación (solo filtra por rol, mantiene hidden)
export function filterRoutesForNavigation(routes, roles = []) {
    if (!Array.isArray(roles)) {
        roles = [];
    }

    return routes
        .map(section => ({
            ...section,
            pages: section.pages.filter(page => {
                
                if (!page.roles) return true;
                if (!Array.isArray(page.roles)) return false;
                return page.roles.some(role => roles.includes(role));
            })
        }))
        .filter(section => section.pages.length > 0);
}