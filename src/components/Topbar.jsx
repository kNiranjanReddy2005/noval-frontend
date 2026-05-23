import { BadgeCheck, Eye, Pencil, ShieldCheck } from "lucide-react";
import { NavLink } from "react-router-dom";
import { getStoredUser } from "../utils/auth";
import { canEditModule, canManageUsers, getRoleLabel } from "../utils/permissions";

const Topbar = () => {
  const user = getStoredUser();
  const role = user?.role;

  return (
    <div className="w-full mt-4 px-4 md:px-6">
      <div className="relative flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
            <ShieldCheck size={16} />
            {getRoleLabel(role)}
          </span>

          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
            <span className="text-slate-500">User</span>
            <span className="font-semibold text-slate-900">{user?.name || "Unknown User"}</span>
          </span>

          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
            {role === "student" ? <Eye size={14} /> : <Pencil size={14} />}
            {role === "student" ? "View-only access" : canEditModule(role, "/dashboard/academichub/admission") ? "Edit-enabled access" : "Restricted access"}
          </span>
        </div>

        {canManageUsers(role) && (
          <NavLink
            to="/dashboard/admin/registration"
            className={({ isActive }) =>
              `inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? "bg-indigo-600 text-white shadow"
                  : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`
            }
          >
            <BadgeCheck size={16} />
            {role === "super_admin" ? "Admin Registration Panel" : "Student Registration Panel"}
          </NavLink>
        )}
      </div>
    </div>
  );
};

export default Topbar;
