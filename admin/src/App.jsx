import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuthStore } from './store/auth';
import Login from './pages/Login';
import Layout from './components/Layout';
import LoadingScreen from './components/LoadingScreen';

// Lazy-load admin pages so the initial bundle is small (ultra-fast first paint)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ManageApp = lazy(() => import('./pages/ManageApp'));
const Uploads = lazy(() => import('./pages/Uploads'));
const Users = lazy(() => import('./pages/Users'));
const Settings = lazy(() => import('./pages/Settings'));

function ProtectedRoute({ children }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Suspense fallback={<LoadingScreen />}><Dashboard /></Suspense>} />
        <Route path="app" element={<Suspense fallback={<LoadingScreen />}><ManageApp /></Suspense>} />
        <Route path="uploads" element={<Suspense fallback={<LoadingScreen />}><Uploads /></Suspense>} />
        <Route path="users" element={<Suspense fallback={<LoadingScreen />}><Users /></Suspense>} />
        <Route path="settings" element={<Suspense fallback={<LoadingScreen />}><Settings /></Suspense>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
