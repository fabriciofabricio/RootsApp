import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { DemoProvider } from './context/DemoContext';
import Layout from './layout/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import Feed from './pages/Feed';
import Moments from './pages/Moments';
import Kitchen from './pages/Kitchen';
import Operations from './pages/Operations';
import Schedules from './pages/Schedules';
import CityExplorer from './pages/CityExplorer';
import Wiki from './pages/Wiki';
import Settings from './pages/Settings';

import Profile from './pages/Profile';
import Calendar from './pages/Calendar';
import VolunteerCalendar from './pages/VolunteerCalendar';
import Location from './pages/Location';
import Shopping from './pages/Shopping';
import BarPOS from './pages/BarPOS';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useEffect } from 'react';

// Component to handle PWA updates
function UpdateChecker() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
      // Check for updates every hour
      r && setInterval(() => {
        console.log('Checking for SW update...');
        r.update();
      }, 60 * 60 * 1000);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      console.log('New content available, updating...');
      updateServiceWorker(true);
    }
  }, [needRefresh, updateServiceWorker]);

  return null;
}

import { setupForegroundMessageListener } from './services/notificationService';

// ... imports

function App() {

  useEffect(() => {
    // Setup listener for foreground messages
    setupForegroundMessageListener((payload) => {
      console.log("Foreground notification received:", payload);
      // We could also show a toast here if needed
    });
  }, []);

  return (
    <ThemeProvider>
      <UpdateChecker />
      <AuthProvider>
        <DemoProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/onboarding" element={<Onboarding />} />

              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Feed />} />
                <Route path="feed" element={<Feed />} />
                <Route path="moments" element={<Moments />} />
                <Route path="kitchen" element={<Kitchen />} />
                <Route path="operations" element={<Operations />} />
                <Route path="schedules" element={<Schedules />} />
                <Route path="city" element={<CityExplorer />} />
                <Route path="wiki" element={<Wiki />} />
                <Route path="settings" element={<Settings />} />
                <Route path="profile" element={<Profile />} />
                <Route path="volunteers" element={
                  <RestrictedRoute>
                    <VolunteerCalendar />
                  </RestrictedRoute>
                } />
                <Route path="calendar" element={
                  <RestrictedRoute>
                    <Calendar />
                  </RestrictedRoute>
                } />
                <Route path="location" element={<Location />} />
                <Route path="shopping" element={
                  <RestrictedRoute>
                    <Shopping />
                  </RestrictedRoute>
                } />
                {/* Bar POS Route */}
                <Route path="bar" element={<BarPOS />} />
              </Route>
            </Routes>
          </Router>
        </DemoProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return children;
}

function RestrictedRoute({ children }) {
  const { currentUser } = useAuth();

  if (currentUser?.role === 'volunteer') {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default App;

