import CategoryNavbar from "../components/CategoryNavbar";
import Sidebar from "../components/Sidebar"
import Topbar from "../components/Topbar";


const Dashboard = () => {
  return (
    <div className="flex h-screen bg-gray-100">

      <Sidebar />

      <div className="flex-1 p-6">
        <Topbar />

        <CategoryNavbar />

        <div className="bg-white p-5 rounded-xl shadow mt-4">
          <h2 className="font-semibold text-lg">Modules</h2>
          <p className="text-gray-500">
            Click categories to explore modules
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;