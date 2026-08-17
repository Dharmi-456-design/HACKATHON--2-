import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import { apiFetch } from './lib/api';

// Landing is imported eagerly for instantaneous homepage LCP
import Landing from './pages/Landing';

// Code-split all secondary and authenticated routes
const AppShell = lazy(() => import('./components/AppShell'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Lens = lazy(() => import('./pages/Lens'));
const Places = lazy(() => import('./pages/Places'));
const PlaceDetails = lazy(() => import('./pages/PlaceDetails'));
const Act = lazy(() => import('./pages/Act'));
const Journal = lazy(() => import('./pages/Journal'));
const Stories = lazy(() => import('./pages/Stories'));
const Community = lazy(() => import('./pages/Community'));
const PulseChat = lazy(() => import('./pages/PulseChat'));
const Settings = lazy(() => import('./pages/Settings'));
const BiodiversityPassport = lazy(() => import('./pages/BiodiversityPassport'));
const NatureMissions = lazy(() => import('./pages/NatureMissions'));
const CommunityBiodiversityMap = lazy(() => import('./pages/CommunityBiodiversityMap'));
const WeeklyRecap = lazy(() => import('./pages/WeeklyRecap'));
const LithosHero = lazy(() => import('./components/LithosHero'));

function RouteFallback() {
  return (
    <div className="min-h-screen bg-[#0A1610] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-[#96CD7B]/30 border-t-[#96CD7B] animate-spin" />
    </div>
  );
}

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <RouteFallback />;
  if (user) return <Navigate to="/app" replace />;
  return children;
}

function Gate({ children }) {
  const { loading } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!loading) setReady(true);
  }, [loading]);

  if (!ready) {
    return <RouteFallback />;
  }
  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/lithos" element={<LithosHero />} />
              <Route
                path="/login"
                element={
                  <PublicOnlyRoute>
                    <Login />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/signin"
                element={
                  <PublicOnlyRoute>
                    <Login />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/auth"
                element={
                  <PublicOnlyRoute>
                    <Login />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicOnlyRoute>
                    <Register />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/signup"
                element={
                  <PublicOnlyRoute>
                    <Register />
                  </PublicOnlyRoute>
                }
              />
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
                <Route path="places/:id" element={<PlaceDetails />} />
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
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
