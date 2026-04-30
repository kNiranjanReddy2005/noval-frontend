import { Bell } from "lucide-react";
import { NavLink } from "react-router-dom";

const Topbar = () => {
  return (
    <div className="w-full mt-4 px-4 md:px-6">
      <div className="flex items-center justify-end gap-3 md:gap-5 bg-white shadow-sm border border-gray-200 rounded-xl px-4 py-2 md:py-3">

        {/* Login */}
        <NavLink
          to="/dashboard/login"
          className={({ isActive }) =>
            `px-4 py-1.5 rounded-lg text-sm md:text-base font-medium transition-all duration-200 ${
              isActive
                ? "bg-indigo-600 text-white shadow"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`
          }
        >
          Login
        </NavLink>

        {/* Register */}
        <NavLink
          to="/dashboard/register"
          className={({ isActive }) =>
            `px-4 py-1.5 rounded-lg text-sm md:text-base font-medium transition-all duration-200 ${
              isActive
                ? "bg-indigo-600 text-white shadow"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`
          }
        >
          Register
        </NavLink>

        {/* Notification */}
        <div className="relative cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition">
          <Bell size={20} className="text-gray-700" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] md:text-xs px-1.5 rounded-full">
            3
          </span>
        </div>

        {/* Profile */}
        <div className="bg-indigo-600 text-white w-9 h-9 flex items-center justify-center rounded-full font-semibold text-sm md:text-base shadow">
          UR
        </div>

      </div>
    </div>
  );
};

export default Topbar;