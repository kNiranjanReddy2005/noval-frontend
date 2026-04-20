import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const requirements = [
  "Bank Books",
  "Journal",
  "Contra",
  "Profit & Loss",
  "Balance Sheet",
  "Payment Register",
  "Purchase Register",
  "Day Book",
  "GST (Input/Output)",
  "Budget Report",
];

const Home = () => {
  return (
    <div className="flex h-screen bg-gray-100">

      <Sidebar />

      <div className="flex-1 p-6">
        <Topbar />

        {/* Cards */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-5 rounded-xl shadow hover:shadow-md transition">
            <p className="text-gray-500">Bank Books</p>
            <h2 className="text-2xl font-bold">56</h2>
          </div>

          <div className="bg-white p-5 rounded-xl shadow hover:shadow-md transition">
            <p className="text-gray-500">Total Students</p>
            <h2 className="text-2xl font-bold text-green-500">1345</h2>
          </div>

          <div className="bg-white p-5 rounded-xl shadow hover:shadow-md transition">
            <p className="text-gray-500">Non Billup Fees</p>
            <h2 className="text-2xl font-bold text-red-500">$1,250</h2>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white p-5 rounded-xl shadow">
          <div className="flex justify-between mb-2">
            <h2 className="font-semibold text-lg">Requirements</h2>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
              + Add Requirement
            </button>
          </div>

          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Sl No</th>
                <th className="p-2 text-left">Required</th>
              </tr>
            </thead>

            <tbody>
              {requirements.map((item, index) => (
                <tr key={index} className="border-t hover:bg-gray-50">
                  <td className="p-2">{index + 1}</td>
                  <td className="p-2">{item}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default Home;