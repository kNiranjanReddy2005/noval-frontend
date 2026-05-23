import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import DashboardLayout from "./components/DashboardLayout";
import menuData from "./data/menuData";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentPage from "./pages/StudentPage";
import TeacherPage from "./pages/TeacherPage";
import Dashboard from "./pages/Dashboard";
import StudentAdmissionForm from "./pages/Admission";
import StudentAdmissionFormPage from "./pages/StudentAdmissionFormPage";
import AttendanceSystem from "./pages/Attedence";
import ExamDashboard from "./pages/Exam";
import Students from "./pages/Students";
import Teacher from "./pages/Teacher";
import ResponsiveShowcase from "./pages/ResponsiveShowcase";
import ModulePlaceholderPage from "./pages/ModulePlaceholder";
import Fee from "./pages/Fee";
import Leavemanagement from "./pages/Leavemanagement";
import Reports from "./pages/Reports";
import Staff from "./pages/Staff";
import Account from "./pages/Account";
import Department from "./pages/Department";
import StudentDashboard from "./pages/StudentDashboard";
import { getStoredUser, isAuthenticated } from "./utils/auth";
import { canAccessRoute, getDefaultRouteForRole, getVisibleMenuData } from "./utils/permissions";

const liveModulePaths = new Set([
  "/dashboard/academichub/admission",
  "/dashboard/academichub/attedence",
  "/dashboard/academichub/exam",
  "/dashboard/academichub/leave",
  "/dashboard/finance/bank-book",
  "/dashboard/finance/journal",
  "/dashboard/finance/contra",
  "/dashboard/finance/balance-sheet",
  "/dashboard/finance/profit-loss",
  "/dashboard/admin/registration",
]);

function ProtectedRoute({ children, allowedRoles, requiredPath }) {
  const user = getStoredUser();

  if (!isAuthenticated() || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  if (requiredPath && !canAccessRoute(user.role, requiredPath)) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  return children;
}

function PublicOnlyRoute({ children }) {
  const user = getStoredUser();

  if (isAuthenticated() && user) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  return children;
}

function HomeRedirect() {
  const user = getStoredUser();

  if (isAuthenticated() && user) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  return <Navigate to="/login" replace />;
}

function App() {
  const user = getStoredUser();
  const visibleMenuData = getVisibleMenuData(user?.role || "student");
  const placeholderModules = Object.entries(visibleMenuData).flatMap(
    ([categoryName, category]) =>
      category.items
        .filter((item) => !liveModulePaths.has(item.path))
        .map((item) => ({
          ...item,
          categoryName,
        }))
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["super_admin", "admin"]} requiredPath="/dashboard">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/student/home"
            element={
              <ProtectedRoute allowedRoles={["student"]} requiredPath="/dashboard/student/home">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/academichub/admission"
            element={
              <ProtectedRoute requiredPath="/dashboard/academichub/admission">
                <StudentAdmissionForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/academichub/admission/form"
            element={
              <ProtectedRoute allowedRoles={["super_admin", "admin"]} requiredPath="/dashboard/academichub/admission/form">
                <StudentAdmissionFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/academichub/admission/records"
            element={
              <ProtectedRoute requiredPath="/dashboard/academichub/admission/records">
                <Students />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/academichub/attedence"
            element={
              <ProtectedRoute requiredPath="/dashboard/academichub/attedence">
                <AttendanceSystem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/academichub/exam"
            element={
              <ProtectedRoute requiredPath="/dashboard/academichub/exam">
                <ExamDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/academichub/leave"
            element={
              <ProtectedRoute requiredPath="/dashboard/academichub/leave">
                <Leavemanagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/finance/bank-book"
            element={
              <ProtectedRoute requiredPath="/dashboard/finance/bank-book">
                <Staff />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/finance/journal"
            element={
              <ProtectedRoute requiredPath="/dashboard/finance/journal">
                <Department />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/finance/contra"
            element={
              <ProtectedRoute requiredPath="/dashboard/finance/contra">
                <Fee />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/finance/balance-sheet"
            element={
              <ProtectedRoute requiredPath="/dashboard/finance/balance-sheet">
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/finance/profit-loss"
            element={
              <ProtectedRoute requiredPath="/dashboard/finance/profit-loss">
                <Account />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/registration"
            element={
              <ProtectedRoute allowedRoles={["super_admin", "admin"]} requiredPath="/dashboard/admin/registration">
                <Register />
              </ProtectedRoute>
            }
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
          <Route
            path="/students"
            element={
              <ProtectedRoute allowedRoles={["super_admin", "admin"]} requiredPath="/students">
                <Students />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teachers"
            element={
              <ProtectedRoute allowedRoles={["super_admin", "admin"]} requiredPath="/teachers">
                <Teacher />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <ProtectedRoute requiredPath="/dashboard/academichub/attedence">
                <AttendanceSystem />
              </ProtectedRoute>
            }
          />
          <Route path="/Fee" element={<Navigate to="/fees" replace />} />
          <Route
            path="/fees"
            element={
              <ProtectedRoute requiredPath="/fees">
                <Fee />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute requiredPath="/settings">
                <ModulePlaceholderPage categoryName="General" moduleName="Settings" />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route
          path="/student-admission"
          element={
            <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
              <StudentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher-admission"
          element={
            <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
              <TeacherPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
              <Register />
            </ProtectedRoute>
          }
        />
        <Route path="/dashboard/login" element={<Navigate to="/login" replace />} />
        <Route path="/dashboard/register" element={<Navigate to="/dashboard/admin/registration" replace />} />
        <Route path="/responsive-layout" element={<ResponsiveShowcase />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
