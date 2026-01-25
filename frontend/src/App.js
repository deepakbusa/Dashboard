import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import SessionsPage from './pages/SessionsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AuditLogsPage from './pages/AuditLogsPage';
import ConnectionStatus from './components/ConnectionStatus';
import { startHealthCheck, stopHealthCheck } from './utils/healthCheck';

function App() {
    useEffect(() => {
        // Start backend health monitoring
        startHealthCheck(30000); // Check every 30 seconds

        return () => {
            stopHealthCheck();
        };
    }, []);

    return (
        <AuthProvider>
            <Router>
                <ConnectionStatus />
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Layout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<DashboardPage />} />
                        <Route path="users" element={<UsersPage />} />
                        <Route path="sessions" element={<SessionsPage />} />
                        <Route path="analytics" element={<AnalyticsPage />} />
                        <Route path="audit" element={<AuditLogsPage />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;

