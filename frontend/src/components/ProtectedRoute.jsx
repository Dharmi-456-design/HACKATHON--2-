import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading, isDemoUser } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-moss/30 border-t-moss animate-spin" />
          <p className="text-sm text-forest/60 font-sans">Listening for the quiet…</p>
        </div>
      </div>
    );
  }
  // Allow real users OR demo users
  if (!user && !isDemoUser) return <Navigate to="/login" replace />;
  return children;
}
