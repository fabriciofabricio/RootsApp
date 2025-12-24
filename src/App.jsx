import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './layout/Layout';
import Login from './pages/Login';
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
  // Mock auth state (simplified)
  // In a real app we'd use a context
  const isAuthenticated = true;

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />

          <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
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
    </ThemeProvider>
  );
}

export default App;

