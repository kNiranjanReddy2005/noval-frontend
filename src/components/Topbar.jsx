import { Bell } from "lucide-react";

const Topbar = () => {
  return (
    <div className="flex justify-between items-center mb-6">

      {/* Search */}
      <input
        type="text"
        placeholder="Search..."
        className="bg-white shadow px-4 py-2 rounded-lg w-1/3 outline-none focus:ring-2 focus:ring-indigo-400"
      />

      {/* Right Side */}
      <div className="flex items-center gap-4">

        <div className="relative cursor-pointer">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
            3
          </span>
        </div>

        <div className="bg-indigo-600 text-white w-9 h-9 flex items-center justify-center rounded-full font-semibold">
          UR
        </div>

      </div>
    </div>
  );
};

export default Topbar;