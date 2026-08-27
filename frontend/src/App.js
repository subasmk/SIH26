import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProjects from './pages/admin/Projects';
import AdminProjectDetail from './pages/admin/ProjectDetail';
import AdminInspectors from './pages/admin/Inspectors';
import AdminInspections from './pages/admin/Inspections';
import AdminAlerts from './pages/admin/Alerts';
import InspectorDashboard from './pages/inspector/Dashboard';
import InspectionDetail from './pages/inspector/InspectionDetail';
import OrganizationDashboard from './pages/organization/Dashboard';
import OrganizationProjects from './pages/organization/Projects';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<PrivateRoute allowedRoles={['ADMIN']}><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/dashboard" element={<PrivateRoute allowedRoles={['ADMIN']}><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/projects" element={<PrivateRoute allowedRoles={['ADMIN']}><AdminProjects /></PrivateRoute>} />
          <Route path="/admin/projects/:id" element={<PrivateRoute allowedRoles={['ADMIN']}><AdminProjectDetail /></PrivateRoute>} />
          <Route path="/admin/inspectors" element={<PrivateRoute allowedRoles={['ADMIN']}><AdminInspectors /></PrivateRoute>} />
          <Route path="/admin/inspections" element={<PrivateRoute allowedRoles={['ADMIN']}><AdminInspections /></PrivateRoute>} />
          <Route path="/admin/alerts" element={<PrivateRoute allowedRoles={['ADMIN']}><AdminAlerts /></PrivateRoute>} />
          <Route path="/inspector" element={<PrivateRoute allowedRoles={['INSPECTOR']}><InspectorDashboard /></PrivateRoute>} />
          <Route path="/inspector/dashboard" element={<PrivateRoute allowedRoles={['INSPECTOR']}><InspectorDashboard /></PrivateRoute>} />
          <Route path="/inspector/inspection/:id" element={<PrivateRoute allowedRoles={['INSPECTOR']}><InspectionDetail /></PrivateRoute>} />
          <Route path="/organization" element={<PrivateRoute allowedRoles={['ORGANIZATION']}><OrganizationDashboard /></PrivateRoute>} />
          <Route path="/organization/dashboard" element={<PrivateRoute allowedRoles={['ORGANIZATION']}><OrganizationDashboard /></PrivateRoute>} />
          <Route path="/organization/projects" element={<PrivateRoute allowedRoles={['ORGANIZATION']}><OrganizationProjects /></PrivateRoute>} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
