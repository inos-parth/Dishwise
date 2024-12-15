import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import { ThemeProvider } from './context/ThemeContext';
import './styles/theme.css';
import MenuPage from './pages/MenuPage';
// Lazy load the routes
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const RestaurantResults = React.lazy(() => import('./pages/RestaurantResults'));
const Login = React.lazy(() => import('./pages/auth/AuthPages').then(module => ({ default: module.Login })));
const Signup = React.lazy(() => import('./pages/auth/AuthPages').then(module => ({ default: module.Signup })));
const Profile = React.lazy(() => import('./pages/Profile'));
const Favorites = React.lazy(() => import('./pages/Favorites'));


function App() {
  return (
    <ThemeProvider>
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/restaurants" element={<RestaurantResults />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/restaurant/:placeId/menu" element={<MenuPage />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </Router>
    </ThemeProvider>
  );
}

export default App;