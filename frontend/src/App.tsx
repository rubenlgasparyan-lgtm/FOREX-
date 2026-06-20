import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/customer/Dashboard';
import Exchange from './pages/customer/Exchange';
import History from './pages/customer/History';
import AdminDashboard from './pages/admin/AdminDashboard';
import RateManagement from './pages/admin/RateManagement';
import Negotiations from './pages/admin/Negotiations';

function AppRoutes() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-navy-900">
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/exchange" element={<ProtectedRoute><Exchange /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/rates" element={<ProtectedRoute adminOnly><RateManagement /></ProtectedRoute>} />
        <Route path="/admin/negotiations" element={<ProtectedRoute adminOnly><Negotiations /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to={user ? ((['ADMIN','SUPER_ADMIN'].includes(user.role)) ? '/admin' : '/dashboard') : '/login'} replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return <AuthProvider><AppRoutes /></AuthProvider>;
}
