import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 md:flex md:items-stretch">
      <Sidebar />

      <main className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 bg-white shadow-sm">
          <Topbar />
        </header>

        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
