import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Auth } from "@/pages/Auth";
import { Navbar } from "@/components/Navbar";
import Index from "@/pages/Index";
import { UserDashboard } from "@/pages/UserDashboard";
import { AdminDashboard } from "@/pages/AdminDashboard";
import { SuperAdminDashboard } from "@/pages/SuperAdminDashboard";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  
  if (user?.role !== 'admin' && user?.role !== 'manager') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const SuperAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const AppContent = () => {
  return (
    <Router>
      <Routes>
        {/* Public route for auth */}
        <Route path="/auth" element={<Auth />} />
        
        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Navbar />
            <Index />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Navbar />
            <UserDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminRoute>
              <Navbar />
              <AdminDashboard />
            </AdminRoute>
          </ProtectedRoute>
        } />
        
        <Route path="/superadmin" element={
          <ProtectedRoute>
            <SuperAdminRoute>
              <Navbar />
              <SuperAdminDashboard />
            </SuperAdminRoute>
          </ProtectedRoute>
        } />
        
        {/* 404 page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;