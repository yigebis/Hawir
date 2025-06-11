
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import PrivateRoute from "@/components/auth/PrivateRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ManageTravels from "./pages/ManageTravels";
import Fleet from "./pages/Fleet";
import ChangePassword from "./pages/ChangePassword";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Tours from "./pages/Tours";
import Reports from "./pages/Reports";
import Advertisement from "./pages/Advertisement";
import Notifications from "./pages/Notifications";
import "./styles/calendar.css";
import "./i18n";
import ManageTours from "./components/tours/ManageTours";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              {/* Protected routes */}
              <Route element={<PrivateRoute />}>
                <Route path="/" element={<Index />} />
                <Route path="/manage-travels" element={<ManageTravels />} />
                <Route path="/fleet" element={<Fleet />} />
                <Route path="/change-password" element={<ChangePassword />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/tours" element={<ManageTours />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/advertisement" element={<Advertisement />} />
                <Route path="/notifications" element={<Notifications />} />
              </Route>
              
              {/* Redirect to login if accessing root without being authenticated */}
              <Route path="/" element={<Navigate to="/login" />} />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
