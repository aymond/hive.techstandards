import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const scrollToFeatures = () => {
    document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-page">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Manage Your Technology Portfolio</h1>
            <p>
              Track, evaluate, and make informed decisions about your organization's
              technology stack with our comprehensive lifecycle management platform.
            </p>
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary btn-large">Get Started</Link>
              <button onClick={scrollToFeatures} className="btn btn-outline btn-large">Learn More</button>
            </div>
          </div>
          <div className="hero-image">
            <img src="/images/hero-dashboard.png" alt="Platform Dashboard" />
          </div>
        </div>
      </section>
      
      <section id="features" className="features">
        <div className="container">
          <h2>Key Features</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Technology Tracking</h3>
              <p>Maintain a comprehensive catalog of all technologies used in your organization.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔄</div>
              <h3>Lifecycle Management</h3>
              <p>Track the adoption, maturity, and retirement phases of your technologies.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Multi-Tenant Support</h3>
              <p>Manage technology portfolios across different departments or organizations.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📑</div>
              <h3>Change Requests</h3>
              <p>Streamline the process of requesting and approving technology changes.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👤</div>
              <h3>Role-Based Access</h3>
              <p>Control permissions with admin, editor, and viewer user roles.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Search & Filter</h3>
              <p>Quickly find technologies by capability, vendor, or lifecycle status.</p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="cta">
        <div className="container">
          <h2>Ready to Get Started?</h2>
          <p>Create your account today and start managing your technology portfolio.</p>
          <Link to="/register" className="btn btn-primary btn-large">Sign Up Now</Link>
        </div>
      </section>
      
      <footer className="landing-footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Technology Lifecycle Manager</p>
          <div className="footer-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/contact">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 