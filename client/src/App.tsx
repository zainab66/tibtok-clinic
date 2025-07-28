import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import PatientPage from './pages/PatientPage';
import AppointmentsPage from './pages/AppointmentsPage';
import FeaturesPage from './pages/FeaturesPage';
import NotFoundPage from './pages/NotFoundPage';
import SettingsPage from './pages/SettingsPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute'; // <--- Import PublicRoute
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from './pages/Home';
import SessionsPage from './pages/SessionsPage';
import CreateSessionPage from './pages/CreateSessionPage';
import SessionDetailsPage from './pages/SessionDetailsPage';
import SessionEditPage from './pages/SessionEditPage';

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />

      <Routes>
        <Route path="/" element={<Home />} />

        {/* Use PublicRoute for Login and Register pages */}
        <Route
          path="/login"
          element={
            <PublicRoute> {/* <--- Wrap LoginPage with PublicRoute */}
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute> {/* <--- Wrap RegisterPage with PublicRoute */}
              <RegisterPage />
            </PublicRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="patients" element={<PatientPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="features" element={<FeaturesPage />} />

 {/* ✅ Add these new routes inside dashboard layout */}
  <Route path="sessions" element={<SessionsPage />} />
  <Route path="sessions/create" element={<CreateSessionPage />} />
<Route path="session/:sessionId" element={<SessionDetailsPage />} />
<Route path="sessions/edit/:sessionId" element={<SessionEditPage />} />

          
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;