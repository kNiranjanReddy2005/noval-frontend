import menuData from "../data/menuData";

export const ROLE_LABELS = {
  super_admin: "Super Admin",
  admin: "Admin",
  student: "Student",
};

export const ROLE_HOME_ROUTES = {
  super_admin: "/dashboard",
  admin: "/dashboard",
  student: "/dashboard/student/home",
};

const MODULE_RULES = {
  "/dashboard": ["super_admin", "admin"],
  "/dashboard/admin/registration": ["super_admin", "admin"],
  "/dashboard/academichub/admission": ["super_admin", "admin"],
  "/dashboard/academichub/admission/form": ["super_admin", "admin"],
  "/dashboard/academichub/admission/records": ["super_admin", "admin"],
  "/dashboard/academichub/attedence": ["super_admin", "admin", "student"],
  "/dashboard/academichub/exam": ["super_admin", "admin"],
  "/dashboard/academichub/leave": ["super_admin", "admin"],
  "/dashboard/finance/bank-book": ["super_admin", "admin"],
  "/dashboard/finance/journal": ["super_admin", "admin"],
  "/dashboard/finance/contra": ["super_admin", "admin"],
  "/dashboard/finance/balance-sheet": ["super_admin", "admin"],
  "/dashboard/finance/profit-loss": ["super_admin", "admin"],
  "/students": ["super_admin", "admin"],
  "/teachers": ["super_admin", "admin"],
  "/fees": ["super_admin", "admin", "student"],
  "/settings": ["super_admin", "admin"],
  "/dashboard/student/home": ["student"],
  "/dashboard/student/admission-details": ["student"],
};

const EDIT_RULES = {
  "/dashboard/academichub/admission": ["super_admin", "admin"],
  "/dashboard/academichub/admission/form": ["super_admin", "admin"],
  "/dashboard/academichub/admission/records": ["super_admin", "admin"],
  "/dashboard/academichub/attedence": ["super_admin", "admin"],
};

export function getRoleLabel(role) {
  return ROLE_LABELS[role] || "User";
}

export function getDefaultRouteForRole(role) {
  return ROLE_HOME_ROUTES[role] || "/login";
}

export function canAccessRoute(role, path) {
  return (MODULE_RULES[path] || ["super_admin"]).includes(role);
}

export function canEditModule(role, path) {
  if (role === "super_admin") {
    return true;
  }

  return (EDIT_RULES[path] || []).includes(role);
}

export function canManageUsers(role) {
  return role === "super_admin" || role === "admin";
}

export function getCreatableRoles(role) {
  if (role === "super_admin") {
    return ["admin"];
  }

  if (role === "admin") {
    return ["student"];
  }

  return [];
}

export function getVisibleMenuData(role) {
  return Object.fromEntries(
    Object.entries(menuData)
      .map(([categoryName, category]) => {
        const items = category.items.filter((item) => canAccessRoute(role, item.path));
        return [categoryName, { ...category, items }];
      })
      .filter(([, category]) => category.items.length > 0)
  );
}
