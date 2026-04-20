import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Home Page (Default) */}
        <Route path="/" element={<Home />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Other Pages */}
        <Route path="/students" element={<h1>Students Page</h1>} />
        <Route path="/teachers" element={<h1>Teachers Page</h1>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;