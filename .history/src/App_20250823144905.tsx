import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CampanhaInscricaoPage from './pages/CampanhaInscricaoPage';
// ...existing imports...

// Context
import { AuthProvider } from './contexts/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import LoginPacientePage from './pages/LoginPacientePage';
import LoginSistemaPage from './pages/LoginSistemaPage';
import RegisterPacientePage from './pages/RegisterPacientePage';

// Protected Routes
import ProtectedRoute from './components/ProtectedRoute';

// Dashboards
import AdminDashboard from './pages/dashboards/AdminDashboard';
import UBSDashboard from './pages/dashboards/UBSDashboard';
import FuncionarioDashboard from './pages/dashboards/FuncionarioDashboard';
import LaboratorioDashboard from './pages/dashboards/LaboratorioDashboard';
import PacienteDashboard from './pages/dashboards/PacienteDashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
            <Routes>
              {/* Rotas públicas */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login-paciente" element={<LoginPacientePage />} />
              <Route path="/login-sistema" element={<LoginSistemaPage />} />
              <Route path="/cadastro-paciente" element={<RegisterPacientePage />} />
              <Route path="/campanha/:id" element={<CampanhaInscricaoPage />} />

              {/* Rotas protegidas */}
              <Route path="/admin/*" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/h/*" element={
                <ProtectedRoute allowedRoles={['ubs']}>
                  <UBSDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/ubs/*" element={
                <ProtectedRoute allowedRoles={['ubs']}>
                  <UBSDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/funcionario/*" element={
                <ProtectedRoute allowedRoles={['funcionario']}>
                  <FuncionarioDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/laboratorio/*" element={
                <ProtectedRoute allowedRoles={['laboratorio']}>
                  <LaboratorioDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/paciente/*" element={
                <ProtectedRoute allowedRoles={['paciente']}>
                  <PacienteDashboard />
                </ProtectedRoute>
              } />

              {/* Rota padrão */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            className="mt-16"
          />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;