import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import StudentLogin from './pages/StudentLogin';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminChat from './pages/AdminChat';
import StudentList from './pages/StudentList';
import CsvUpload from './pages/CsvUpload';
import Predictor from './pages/Predictor';
import AskQuestion from './pages/AskQuestion';
import Results from './pages/Results';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/student-login" element={<StudentLogin />} />
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* Student Protected Routes */}
          <Route path="/predict" element={
            <ProtectedRoute>
              <Predictor />
            </ProtectedRoute>
          } />
          <Route path="/results" element={
            <ProtectedRoute>
              <Results />
            </ProtectedRoute>
          } />
          <Route path="/ask-question" element={
            <ProtectedRoute>
              <AskQuestion />
            </ProtectedRoute>
          } />

          {/* Admin Protected Routes */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/students" element={
            <ProtectedRoute adminOnly={true}>
              <StudentList />
            </ProtectedRoute>
          } />
          <Route path="/admin/upload" element={
            <ProtectedRoute adminOnly={true}>
              <CsvUpload />
            </ProtectedRoute>
          } />
          <Route path="/admin/chat" element={
            <ProtectedRoute adminOnly={true}>
              <AdminChat />
            </ProtectedRoute>
          } />

          {/* 404 Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
      <Analytics />
    </Router>
  );
}

export default App;
