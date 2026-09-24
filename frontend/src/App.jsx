import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DonorDashboard } from './pages/donor/DonorDashboard';
import { CreateDonationPage } from './pages/donor/CreateDonationPage';
import { NgoDashboard } from './pages/ngo/NgoDashboard';
import { BeneficiaryDashboard } from './pages/beneficiary/BeneficiaryDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { PickupTrackingPage } from './pages/PickupTrackingPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';

function AppContent() {
  const { user, isAuthenticated } = useAuth();

  // Simple, robust hash-based client routing for zero-configuration deployment
  const getInitialRoute = () => {
    const hash = window.location.hash.replace('#', '') || 'landing';
    return hash;
  };

  const [currentRoute, setCurrentRoute] = useState(getInitialRoute);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'landing';
      setCurrentRoute(hash);
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (route) => {
    window.location.hash = route;
    setCurrentRoute(route);
    window.scrollTo(0, 0);
  };

  // Render appropriate view based on route
  const renderPage = () => {
    // If tracking pickup with query params
    if (currentRoute.startsWith('pickup-track')) {
      return (
        <ProtectedRoute>
          <PickupTrackingPage navigate={navigate} />
        </ProtectedRoute>
      );
    }

    switch (currentRoute) {
      case 'landing':
        return <LandingPage navigate={navigate} />;

      case 'login':
        return <LoginPage navigate={navigate} />;

      case 'register':
        return <RegisterPage navigate={navigate} />;

      case 'donor-dashboard':
        return (
          <ProtectedRoute allowedRoles={['DONOR']}>
            <DonorDashboard navigate={navigate} />
          </ProtectedRoute>
        );

      case 'create-donation':
        return (
          <ProtectedRoute allowedRoles={['DONOR']}>
            <CreateDonationPage navigate={navigate} />
          </ProtectedRoute>
        );

      case 'ngo-dashboard':
        return (
          <ProtectedRoute allowedRoles={['NGO']}>
            <NgoDashboard navigate={navigate} />
          </ProtectedRoute>
        );

      case 'beneficiary-dashboard':
        return (
          <ProtectedRoute allowedRoles={['BENEFICIARY']}>
            <BeneficiaryDashboard navigate={navigate} />
          </ProtectedRoute>
        );

      case 'admin-dashboard':
        return (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard navigate={navigate} />
          </ProtectedRoute>
        );

      case 'notifications':
        return (
          <ProtectedRoute>
            <NotificationsPage navigate={navigate} />
          </ProtectedRoute>
        );

      case 'profile':
        return (
          <ProtectedRoute>
            <ProfilePage navigate={navigate} />
          </ProtectedRoute>
        );

      default:
        return <LandingPage navigate={navigate} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar currentRoute={currentRoute} navigate={navigate} />
      <main style={{ flex: 1 }}>
        {renderPage()}
      </main>
      <Footer navigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
