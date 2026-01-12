import React from 'react';
import { Link } from 'react-router-dom';

function Dashboard({ children }) {
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2>FinOps</h2>
        <nav>
          <ul style={{ listStyle: 'none', marginTop: '20px' }}>
            <li><Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Overview</Link></li>
            <li><Link to="/services" style={{ color: 'white', textDecoration: 'none' }}>Services</Link></li>
            <li><Link to="/alerts" style={{ color: 'white', textDecoration: 'none' }}>Alerts</Link></li>
          </ul>
        </nav>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default Dashboard;
