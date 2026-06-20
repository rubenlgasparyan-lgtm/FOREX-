import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly }: Props) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-cyan-400">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
