import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const isAuthenticated = localStorage.getItem('token');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
    window.location.reload();
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo-container">
        <img 
          src="/images/logo.png"
          alt="DishWise" 
          className="logo"
        />
      </Link>

      <div className="auth-section">
        {!isAuthenticated ? (
          <div className="auth-buttons">
            <Link to="/login" className="auth-button login">Log In</Link>
            <Link to="/signup" className="auth-button signup">Sign Up</Link>
          </div>
        ) : (
          <div className="user-menu">
            <div className="dropdown">
              <button className="dropdown-button">
                <i className="fas fa-user"></i> My Account
              </button>
              <div className="dropdown-content">
                <Link to="/profile">Profile</Link>
                <Link to="/favorites">Favorites</Link>
                <button onClick={handleLogout} className="logout-button">
                  <i className="fas fa-sign-out-alt"></i> Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;