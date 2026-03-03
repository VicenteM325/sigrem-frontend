export function filterRoutesByRole(routes, roles = []) {

    if (!Array.isArray(roles)) {
        roles = [];
    }

    return routes.map(section => {

        return {
            ...section,
            pages: section.pages.filter(page => {

                if (!page.roles) {
                    return true;
                }

                if (!Array.isArray(page.roles)) {
                    return false;
                }

                const hasValidRole = page.roles.some(role => roles.includes(role));

                return hasValidRole;
            })
        };
    });
}