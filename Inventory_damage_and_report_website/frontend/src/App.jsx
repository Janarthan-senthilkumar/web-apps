import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import StaffDashboard from './pages/StaffDashboard';
import SupervisorDashboard from './pages/SupervisorDashboard';
import InventoryList from './pages/InventoryList';
import InventoryForm from './pages/InventoryForm';
import DamageList from './pages/DamageList';
import DamageForm from './pages/DamageForm';
import ReplacementList from './pages/ReplacementList';
import ReplacementForm from './pages/ReplacementForm';
import AnalyticsPage from './pages/AnalyticsPage';
import LoadingSpinner from './components/LoadingSpinner';

function DashboardRouter() {
    const { isSupervisor } = useAuth();
    return isSupervisor ? <SupervisorDashboard /> : <StaffDashboard />;
}

function App() {
    const { loading } = useAuth();

    if (loading) {
        return <LoadingSpinner text="Loading..." />;
    }

    return (
        <Routes>
            {/* Public route */}
            <Route path="/login" element={<Login />} />

            {/* Protected routes */}
            <Route path="/" element={
                <ProtectedRoute>
                    <Layout><DashboardRouter /></Layout>
                </ProtectedRoute>
            } />
            <Route path="/inventory" element={
                <ProtectedRoute>
                    <Layout><InventoryList /></Layout>
                </ProtectedRoute>
            } />
            <Route path="/inventory/add" element={
                <ProtectedRoute>
                    <Layout><InventoryForm /></Layout>
                </ProtectedRoute>
            } />
            <Route path="/inventory/edit/:id" element={
                <ProtectedRoute>
                    <Layout><InventoryForm /></Layout>
                </ProtectedRoute>
            } />
            <Route path="/damages" element={
                <ProtectedRoute>
                    <Layout><DamageList /></Layout>
                </ProtectedRoute>
            } />
            <Route path="/damages/add" element={
                <ProtectedRoute roles={['staff']}>
                    <Layout><DamageForm /></Layout>
                </ProtectedRoute>
            } />
            <Route path="/damages/edit/:id" element={
                <ProtectedRoute>
                    <Layout><DamageForm /></Layout>
                </ProtectedRoute>
            } />
            <Route path="/replacements" element={
                <ProtectedRoute>
                    <Layout><ReplacementList /></Layout>
                </ProtectedRoute>
            } />
            <Route path="/replacements/add" element={
                <ProtectedRoute roles={['supervisor']}>
                    <Layout><ReplacementForm /></Layout>
                </ProtectedRoute>
            } />
            <Route path="/replacements/edit/:id" element={
                <ProtectedRoute roles={['supervisor']}>
                    <Layout><ReplacementForm /></Layout>
                </ProtectedRoute>
            } />
            <Route path="/analytics" element={
                <ProtectedRoute roles={['supervisor']}>
                    <Layout><AnalyticsPage /></Layout>
                </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
