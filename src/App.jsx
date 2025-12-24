import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
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
import VolunteerCalendar from './pages/VolunteerCalendar';
import Location from './pages/Location';
import Shopping from './pages/Shopping';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
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
              <Route path="moments" element={<Moments />} />
              <Route path="kitchen" element={<Kitchen />} />
              <Route path="operations" element={<Operations />} />
              <Route path="schedules" element={<Schedules />} />
              <Route path="city" element={<CityExplorer />} />
              <Route path="wiki" element={<Wiki />} />
              <Route path="settings" element={<Settings />} />
              <Route path="profile" element={<Profile />} />
              <Route path="volunteers" element={<VolunteerCalendar />} />
              <Route path="location" element={<Location />} />
              <Route path="shopping" element={<Shopping />} />
            </Route>
          </Routes>
        </Router>
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

export default App;

