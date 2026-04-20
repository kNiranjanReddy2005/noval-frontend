import { Home, Users, BookOpen, CreditCard, Settings, LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg transition ${
      isActive ? "bg-white/20" : "hover:bg-white/10"
    }`;

  return (
    <div className="w-64 bg-gradient-to-b from-indigo-900 to-indigo-700 text-white p-5">

      <h2 className="text-2xl font-bold mb-8">EduFirm</h2>

      <ul className="space-y-3">

        <li>
          <NavLink to="/" className={linkClass}>
            <Home size={18} /> Home
          </NavLink>
        </li>

        <li>
          <NavLink to="/dashboard" className={linkClass}>
            <Users size={18} /> Dashboard
          </NavLink>
        </li>

        <li>
          <NavLink to="/students" className={linkClass}>
            <Users size={18} /> Students
          </NavLink>
        </li>

        <li>
          <NavLink to="/teachers" className={linkClass}>
            <BookOpen size={18} /> Teachers
          </NavLink>
        </li>

        <li>
          <NavLink to="/attendance" className={linkClass}>
            <BookOpen size={18} /> Attendance
          </NavLink>
        </li>

        <li>
          <NavLink to="/fees" className={linkClass}>
            <CreditCard size={18} /> Fees
          </NavLink>
        </li>

        <li>
          <NavLink to="/settings" className={linkClass}>
            <Settings size={18} /> Settings
          </NavLink>
        </li>

        <li>
          <NavLink to="/logout" className={linkClass}>
            <LogOut size={18} /> Logout
          </NavLink>
        </li>

      </ul>
    </div>
  );
};

export default Sidebar;