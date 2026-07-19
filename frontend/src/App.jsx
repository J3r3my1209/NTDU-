import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { PremiumProvider } from './context/PremiumContext.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';

// Páginas públicas (carga inmediata)
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { ForgotPassword } from './pages/ForgotPassword.jsx';

// Páginas privadas / admin (carga diferida: separan los gráficos del bundle inicial)
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx').then(m => ({ default: m.Profile })));
const Settings = lazy(() => import('./pages/Settings.jsx'));
const Premium = lazy(() => import('./pages/Premium.jsx'));
const AdminPanel = lazy(() => import('./pages/admin/AdminPanel.jsx'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers.jsx'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports.jsx'));

const Cargando = () => (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa]">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
);

function App() {
    return (
        <AuthProvider>
            <PremiumProvider>
            <Suspense fallback={<Cargando />}>
            <Routes>
                {/* ── Rutas Públicas ────────────────────── */}
                <Route path="/" element={<Landing />} />
                <Route path="/landing" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* ── Rutas Privadas ────────────────────── */}
                <Route path="/dashboard" element={
                    <PrivateRoute><Dashboard /></PrivateRoute>
                } />
                <Route path="/profile" element={
                    <PrivateRoute><Profile /></PrivateRoute>
                } />
                <Route path="/settings" element={
                    <PrivateRoute><Settings /></PrivateRoute>
                } />
                <Route path="/premium" element={
                    <PrivateRoute><Premium /></PrivateRoute>
                } />

                {/* ── Rutas Admin ───────────────────────── */}
                <Route path="/admin" element={
                    <AdminRoute><AdminPanel /></AdminRoute>
                } />
                <Route path="/admin/users" element={
                    <AdminRoute><AdminUsers /></AdminRoute>
                } />
                <Route path="/admin/reports" element={
                    <AdminRoute><AdminReports /></AdminRoute>
                } />

                {/* ── Fallback ──────────────────────────── */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </Suspense>
            </PremiumProvider>
        </AuthProvider>
    );
}

export default App;
