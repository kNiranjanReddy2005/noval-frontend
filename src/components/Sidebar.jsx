import { useState } from "react";
import {
  Users,
  BookOpen,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import Logo from "../assets/Logo.png";

const Sidebar = () => {
  const [open, setOpen] = useState(false);

  const closeSidebar = () => setOpen(false);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${
      isActive
        ? "bg-white/20 text-white shadow"
        : "text-gray-200 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <>
      <div className="flex items-center justify-between bg-indigo-900 px-4 py-3 text-white shadow-md md:hidden">
        <div className="flex items-center gap-3">
          <img
            src={Logo}
            alt="Sabaramati Hospital and College of Nursing"
            className="h-11 w-11 rounded-xl bg-white/10 object-contain p-1.5"
          />
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-indigo-100">
              Admin Panel
            </p>
            <p className="text-base font-bold text-white">Dashboard</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 transition hover:bg-white/10"
          aria-label="Open sidebar"
        >
          <Menu size={22} />
        </button>
      </div>

      <div
        className={`fixed left-0 top-0 z-50 flex h-screen min-h-screen w-64 shrink-0 flex-col justify-between overflow-y-auto bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a] p-5 text-white shadow-xl backdrop-blur-lg transition-transform duration-300 md:sticky ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="mb-2 flex justify-end md:hidden">
          <button
            type="button"
            onClick={closeSidebar}
            className="rounded-lg p-2 transition hover:bg-white/10 hover:text-red-300"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <div>
          <div className="mb-8 mt-2 rounded-[22px] border border-white/10 bg-white/5 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div className="flex items-center gap-3">
              <img
                src={Logo}
                alt="Sabaramati Hospital and College of Nursing"
                className="h-14 w-14 rounded-[18px] bg-gradient-to-br from-white/15 to-white/5 object-contain p-2.5 shadow-lg"
              />
              <div>
                <p className="text-[15px] font-extrabold leading-5 text-white">
                  Sabaramati Hospital
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  College of Nursing
                </p>
              </div>
            </div>
        
          </div>

          <ul className="space-y-2">
            <li>
              <NavLink
                to="/dashboard"
                end
                className={linkClass}
                onClick={closeSidebar}
              >
                <Users size={18} /> Dashboard
              </NavLink>
            </li>

            <li>
              <NavLink to="/students" className={linkClass} onClick={closeSidebar}>
                <Users size={18} /> Students
              </NavLink>
            </li>

            <li>
              <NavLink to="/teachers" className={linkClass} onClick={closeSidebar}>
                <BookOpen size={18} /> Teachers
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/dashboard/academichub/attedence"
                className={linkClass}
                onClick={closeSidebar}
              >
                <BookOpen size={18} /> Attendance
              </NavLink>
            </li>

            <li>
              <NavLink to="/fees" className={linkClass} onClick={closeSidebar}>
                <CreditCard size={18} /> Fees
              </NavLink>
            </li>
          </ul>

          <div className="my-6 border-t border-white/10"></div>

          <NavLink to="/settings" className={linkClass} onClick={closeSidebar}>
            <Settings size={18} /> Settings
          </NavLink>
        </div>

        <div>
          <NavLink
            to="/logout"
            onClick={closeSidebar}
            className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-500/20 hover:text-red-200"
          >
            <LogOut size={18} /> Logout
          </NavLink>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={closeSidebar}
        />
      )}
    </>
  );
};

export default Sidebar;
