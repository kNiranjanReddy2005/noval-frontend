import { useState } from "react";
import menuData from "../data/menuData";
import { useNavigate } from "react-router-dom";

const CategoryNavbar = () => {
  const [activeMenu, setActiveMenu] = useState("Student");
  const navigate = useNavigate();

  return (
    <div>

      <div className="flex gap-4 border-b pb-2">
        {Object.keys(menuData).map((menu) => (
          <button
            key={menu}
            onClick={() => setActiveMenu(menu)}
            className={`px-4 py-2 rounded-t-lg font-medium transition ${
              activeMenu === menu
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {menu}
          </button>
        ))}
      </div>

      <div className="bg-white p-4 rounded-b-xl shadow mt-2 grid grid-cols-3 gap-3">
        {menuData[activeMenu].map((item, i) => (
          <div
            key={i}
            onClick={() => navigate(item.path)}
            className="p-3 bg-gray-100 rounded hover:bg-indigo-100 cursor-pointer transition"
          >
            {item.name}
          </div>
        ))}
      </div>

    </div>
  );
};

export default CategoryNavbar;