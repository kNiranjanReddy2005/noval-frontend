import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import DashboardLayout from "./components/DashboardLayout";
import menuData from "./data/menuData";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentPage from "./pages/StudentPage";
import TeacherPage from "./pages/TeacherPage";
import Dashboard from "./pages/Dashboard";
import StudentAdmissionForm from "./pages/Admission";
import AttendanceSystem from "./pages/Attedence";
import ExamDashboard from "./pages/Exam";
import Students from "./pages/Students";
import Teacher from "./pages/Teacher";
import ResponsiveShowcase from "./pages/ResponsiveShowcase";
import ModulePlaceholderPage from "./pages/ModulePlaceholder";

const liveModulePaths = new Set([
  "/dashboard/academichub/admission",
  "/dashboard/academichub/attedence",
  "/dashboard/academichub/exam",
]);

const placeholderModules = Object.entries(menuData).flatMap(
  ([categoryName, category]) =>
    category.items
      .filter((item) => !liveModulePaths.has(item.path))
      .map((item) => ({
        ...item,
        categoryName,
      }))
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/student-admission" element={<StudentPage />} />
        <Route path="/teacher-admission" element={<TeacherPage />} />

        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/dashboard/academichub/admission"
            element={<StudentAdmissionForm />}
          />
          <Route
            path="/dashboard/academichub/attedence"
            element={<AttendanceSystem />}
          />
          <Route
            path="/dashboard/academichub/exam"
            element={<ExamDashboard />}
          />
          {placeholderModules.map((module) => (
            <Route
              key={module.path}
              path={module.path}
              element={
                <ModulePlaceholderPage
                  categoryName={module.categoryName}
                  moduleName={module.name}
                  Icon={module.icon}
                />
              }
            />
          ))}
          <Route path="/students" element={<Students />} />
          <Route path="/teachers" element={<Teacher />} />
          <Route path="/attendance" element={<AttendanceSystem />} />
          <Route
            path="/fees"
            element={
              <ModulePlaceholderPage categoryName="General" moduleName="Fees" />
            }
          />
          <Route
            path="/settings"
            element={
              <ModulePlaceholderPage
                categoryName="General"
                moduleName="Settings"
              />
            }
          />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard/login" element={<Login />} />
        <Route path="/dashboard/register" element={<Register />} />
        <Route path="/responsive-layout" element={<ResponsiveShowcase />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
