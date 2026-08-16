import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppShell from './components/AppShell';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Lens from './pages/Lens';
import Places from './pages/Places';
import Act from './pages/Act';
import Journal from './pages/Journal';
import Stories from './pages/Stories';
import Community from './pages/Community';
import PulseChat from './pages/PulseChat';
import Settings from './pages/Settings';
import BiodiversityPassport from './pages/BiodiversityPassport';
import NatureMissions from './pages/NatureMissions';
import CommunityBiodiversityMap from './pages/CommunityBiodiversityMap';
import WeeklyRecap from './pages/WeeklyRecap';
import LithosHero from './components/LithosHero';
import { useEffect, useState } from 'react';
import { apiFetch } from './lib/api';

function Gate({ children }) {
  const { session, loading } = useAuth();
  const [ready, setReady] = useState(false);
  const [onboarded, setOnboarded] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!session?.access_token) {
      setReady(true);
      return;
    }
    apiFetch('/api/profile', {}, session.access_token)
      .then((p) => setOnboarded(p?.onboarding_complete !== false))
      .catch(() => setOnboarded(true))
      .finally(() => setReady(true));
  }, [session, loading]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-moss/30 border-t-moss animate-spin" />
      </div>
    );
  }
  if (!onboarded) return <Navigate to="/onboarding" replace />;
  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/lithos" element={<LithosHero />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <Gate>
                    <AppShell />
                  </Gate>
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="lens" element={<Lens />} />
              <Route path="places" element={<Places />} />
              <Route path="act" element={<Act />} />
              <Route path="journal" element={<Journal />} />
              <Route path="stories" element={<Stories />} />
              <Route path="community" element={<Community />} />
              <Route path="pulse" element={<PulseChat />} />
              <Route path="settings" element={<Settings />} />
              <Route path="passport" element={<BiodiversityPassport />} />
              <Route path="missions" element={<NatureMissions />} />
              <Route path="community-map" element={<CommunityBiodiversityMap />} />
              <Route path="recap" element={<WeeklyRecap />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
