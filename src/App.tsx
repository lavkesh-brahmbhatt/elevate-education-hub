import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import DashboardWrapper from "./pages/DashboardWrapper";

// Admin pages
import ManageTeachers from "./pages/admin/ManageTeachers";
import ManageStudents from "./pages/admin/ManageStudents";
import ManageClasses from "./pages/admin/ManageClasses";
import ManageSubjects from "./pages/admin/ManageSubjects";

// Teacher pages
import TeacherAttendance from "./pages/teacher/TeacherAttendance";
import TeacherAssignments from "./pages/teacher/TeacherAssignments";
import TeacherMarks from "./pages/teacher/TeacherMarks";

// Student pages
import StudentAssignments from "./pages/student/StudentAssignments";
import StudentAttendance from "./pages/student/StudentAttendance";
import StudentMarks from "./pages/student/StudentMarks";

// Shared pages
import MaterialsPage from "./pages/shared/MaterialsPage";
import MyClassesPage from "./pages/shared/MyClassesPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Dashboard (role-based) */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

            {/* Admin routes */}
            <Route path="/dashboard/teachers" element={<ProtectedRoute allowedRoles={['admin']}><DashboardWrapper><ManageTeachers /></DashboardWrapper></ProtectedRoute>} />
            <Route path="/dashboard/students" element={<ProtectedRoute allowedRoles={['admin']}><DashboardWrapper><ManageStudents /></DashboardWrapper></ProtectedRoute>} />
            <Route path="/dashboard/classes" element={<ProtectedRoute allowedRoles={['admin']}><DashboardWrapper><ManageClasses /></DashboardWrapper></ProtectedRoute>} />
            <Route path="/dashboard/subjects" element={<ProtectedRoute allowedRoles={['admin']}><DashboardWrapper><ManageSubjects /></DashboardWrapper></ProtectedRoute>} />

            {/* Teacher routes */}
            <Route path="/dashboard/attendance" element={<ProtectedRoute allowedRoles={['teacher']}><DashboardWrapper><TeacherAttendance /></DashboardWrapper></ProtectedRoute>} />
            <Route path="/dashboard/assignments" element={<ProtectedRoute allowedRoles={['teacher', 'student']}><DashboardWrapper><TeacherAssignments /></DashboardWrapper></ProtectedRoute>} />
            <Route path="/dashboard/marks" element={<ProtectedRoute allowedRoles={['teacher']}><DashboardWrapper><TeacherMarks /></DashboardWrapper></ProtectedRoute>} />

            {/* Student routes */}
            <Route path="/dashboard/my-attendance" element={<ProtectedRoute allowedRoles={['student']}><DashboardWrapper><StudentAttendance /></DashboardWrapper></ProtectedRoute>} />
            <Route path="/dashboard/my-marks" element={<ProtectedRoute allowedRoles={['student']}><DashboardWrapper><StudentMarks /></DashboardWrapper></ProtectedRoute>} />

            {/* Shared routes */}
            <Route path="/dashboard/my-classes" element={<ProtectedRoute allowedRoles={['teacher', 'student']}><DashboardWrapper><MyClassesPage /></DashboardWrapper></ProtectedRoute>} />
            <Route path="/dashboard/materials" element={<ProtectedRoute allowedRoles={['teacher', 'student']}><DashboardWrapper><MaterialsPage /></DashboardWrapper></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
