import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Dashboard({ children }) {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const linkStyle = (path) => ({
    color: 'white',
    textDecoration: 'none',
    display: 'block',
    padding: '10px 15px',
    borderRadius: '4px',
    backgroundColor: isActive(path) ? 'rgba(255,255,255,0.15)' : 'transparent',
    marginBottom: '4px'
  });

  const sectionStyle = {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginTop: '20px',
    marginBottom: '8px',
    paddingLeft: '15px'
  };

  return (
    <div className="dashboard">
      <aside className="sidebar" style={{ width: '220px', background: '#1a1a2e', minHeight: '100vh', padding: '20px 10px' }}>
        <h2 style={{ color: 'white', margin: '0 0 10px 15px', fontSize: '20px' }}>FinOps</h2>
        <nav>
          <div style={sectionStyle}>Cost Management</div>
          <Link to="/" style={linkStyle('/')}>Overview</Link>
          <Link to="/services" style={linkStyle('/services')}>Services</Link>
          <Link to="/alerts" style={linkStyle('/alerts')}>Alerts</Link>

          <div style={sectionStyle}>Resources</div>
          <Link to="/resources" style={linkStyle('/resources')}>Inventory</Link>
          <Link to="/compliance" style={linkStyle('/compliance')}>Tag Compliance</Link>

          <div style={sectionStyle}>Planning</div>
          <Link to="/budgets" style={linkStyle('/budgets')}>Budgets</Link>
          <Link to="/simulation" style={linkStyle('/simulation')}>What-If Simulator</Link>

          <div style={sectionStyle}>Reporting</div>
          <Link to="/reports" style={linkStyle('/reports')}>Reports</Link>
        </nav>
      </aside>
      <main className="main-content" style={{ flex: 1, background: '#f5f5f5', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
}

export default Dashboard;
