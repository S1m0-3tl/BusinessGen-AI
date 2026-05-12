import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { useState } from 'react';
import Layout from './components/Layout';
import DiscoveryFeed from './components/DiscoveryFeed';
import Auth from './Auth';
import GeneratorDashboard from './pages/GeneratorDashboard';
import Library from './pages/Library';
import MarketInsights from './pages/MarketInsights';
import Chatbot from './pages/Chatbot';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('access'));

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
  };

  const privateRoute = (element) => (
    isAuthenticated ? element : <Navigate to="/login" />
  );

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/generate" /> : <Auth onLoginSuccess={handleLoginSuccess} />}
        />
        <Route
          path="/"
          element={(
            <Layout isAuthenticated={isAuthenticated} onLogout={handleLogout}>
              <DiscoveryFeed />
            </Layout>
          )}
        />
        <Route
          path="/generate"
          element={(
            <Layout isAuthenticated={isAuthenticated} onLogout={handleLogout}>
              {privateRoute(<GeneratorDashboard />)}
            </Layout>
          )}
        />
        <Route
          path="/library"
          element={(
            <Layout isAuthenticated={isAuthenticated} onLogout={handleLogout}>
              {privateRoute(<Library />)}
            </Layout>
          )}
        />
        <Route
          path="/market-insights"
          element={(
            <Layout isAuthenticated={isAuthenticated} onLogout={handleLogout}>
              {privateRoute(<MarketInsights />)}
            </Layout>
          )}
        />
        <Route
          path="/chatbot"
          element={(
            <Layout isAuthenticated={isAuthenticated} onLogout={handleLogout}>
              {privateRoute(<Chatbot />)}
            </Layout>
          )}
        />
      </Routes>
    </Router>
  );
}

export default App;
