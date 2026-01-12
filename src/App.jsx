import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Overview from './pages/Overview';
import Services from './pages/Services';
import Alerts from './pages/Alerts';

function App() {
  return (
    <Router>
      <Dashboard>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/services" element={<Services />} />
          <Route path="/alerts" element={<Alerts />} />
        </Routes>
      </Dashboard>
    </Router>
  );
}

export default App;
