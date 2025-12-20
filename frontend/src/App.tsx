import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import StudentStats from "./pages/StudentStats";
import ManageStudents from "./pages/ManageStudents";
import ManageCurriculum from "./pages/ManageCurriculum";
import ManageCertificates from "./pages/ManageCertificates";
import Chatbot from "./pages/Chatbot";
import ExportReports from "./pages/ExportReports";
import NotificationCenter from "./pages/NotificationCenter";
import AttendanceMark from "./pages/AttendanceMark";
import AttendanceReport from "./pages/AttendanceReport";
import ActivityAdd from "./pages/ActivityAdd";
import ActivityList from "./pages/ActivityList";
import NotFound from "./pages/NotFound";
import StudentSubjects from "./pages/StudentSubjects";

const queryClient = new QueryClient();

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {

  const  isAuthenticated  = localStorage.getItem('attendance_app_token') !== null;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// App routes with auth
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student-stats"
        element={
          <ProtectedRoute>
            <StudentStats />
          </ProtectedRoute>
        }
      />
      <Route
        path="/students"
        element={
          <ProtectedRoute>
            <ManageStudents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/curriculum"
        element={
          <ProtectedRoute>
            <ManageCurriculum />
          </ProtectedRoute>
        }
      />
      <Route
        path="/certificates"
        element={
          <ProtectedRoute>
            <ManageCertificates />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chatbot"
        element={
          <ProtectedRoute>
            <Chatbot />
          </ProtectedRoute>
        }
      />
      <Route
        path="/export"
        element={
          <ProtectedRoute>
            <ExportReports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationCenter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance/mark"
        element={
          <ProtectedRoute>
            <AttendanceMark />
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance/report"
        element={
          <ProtectedRoute>
            <AttendanceReport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/activity/add"
        element={
          <ProtectedRoute>
            <ActivityAdd />
          </ProtectedRoute>
        }
      />
      <Route
        path="/activity/list"
        element={
          <ProtectedRoute>
            <ActivityList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student-subjects"
        element={
          <ProtectedRoute>
            <StudentSubjects />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
